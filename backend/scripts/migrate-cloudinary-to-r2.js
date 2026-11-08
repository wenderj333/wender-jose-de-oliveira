#!/usr/bin/env node
// Resgata as fotos/vídeos/áudios antigos do Cloudinary para o Cloudflare R2.
//
// Como funciona:
//  1. Procura em TODAS as colunas de texto/JSON da base de dados os endereços
//     https://res.cloudinary.com/<cloud>/...
//  2. Baixa cada ficheiro (só funciona com a conta do Cloudinary ATIVA).
//  3. Envia para o R2 e troca o endereço antigo pelo novo na base de dados.
//
// É seguro correr várias vezes: guarda o que já foi feito na tabela media_migration
// e só troca um endereço depois de o ficheiro novo estar no R2.
//
// Uso (no Shell do Render):
//   node scripts/migrate-cloudinary-to-r2.js            -> só conta (não muda nada)
//   node scripts/migrate-cloudinary-to-r2.js --run      -> copia e troca os endereços
//   node scripts/migrate-cloudinary-to-r2.js --run --limit 50   -> em lotes
require('dotenv').config();
const db = require('../src/db/connection');
const storage = require('../src/services/storage');

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const BASE = process.env.MIGRATE_SOURCE_BASE || `https://res.cloudinary.com/${CLOUD}/`;
const RUN = process.argv.includes('--run');
const li = process.argv.indexOf('--limit');
const LIMIT = li > -1 ? Number(process.argv[li + 1]) || 0 : 0;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const URL_RE = new RegExp(esc(BASE) + `[^\\s"'<>(){}\\\\]+`, 'g');

const EXT_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  heic: 'image/heic', heif: 'image/heif', avif: 'image/avif', svg: 'image/svg+xml',
  mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', m4v: 'video/x-m4v', '3gp': 'video/3gpp',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav', aac: 'audio/aac', pdf: 'application/pdf',
};

async function textColumns() {
  const r = await db.query(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'json', 'jsonb', 'ARRAY')
      AND table_name NOT IN ('media_migration')
    ORDER BY table_name, column_name`);
  return r.rows;
}

const q = (id) => '"' + String(id).replace(/"/g, '""') + '"';

async function findUrls(cols) {
  const found = new Map(); // url -> [{table, column}]
  for (const c of cols) {
    let rows;
    try {
      const sel = c.data_type === 'ARRAY' ? `unnest(${q(c.column_name)})::text` : `${q(c.column_name)}::text`;
      rows = (await db.query(
        `SELECT ${sel} AS v FROM ${q(c.table_name)} WHERE ${q(c.column_name)}::text LIKE $1`,
        ['%' + BASE + '%'])).rows;
    } catch (e) { console.warn(`  (ignorado ${c.table_name}.${c.column_name}: ${e.message})`); continue; }
    for (const { v } of rows) {
      for (const u of String(v).match(URL_RE) || []) {
        const clean = u.replace(/[.,;:!?]+$/, '');
        if (!found.has(clean)) found.set(clean, new Set());
        found.get(clean).add(`${c.table_name}.${c.column_name}`);
      }
    }
  }
  return found;
}

function typeFor(url, header) {
  const h = String(header || '').split(';')[0].trim().toLowerCase();
  if (h && h !== 'application/octet-stream' && h !== 'binary/octet-stream') return h;
  const ext = url.split('?')[0].split('.').pop().toLowerCase();
  return EXT_TYPES[ext] || 'application/octet-stream';
}

async function copyOne(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${r.status}${r.headers.get('x-cld-error') ? ' ' + r.headers.get('x-cld-error') : ''}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const type = typeFor(url, r.headers.get('content-type'));
  return storage.putBuffer(buf, 'legacy', type, { legacy: true });
}

async function replaceEverywhere(cols, oldUrl, newUrl) {
  let n = 0;
  for (const c of cols) {
    const col = q(c.column_name); const t = q(c.table_name);
    let sql;
    if (c.data_type === 'jsonb') sql = `UPDATE ${t} SET ${col} = replace(${col}::text, $1, $2)::jsonb WHERE ${col}::text LIKE $3`;
    else if (c.data_type === 'json') sql = `UPDATE ${t} SET ${col} = replace(${col}::text, $1, $2)::json WHERE ${col}::text LIKE $3`;
    else if (c.data_type === 'ARRAY') sql = `UPDATE ${t} SET ${col} = array(SELECT replace(x, $1, $2) FROM unnest(${col}) x) WHERE ${col}::text LIKE $3`;
    else sql = `UPDATE ${t} SET ${col} = replace(${col}, $1, $2) WHERE ${col} LIKE $3`;
    try { n += (await db.query(sql, [oldUrl, newUrl, '%' + oldUrl + '%'])).rowCount; }
    catch (e) { console.warn(`  (não troquei em ${c.table_name}.${c.column_name}: ${e.message})`); }
  }
  return n;
}

async function main() {
  await db.query(`CREATE TABLE IF NOT EXISTS media_migration (
    old_url TEXT PRIMARY KEY, new_url TEXT, status TEXT NOT NULL DEFAULT 'pending',
    error TEXT, rows_updated INT DEFAULT 0, updated_at TIMESTAMPTZ DEFAULT NOW())`);

  const cols = await textColumns();
  console.log(`A procurar endereços do Cloudinary em ${cols.length} colunas…`);
  const found = await findUrls(cols);
  console.log(`Encontrados ${found.size} ficheiros diferentes.`);
  const byTable = {};
  for (const set of found.values()) for (const tc of set) byTable[tc] = (byTable[tc] || 0) + 1;
  for (const [tc, n] of Object.entries(byTable).sort((a, b) => b[1] - a[1])) console.log(`  ${tc}: ${n}`);

  if (!RUN) { console.log('\nNada foi alterado. Para copiar de verdade: --run'); return; }
  if (!storage.isConfigured()) throw new Error('R2 não está configurado (variáveis R2_*).');

  let ok = 0, fail = 0, done = 0;
  // mais compridos primeiro: um endereço nunca é trocado dentro de outro maior
  for (const url of [...found.keys()].sort((a, b) => b.length - a.length)) {
    if (LIMIT && done >= LIMIT) break;
    const prev = (await db.query('SELECT new_url, status FROM media_migration WHERE old_url = $1', [url])).rows[0];
    let newUrl = prev && prev.status === 'done' ? prev.new_url : null;
    done++;
    try {
      if (!newUrl) newUrl = await copyOne(url);
      const n = await replaceEverywhere(cols, url, newUrl);
      await db.query(`INSERT INTO media_migration (old_url, new_url, status, rows_updated, updated_at)
        VALUES ($1, $2, 'done', $3, NOW())
        ON CONFLICT (old_url) DO UPDATE SET new_url = $2, status = 'done', error = NULL,
          rows_updated = media_migration.rows_updated + $3, updated_at = NOW()`, [url, newUrl, n]);
      ok++;
      if (ok % 25 === 0) console.log(`  … ${ok} copiados`);
    } catch (e) {
      fail++;
      await db.query(`INSERT INTO media_migration (old_url, status, error, updated_at) VALUES ($1, 'failed', $2, NOW())
        ON CONFLICT (old_url) DO UPDATE SET status = 'failed', error = $2, updated_at = NOW()`, [url, e.message]);
      console.warn(`  FALHOU ${url}: ${e.message}`);
    }
  }
  console.log(`\nPronto: ${ok} copiados, ${fail} falharam (ver tabela media_migration).`);
  if (fail) console.log('Pode correr de novo: só tenta outra vez os que faltam.');
}

main().then(() => process.exit(0)).catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
