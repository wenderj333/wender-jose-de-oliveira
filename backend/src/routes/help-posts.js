const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const { createNotification } = require('./notifications');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sigo-com-fe-secret-dev';

// Auto-create tables
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS help_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) DEFAULT 'general',
        post_type VARCHAR(30) DEFAULT 'request',
        content TEXT NOT NULL,
        pix_key TEXT,
        is_anonymous BOOLEAN DEFAULT false,
        media_url TEXT,
        prayer_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS help_post_prayers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES help_posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS help_post_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES help_posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        pix_key TEXT,
        is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.query('ALTER TABLE help_posts ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false');
    await db.query('ALTER TABLE help_post_comments ADD COLUMN IF NOT EXISTS is_pastoral BOOLEAN DEFAULT false');
    await db.query('ALTER TABLE help_post_comments ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE SET NULL');
    await db.query("ALTER TABLE help_posts ADD COLUMN IF NOT EXISTS help_status VARCHAR(20) NOT NULL DEFAULT 'open'");
    await db.query('ALTER TABLE help_posts ADD COLUMN IF NOT EXISTS answer_testimony TEXT');
    await db.query('ALTER TABLE help_posts ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ');
    await db.query(`CREATE TABLE IF NOT EXISTS help_post_supporters (
      post_id UUID REFERENCES help_posts(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (post_id, user_id)
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS help_post_churches (
      post_id UUID REFERENCES help_posts(id) ON DELETE CASCADE,
      church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (post_id, church_id)
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS help_post_church_acknowledgements (
      post_id UUID REFERENCES help_posts(id) ON DELETE CASCADE,
      church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
      pastor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (post_id, church_id)
    )`);
    console.log('✅ help_posts tables ready');
  } catch (err) {
    console.error('❌ help_posts migration error:', err.message);
  }
})();

// Optional auth middleware
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      req.user = decoded;
    } catch (e) { /* ignore */ }
  }
  next();
}

// ---- Presença na Oração Mundial: quem está orando agora (em memória) ----
const prayerPresence = new Map(); // userId -> { name, avatar_url, since, lastSeen, room }
const PRAYER_ROOMS = new Set(['geral', 'saude', 'familia', 'financas', 'emprego', 'casamento', 'filhos', 'libertacao', 'paz', 'gratidao']);
const PRESENCE_TTL = 75 * 1000;
// Salas privadas: código de 6 letras/números, ex.: p-K7M2QX
const PRIVATE_ROOM_RE = /^p-[A-Z0-9]{6}$/;
const isPrivateRoom = (room) => PRIVATE_ROOM_RE.test(String(room || ''));
const validRoom = (room) => PRAYER_ROOMS.has(String(room)) || isPrivateRoom(room);
db.query(`CREATE TABLE IF NOT EXISTS prayer_private_rooms (
  code VARCHAR(6) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW()
)`).catch(e => console.error('prayer_private_rooms', e.message));
function activePresence() {
  const now = Date.now();
  for (const [id, p] of prayerPresence) if (now - p.lastSeen > PRESENCE_TTL) prayerPresence.delete(id);
  return [...prayerPresence.entries()].sort((a, b) => a[1].since - b[1].since).map(([user_id, p]) => ({ user_id, name: p.name, avatar_url: p.avatar_url, room: p.room || 'geral', since: new Date(p.since).toISOString() }));
}
function presencePayload(room) {
  const everyone = activePresence();
  // Junta quem está na sala de voz (mesmo que o aparelho não tenha avisado a presença)
  try {
    const seen = new Set(everyone.map(p => String(p.user_id)));
    for (const v of require('../websocket').voicePresence()) {
      if (seen.has(v.user_id)) continue;
      seen.add(v.user_id);
      everyone.push({ ...v, since: new Date().toISOString() });
    }
  } catch (_) { /* sem sala de voz */ }
  const rooms = {};
  // Quem está numa sala privada não aparece na sala geral nem nas contagens públicas
  const publicPeople = everyone.filter(person => !isPrivateRoom(person.room));
  for (const person of publicPeople) rooms[person.room] = (rooms[person.room] || 0) + 1;
  const people = room && room !== 'geral' ? everyone.filter(person => person.room === room) : publicPeople;
  return { count: people.length, total: publicPeople.length, rooms, people: people.slice(0, 80) };
}

// ---- Inauguração da Oração Mundial + avisos "há pessoas orando" ----
const LAUNCH_AT = new Date(process.env.PRAYER_LAUNCH_AT || '2026-11-01T19:00:00Z'); // domingo 1/11, 20h Espanha
db.query(`CREATE TABLE IF NOT EXISTS prayer_launch_signups (user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, lang VARCHAR(5), tz VARCHAR(64), created_at TIMESTAMP DEFAULT NOW())`).catch(e => console.error('prayer_launch_signups', e.message));
db.query(`CREATE TABLE IF NOT EXISTS prayer_launch_sent (stage VARCHAR(30) PRIMARY KEY, sent_at TIMESTAMP DEFAULT NOW())`).catch(e => console.error('prayer_launch_sent', e.message));
db.query(`CREATE TABLE IF NOT EXISTS prayer_alert_subs (user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, lang VARCHAR(5), tz VARCHAR(64), last_sent TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())`).catch(e => console.error('prayer_alert_subs', e.message));

const LAUNCH_TEXT = {
  pt: { day: ['🙏 Amanhã: inauguração da Oração Mundial', 'Amanhã vamos orar juntos com irmãos de vários países. Não falte!'], soon: ['⏰ Em 15 minutos começa a Oração Mundial', 'Prepare o seu coração e entre na sala de voz.'], now: ['🎉 Começou a Oração Mundial!', 'Entre agora e ore junto com irmãos do mundo inteiro.'], praying: ['🟢 Há pessoas orando agora', '{n} pessoas estão na Oração Mundial. Venha orar junto!'] },
  es: { day: ['🙏 Mañana: inauguración de la Oración Mundial', 'Mañana oraremos juntos con hermanos de varios países. ¡No faltes!'], soon: ['⏰ En 15 minutos empieza la Oración Mundial', 'Prepara tu corazón y entra en la sala de voz.'], now: ['🎉 ¡Empezó la Oración Mundial!', 'Entra ahora y ora junto con hermanos de todo el mundo.'], praying: ['🟢 Hay personas orando ahora', '{n} personas están en la Oración Mundial. ¡Ven a orar!'] },
  en: { day: ['🙏 Tomorrow: World Prayer launch', 'Tomorrow we will pray together with believers from many countries. Don’t miss it!'], soon: ['⏰ World Prayer starts in 15 minutes', 'Prepare your heart and join the voice room.'], now: ['🎉 World Prayer has started!', 'Join now and pray with believers from all over the world.'], praying: ['🟢 People are praying now', '{n} people are in World Prayer. Come and pray with them!'] },
  de: { day: ['🙏 Morgen: Start des Weltgebets', 'Morgen beten wir gemeinsam mit Gläubigen aus vielen Ländern. Sei dabei!'], soon: ['⏰ In 15 Minuten beginnt das Weltgebet', 'Bereite dein Herz vor und komm in den Sprachraum.'], now: ['🎉 Das Weltgebet hat begonnen!', 'Komm jetzt und bete mit Gläubigen aus aller Welt.'], praying: ['🟢 Gerade wird gebetet', '{n} Menschen sind im Weltgebet. Bete mit!'] },
  fr: { day: ['🙏 Demain : lancement de la Prière Mondiale', 'Demain, nous prierons ensemble avec des croyants de nombreux pays. Ne manquez pas ça !'], soon: ['⏰ La Prière Mondiale commence dans 15 minutes', 'Préparez votre cœur et entrez dans la salle vocale.'], now: ['🎉 La Prière Mondiale a commencé !', 'Entrez maintenant et priez avec des croyants du monde entier.'], praying: ['🟢 Des personnes prient en ce moment', '{n} personnes sont dans la Prière Mondiale. Venez prier !'] },
  ro: { day: ['🙏 Mâine: lansarea Rugăciunii Mondiale', 'Mâine ne rugăm împreună cu frați din multe țări. Nu lipsi!'], soon: ['⏰ În 15 minute începe Rugăciunea Mondială', 'Pregătește-ți inima și intră în camera vocală.'], now: ['🎉 A început Rugăciunea Mondială!', 'Intră acum și roagă-te cu frați din toată lumea.'], praying: ['🟢 Sunt oameni care se roagă acum', '{n} persoane sunt în Rugăciunea Mondială. Vino să te rogi!'] },
  ru: { day: ['🙏 Завтра: открытие Мировой молитвы', 'Завтра мы будем молиться вместе с верующими из многих стран. Не пропустите!'], soon: ['⏰ Через 15 минут начнётся Мировая молитва', 'Приготовьте сердце и войдите в голосовую комнату.'], now: ['🎉 Мировая молитва началась!', 'Присоединяйтесь сейчас и молитесь с верующими со всего мира.'], praying: ['🟢 Сейчас люди молятся', '{n} человек в Мировой молитве. Присоединяйтесь!'] }
};
const lt = (lang) => LAUNCH_TEXT[String(lang || 'pt').slice(0, 2)] || LAUNCH_TEXT.pt;
const cleanLang = (v) => (LAUNCH_TEXT[String(v || '').slice(0, 2)] ? String(v).slice(0, 2) : 'pt');
const cleanTz = (v) => { const tz = String(v || '').slice(0, 64); try { Intl.DateTimeFormat('en', { timeZone: tz }); return tz; } catch { return null; } };
const localHour = (tz) => { try { return Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: tz || 'Europe/Madrid' }).format(new Date())) % 24; } catch { return 12; } };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// GET /api/help-posts/launch — data da inauguração, inscritos, e o que eu ativei
router.get('/launch', optionalAuth, async (req, res) => {
  try {
    const c = await db.query('SELECT COUNT(*)::int AS n FROM prayer_launch_signups');
    let joined = false; let alerts = false;
    if (req.user?.id) {
      const a = await db.query('SELECT 1 FROM prayer_launch_signups WHERE user_id = $1', [req.user.id]);
      const b = await db.query('SELECT 1 FROM prayer_alert_subs WHERE user_id = $1', [req.user.id]);
      joined = !!a.rows[0]; alerts = !!b.rows[0];
    }
    res.set('Cache-Control', 'no-store');
    res.json({ startsAt: LAUNCH_AT.toISOString(), count: c.rows[0].n, joined, alerts });
  } catch (e) { res.json({ startsAt: LAUNCH_AT.toISOString(), count: 0, joined: false, alerts: false }); }
});
// POST /api/help-posts/launch/signup { on, lang, tz } — quero participar
router.post('/launch/signup', authenticate, async (req, res) => {
  try {
    if (req.body?.on === false) await db.query('DELETE FROM prayer_launch_signups WHERE user_id = $1', [req.user.id]);
    else {
      await db.query('INSERT INTO prayer_launch_signups (user_id, lang, tz) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET lang = EXCLUDED.lang, tz = EXCLUDED.tz', [req.user.id, cleanLang(req.body?.lang), cleanTz(req.body?.tz)]);
      // quem se inscreve também recebe o aviso "há pessoas orando"
      await db.query('INSERT INTO prayer_alert_subs (user_id, lang, tz) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO NOTHING', [req.user.id, cleanLang(req.body?.lang), cleanTz(req.body?.tz)]);
    }
    const c = await db.query('SELECT COUNT(*)::int AS n FROM prayer_launch_signups');
    res.json({ ok: true, joined: req.body?.on !== false, count: c.rows[0].n });
  } catch (e) { console.error('launch signup', e.message); res.status(500).json({ error: 'server' }); }
});
// POST /api/help-posts/alerts { on, lang, tz } — avisar-me quando houver pessoas orando
router.post('/alerts', authenticate, async (req, res) => {
  try {
    if (req.body?.on) await db.query('INSERT INTO prayer_alert_subs (user_id, lang, tz) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET lang = EXCLUDED.lang, tz = EXCLUDED.tz', [req.user.id, cleanLang(req.body?.lang), cleanTz(req.body?.tz)]);
    else await db.query('DELETE FROM prayer_alert_subs WHERE user_id = $1', [req.user.id]);
    res.json({ ok: true, alerts: !!req.body?.on });
  } catch (e) { res.status(500).json({ error: 'server' }); }
});

// Lembretes da inauguração (1 dia antes, 15 min antes, no início) — cada um só uma vez
async function sendLaunchStage(stage) {
  const claim = await db.query('INSERT INTO prayer_launch_sent (stage) VALUES ($1) ON CONFLICT DO NOTHING RETURNING stage', [stage]);
  if (!claim.rows[0]) return;
  const r = await db.query('SELECT user_id, lang FROM prayer_launch_signups');
  console.log(`Oração Mundial: lembrete "${stage}" para ${r.rows.length} pessoas`);
  for (const row of r.rows) {
    const [title, body] = lt(row.lang)[stage];
    await createNotification(row.user_id, 'prayer', title, body, { url: '/praca-oracao', kind: 'prayer_launch' });
    await sleep(40);
  }
}
async function launchTick() {
  try {
    const now = Date.now(); const at = LAUNCH_AT.getTime();
    if (now >= at - 24 * 3600e3 && now < at - 20 * 3600e3) await sendLaunchStage('day');
    if (now >= at - 15 * 60e3 && now < at) await sendLaunchStage('soon');
    if (now >= at && now < at + 60 * 60e3) await sendLaunchStage('now');
  } catch (e) { console.error('launchTick', e.message); }
}
setInterval(launchTick, 60 * 1000);
setTimeout(launchTick, 15 * 1000);

// Aviso "há pessoas orando": só com 3+ pessoas, no máximo 1 por dia, nunca de madrugada
let lastAlertRun = 0;
async function maybeSendPrayingAlerts(count, prayingIds) {
  if (count < 3 || Date.now() - lastAlertRun < 10 * 60e3) return;
  lastAlertRun = Date.now();
  try {
    const r = await db.query(`SELECT user_id, lang, tz FROM prayer_alert_subs WHERE last_sent IS NULL OR last_sent < NOW() - INTERVAL '20 hours' LIMIT 500`);
    for (const row of r.rows) {
      if (prayingIds.has(String(row.user_id))) continue;
      const h = localHour(row.tz);
      if (h < 8 || h >= 22) continue;
      const [title, body] = lt(row.lang).praying;
      await db.query('UPDATE prayer_alert_subs SET last_sent = NOW() WHERE user_id = $1', [row.user_id]);
      await createNotification(row.user_id, 'prayer', title, body.replace('{n}', count), { url: '/praca-oracao', kind: 'praying_now' });
      await sleep(40);
    }
  } catch (e) { console.error('praying alerts', e.message); }
}

// ---- Salas privadas ----
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
// POST /api/help-posts/private-rooms { name } — cria uma sala privada
router.post('/private-rooms', authenticate, async (req, res) => {
  try {
    const name = String(req.body?.name || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (name.length < 2) return res.status(400).json({ error: 'name' });
    const mine = await db.query('SELECT COUNT(*)::int AS n FROM prayer_private_rooms WHERE owner_id = $1', [req.user.id]);
    if (mine.rows[0].n >= 20) return res.status(429).json({ error: 'limit' });
    for (let i = 0; i < 6; i++) {
      const code = newCode();
      try {
        const r = await db.query('INSERT INTO prayer_private_rooms (code, name, owner_id) VALUES ($1, $2, $3) RETURNING code, name', [code, name, req.user.id]);
        return res.json({ room: { ...r.rows[0], owner_id: req.user.id } });
      } catch (e) { if (e.code !== '23505') throw e; }
    }
    res.status(500).json({ error: 'code' });
  } catch (e) { console.error('private-rooms create', e.message); res.status(500).json({ error: 'server' }); }
});
// GET /api/help-posts/private-rooms/mine — salas que criei
router.get('/private-rooms/mine', authenticate, async (req, res) => {
  try {
    const r = await db.query('SELECT code, name, owner_id FROM prayer_private_rooms WHERE owner_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ rooms: r.rows });
  } catch (e) { res.status(500).json({ error: 'server' }); }
});
// GET /api/help-posts/private-rooms/:code — dados públicos da sala (para entrar com o código)
router.get('/private-rooms/:code', async (req, res) => {
  try {
    const code = String(req.params.code || '').toUpperCase().replace(/^P-/, '').replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const r = await db.query('SELECT p.code, p.name, p.owner_id, u.full_name AS owner_name FROM prayer_private_rooms p LEFT JOIN users u ON u.id = p.owner_id WHERE p.code = $1', [code]);
    if (!r.rows[0]) return res.status(404).json({ error: 'not_found' });
    db.query('UPDATE prayer_private_rooms SET last_used_at = NOW() WHERE code = $1', [code]).catch(() => {});
    res.json({ room: r.rows[0] });
  } catch (e) { res.status(500).json({ error: 'server' }); }
});
// DELETE /api/help-posts/private-rooms/:code — o dono apaga a sala
router.delete('/private-rooms/:code', authenticate, async (req, res) => {
  try {
    const r = await db.query('DELETE FROM prayer_private_rooms WHERE code = $1 AND owner_id = $2 RETURNING code', [String(req.params.code || '').toUpperCase(), req.user.id]);
    res.json({ ok: !!r.rows[0] });
  } catch (e) { res.status(500).json({ error: 'server' }); }
});

// GET /api/help-posts/presence — pessoas a orar agora
const presenceCache = new Map(); // room -> { at, data } (alivia o servidor quando há muita gente)
router.get('/presence', (req, res) => {
  const room = String(req.query.room || 'geral').slice(0, 20);
  const hit = presenceCache.get(room);
  if (hit && Date.now() - hit.at < 3000) return res.json(hit.data);
  const data = presencePayload(room);
  if (presenceCache.size > 500) presenceCache.clear();
  presenceCache.set(room, { at: Date.now(), data });
  res.json(data);
});

// POST /api/help-posts/presence — { active: true|false }
router.post('/presence', authenticate, (req, res) => {
  const id = String(req.user.id);
  if (req.body && req.body.active === false) prayerPresence.delete(id);
  else {
    const current = prayerPresence.get(id);
    const room = validRoom(req.body?.room) ? String(req.body.room) : 'geral';
    const sameRoom = current && current.room === room;
    prayerPresence.set(id, { name: req.user.full_name || '', avatar_url: req.user.avatar_url || null, room, since: sameRoom ? current.since : Date.now(), lastSeen: Date.now() });
  }
  const payload = presencePayload(String(req.body?.room || 'geral'));
  res.json(payload);
  if (req.body?.active !== false && payload.total >= 3) {
    const ids = new Set(activePresence().map(p => String(p.user_id)));
    maybeSendPrayingAlerts(payload.total, ids).catch(() => {});
  }
});

// GET /api/help-posts — lista de posts (auth opcional)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const typeFilter = typeof req.query.type === 'string' && /^[a-z_]{2,30}$/.test(req.query.type) ? req.query.type : null;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));

    let sql;
    let params;

    if (userId) {
      sql = `
        SELECT
          hp.*,
          CASE WHEN hp.is_anonymous THEN 'Anónimo' ELSE u.full_name END AS author_name,
          CASE WHEN hp.is_anonymous THEN NULL ELSE u.avatar_url END AS author_avatar,
          (SELECT COUNT(*) FROM help_post_comments hpc WHERE hpc.post_id = hp.id) AS comment_count,
          (SELECT hpc.content FROM help_post_comments hpc WHERE hpc.post_id = hp.id AND hpc.is_pastoral = true ORDER BY hpc.created_at DESC LIMIT 1) AS pastoral_reply,
          (SELECT c.name FROM help_post_comments hpc LEFT JOIN churches c ON c.id = hpc.church_id WHERE hpc.post_id = hp.id AND hpc.is_pastoral = true ORDER BY hpc.created_at DESC LIMIT 1) AS pastoral_reply_church,
          EXISTS(
            SELECT 1 FROM help_post_prayers hpp
            WHERE hpp.post_id = hp.id AND hpp.user_id = $1
          ) AS user_prayed
        FROM help_posts hp
        LEFT JOIN users u ON u.id = hp.user_id
        WHERE (NOT EXISTS (SELECT 1 FROM help_post_churches hpt WHERE hpt.post_id = hp.id) OR hp.user_id = $1)
          AND ($2::text IS NULL OR hp.post_type = $2)
        ORDER BY hp.created_at DESC
        LIMIT $3
      `;
      params = [userId, typeFilter, limit];
    } else {
      sql = `
        SELECT
          hp.*,
          CASE WHEN hp.is_anonymous THEN 'Anónimo' ELSE u.full_name END AS author_name,
          CASE WHEN hp.is_anonymous THEN NULL ELSE u.avatar_url END AS author_avatar,
          (SELECT COUNT(*) FROM help_post_comments hpc WHERE hpc.post_id = hp.id) AS comment_count,
          NULL::TEXT AS pastoral_reply,
          NULL::TEXT AS pastoral_reply_church,
          false AS user_prayed
        FROM help_posts hp
        LEFT JOIN users u ON u.id = hp.user_id
        WHERE NOT EXISTS (SELECT 1 FROM help_post_churches hpt WHERE hpt.post_id = hp.id)
          AND ($1::text IS NULL OR hp.post_type = $1)
        ORDER BY hp.created_at DESC
        LIMIT $2
      `;
      params = [typeFilter, limit];
    }

    const result = await db.query(sql, params);
    const posts = result.rows.map(post => {
      const isMine = Boolean(userId && post.user_id === userId);
      return { ...post, is_mine: isMine, user_id: post.is_anonymous && !isMine ? null : post.user_id };
    });
    res.json({ posts });
  } catch (err) {
    console.error('Erro ao buscar help-posts:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/help-posts — criar post (requer autenticação)
router.post('/', authenticate, async (req, res) => {
  try {
    const { content, category = 'general', post_type, is_anonymous = false, is_urgent = false, media_url, pix_key, type, target_church_ids = [] } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' });
    }

    const result = await db.query(
      `INSERT INTO help_posts (user_id, category, post_type, content, is_anonymous, is_urgent, media_url, pix_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, category, post_type || type || 'request', content.trim(), is_anonymous, is_urgent, media_url || null, pix_key || null]
    );

    const churchIds = [...new Set((Array.isArray(target_church_ids) ? target_church_ids : []).filter(Boolean))];
    if (churchIds.length) {
      const churches = await db.query('SELECT id, name, pastor_id FROM churches WHERE id = ANY($1::uuid[])', [churchIds]);
      for (const church of churches.rows) {
        await db.query('INSERT INTO help_post_churches (post_id, church_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [result.rows[0].id, church.id]);
        if (church.pastor_id) {
          await createNotification(church.pastor_id, 'prayer_request', 'Novo pedido de oração para a tua igreja 🙏', `Uma pessoa pediu oração à ${church.name}.`, { postId: result.rows[0].id, churchId: church.id, path: '/sala-pastor?secao=oracoes' });
        }
      }
    }
    res.status(201).json({ post: result.rows[0], churches_notified: churchIds.length });
  } catch (err) {
    console.error('Erro ao criar help-post:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/help-posts/pastor/requests — pedidos dirigidos à igreja do pastor
router.get('/pastor/requests', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT hp.*, c.id AS church_id, c.name AS church_name,
        CASE WHEN hp.is_anonymous THEN 'Anónimo' ELSE u.full_name END AS author_name,
        (SELECT COUNT(*) FROM help_post_church_acknowledgements a WHERE a.post_id = hp.id) AS church_ack_count,
        (SELECT hpc.content FROM help_post_comments hpc WHERE hpc.post_id=hp.id AND hpc.is_pastoral=true AND hpc.church_id=c.id ORDER BY hpc.created_at DESC LIMIT 1) AS pastoral_reply,
        EXISTS(SELECT 1 FROM help_post_church_acknowledgements a WHERE a.post_id=hp.id AND a.church_id=c.id) AS acknowledged
      FROM help_post_churches target
      JOIN help_posts hp ON hp.id=target.post_id
      JOIN churches c ON c.id=target.church_id
      LEFT JOIN users u ON u.id=hp.user_id
      WHERE c.pastor_id=$1 OR $2='admin'
      ORDER BY hp.is_urgent DESC, hp.created_at DESC
      LIMIT 60`, [req.user.id, req.user.role]);
    res.json({ posts: result.rows });
  } catch (err) { console.error('Erro ao buscar pedidos da igreja:', err); res.status(500).json({ error: 'Não foi possível carregar os pedidos.' }); }
});

// POST /api/help-posts/:id/church-praying — pastor confirma oração da igreja
router.post('/:id/church-praying', authenticate, async (req, res) => {
  try {
    const target = await db.query(`SELECT c.id, c.name FROM help_post_churches hpt JOIN churches c ON c.id=hpt.church_id WHERE hpt.post_id=$1 AND (c.pastor_id=$2 OR $3='admin') LIMIT 1`, [req.params.id, req.user.id, req.user.role]);
    if (!target.rows.length) return res.status(403).json({ error: 'Este pedido não foi enviado à tua igreja.' });
    const church = target.rows[0];
    const inserted = await db.query('INSERT INTO help_post_church_acknowledgements (post_id, church_id, pastor_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING post_id', [req.params.id, church.id, req.user.id]);
    if (inserted.rows.length) {
      const post = await db.query('SELECT user_id FROM help_posts WHERE id=$1', [req.params.id]);
      if (post.rows[0]?.user_id) await createNotification(post.rows[0].user_id, 'prayer', `${church.name} está a orar por ti 🙏`, 'O teu pedido foi recebido por uma igreja. Não estás sozinho.', { postId: req.params.id, churchId: church.id });
    }
    res.json({ acknowledged: true, church_name: church.name });
  } catch (err) { console.error('Erro ao confirmar oração:', err); res.status(500).json({ error: 'Não foi possível confirmar a oração.' }); }
});

// POST /api/help-posts/:id/pastoral-reply — resposta privada do pastor ao pedido da sua igreja
router.post('/:id/pastoral-reply', authenticate, async (req, res) => {
  try {
    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ error: 'Escreva uma resposta antes de enviar.' });
    const target = await db.query(`SELECT c.id, c.name FROM help_post_churches hpt JOIN churches c ON c.id=hpt.church_id WHERE hpt.post_id=$1 AND (c.pastor_id=$2 OR $3='admin') LIMIT 1`, [req.params.id, req.user.id, req.user.role]);
    if (!target.rows.length) return res.status(403).json({ error: 'Este pedido não pertence à tua igreja.' });
    const church = target.rows[0];
    const result = await db.query(`INSERT INTO help_post_comments (post_id, user_id, content, is_anonymous, is_pastoral, church_id)
      VALUES ($1,$2,$3,false,true,$4) RETURNING id, content, created_at`, [req.params.id, req.user.id, content, church.id]);
    const post = await db.query('SELECT user_id FROM help_posts WHERE id=$1', [req.params.id]);
    if (post.rows[0]?.user_id) await createNotification(post.rows[0].user_id, 'pastoral_reply', `${church.name} respondeu ao teu pedido 🙏`, content.slice(0, 120), { postId: req.params.id, churchId: church.id, path: '/ajuda-uma-vida' });
    res.status(201).json({ reply: { ...result.rows[0], church_name: church.name } });
  } catch (err) { console.error('Erro ao responder pedido pastoral:', err); res.status(500).json({ error: 'Não foi possível enviar a resposta.' }); }
});

// POST /api/help-posts/:id/offer-help — demonstra interesse em ajudar, sem expor contacto privado
router.post('/:id/offer-help', authenticate, async (req, res) => {
  try {
    const post = await db.query('SELECT id, user_id, post_type, help_status, content FROM help_posts WHERE id=$1', [req.params.id]);
    if (!post.rows.length || post.rows[0].post_type !== 'social_help') return res.status(404).json({ error: 'Pedido de ajuda não encontrado.' });
    if (post.rows[0].help_status === 'completed') return res.status(400).json({ error: 'Este pedido já foi concluído.' });
    if (post.rows[0].user_id === req.user.id) return res.status(400).json({ error: 'Não podes oferecer ajuda ao teu próprio pedido.' });
    const message = String(req.body.message || '').trim().slice(0, 500);
    const result = await db.query(`INSERT INTO help_post_supporters (post_id,user_id,message) VALUES ($1,$2,$3)
      ON CONFLICT (post_id,user_id) DO NOTHING RETURNING post_id`, [req.params.id, req.user.id, message || null]);
    if (result.rows.length && post.rows[0].user_id) await createNotification(post.rows[0].user_id, 'help_offer', 'Uma pessoa quer ajudar-te 🤝', 'Entra em Ajuda uma Vida para ver e aceitar o apoio.', { postId: req.params.id, path: '/ajuda-uma-vida' });
    res.json({ offered: true, already_offered: !result.rows.length });
  } catch (err) { console.error('Erro ao oferecer ajuda:', err); res.status(500).json({ error: 'Não foi possível registar o apoio.' }); }
});

// GET /api/help-posts/:id/supporters — apenas quem publicou o pedido pode ver voluntários
router.get('/:id/supporters', authenticate, async (req, res) => {
  try {
    const owner = await db.query('SELECT user_id FROM help_posts WHERE id=$1', [req.params.id]);
    if (!owner.rows.length) return res.status(404).json({ error: 'Pedido não encontrado.' });
    if (owner.rows[0].user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Apenas a pessoa que pediu ajuda pode ver os voluntários.' });
    const result = await db.query(`SELECT s.created_at, s.message, u.id, u.full_name, u.avatar_url FROM help_post_supporters s JOIN users u ON u.id=s.user_id WHERE s.post_id=$1 ORDER BY s.created_at ASC`, [req.params.id]);
    res.json({ supporters: result.rows });
  } catch (err) { console.error('Erro ao listar voluntários:', err); res.status(500).json({ error: 'Não foi possível carregar os voluntários.' }); }
});

// POST /api/help-posts/:id/help-status — pessoa que pediu ajuda atualiza o acompanhamento
router.post('/:id/help-status', authenticate, async (req, res) => {
  try {
    const status = String(req.body.status || 'open');
    if (!['open', 'in_progress', 'completed', 'answered'].includes(status)) return res.status(400).json({ error: 'Estado inválido.' });
    const testimony = typeof req.body.testimony === 'string' ? req.body.testimony.trim().slice(0, 1000) : null;
    const result = await db.query(
      `UPDATE help_posts SET help_status=$1,
         answer_testimony = CASE WHEN $1='answered' THEN $4 ELSE answer_testimony END,
         answered_at = CASE WHEN $1='answered' THEN NOW() ELSE answered_at END
       WHERE id=$2 AND user_id=$3 RETURNING help_status, answer_testimony, answered_at, content`,
      [status, req.params.id, req.user.id, testimony || null]);
    if (!result.rows.length) return res.status(403).json({ error: 'Apenas quem publicou pode atualizar este pedido.' });
    if (status === 'answered') {
      try {
        const prayers = await db.query('SELECT user_id FROM help_post_prayers WHERE post_id=$1 AND user_id <> $2 LIMIT 500', [req.params.id, req.user.id]);
        const preview = (result.rows[0].content || '').substring(0, 50);
        for (const row of prayers.rows) {
          await createNotification(row.user_id, 'prayer', 'Deus respondeu! 🙌', `O pedido pelo qual oraste foi respondido: ${preview}...`, { postId: req.params.id, url: '/praca-oracao?pedido=' + req.params.id, kind: 'answered', preview });
        }
      } catch (ne) { console.error('Answered notify error:', ne.message); }
    }
    res.json({ help_status: result.rows[0].help_status, answer_testimony: result.rows[0].answer_testimony, answered_at: result.rows[0].answered_at });
  } catch (err) { console.error('Erro ao atualizar ajuda:', err); res.status(500).json({ error: 'Não foi possível atualizar o pedido.' }); }
});

// POST /api/help-posts/:id/pray — toggle oração (requer autenticação)
router.post('/:id/pray', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se já orou
    const existing = await db.query(
      `SELECT id FROM help_post_prayers WHERE post_id = $1 AND user_id = $2`,
      [id, userId]
    );

    let prayed;
    if (existing.rows.length > 0) {
      // Já orou → remover
      await db.query(
        `DELETE FROM help_post_prayers WHERE post_id = $1 AND user_id = $2`,
        [id, userId]
      );
      await db.query(
        `UPDATE help_posts SET prayer_count = GREATEST(0, prayer_count - 1) WHERE id = $1`,
        [id]
      );
      prayed = false;
    } else {
      // Não orou → adicionar
      await db.query(
        `INSERT INTO help_post_prayers (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [id, userId]
      );
      await db.query(
        `UPDATE help_posts SET prayer_count = prayer_count + 1 WHERE id = $1`,
        [id]
      );
      prayed = true;
      // Notificar dono do pedido
      try {
        const postOwner = await db.query(`SELECT user_id, content FROM help_posts WHERE id = $1`, [id]);
        if (postOwner.rows.length > 0 && postOwner.rows[0].user_id !== userId) {
          const preview = postOwner.rows[0].content?.substring(0,50);
          const who = req.user.full_name || 'Alguém';
          await createNotification(postOwner.rows[0].user_id, 'prayer', `${who} orou pelo teu pedido 🙏`, `Mais uma pessoa está contigo nesta oração: ${preview}...`, { postId: id, url: '/praca-oracao?pedido=' + id, kind: 'prayed', who, preview });
        }
      } catch(ne) {}
    }

    const postResult = await db.query(
      `SELECT prayer_count FROM help_posts WHERE id = $1`,
      [id]
    );

    res.json({
      prayed,
      prayer_count: postResult.rows[0]?.prayer_count || 0,
    });
  } catch (err) {
    console.error('Erro ao toggle oração:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// DELETE /api/help-posts/:id — apagar o próprio pedido (ou admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM help_posts WHERE id=$1 AND (user_id=$2 OR $3=\'admin\') RETURNING id', [req.params.id, req.user.id, req.user.role]);
    if (!result.rows.length) return res.status(403).json({ error: 'Só quem publicou pode apagar este pedido.' });
    res.json({ deleted: true });
  } catch (err) { console.error('Erro ao apagar pedido:', err); res.status(500).json({ error: 'Não foi possível apagar o pedido.' }); }
});

// GET /api/help-posts/:id/comments — listar comentários
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        hpc.*,
        CASE WHEN hpc.is_anonymous THEN 'Anónimo' ELSE u.full_name END AS author_name,
        CASE WHEN hpc.is_anonymous THEN NULL ELSE u.avatar_url END AS author_avatar
       FROM help_post_comments hpc
       LEFT JOIN users u ON u.id = hpc.user_id
       WHERE hpc.post_id = $1
       ORDER BY hpc.created_at ASC`,
      [req.params.id]
    );
    res.json({ comments: result.rows });
  } catch (err) {
    console.error('Erro ao buscar comentários:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/help-posts/:id/comments — adicionar comentário (requer autenticação)
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { content, is_anonymous = false } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comentário não pode ser vazio' });
    }

    const result = await db.query(
      `INSERT INTO help_post_comments (post_id, user_id, content, is_anonymous)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, req.user.id, content.trim(), is_anonymous]
    );

    res.status(201).json({ comment: result.rows[0] });
  } catch (err) {
    console.error('Erro ao criar comentário:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
