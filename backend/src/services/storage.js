// Armazenamento de fotos, vídeos e áudios no Cloudflare R2 (compatível com S3).
// Sem dependências: as URLs são assinadas com AWS Signature V4 usando o crypto do Node.
//
// Variáveis (Render):
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
//   R2_PUBLIC_URL  (ex.: https://media.sigocomfe.com — sem barra no fim)
const crypto = require('crypto');

const env = () => ({
  account: (process.env.R2_ACCOUNT_ID || '').trim(),
  keyId: (process.env.R2_ACCESS_KEY_ID || '').trim(),
  secret: (process.env.R2_SECRET_ACCESS_KEY || '').trim(),
  bucket: (process.env.R2_BUCKET || '').trim(),
  publicUrl: (process.env.R2_PUBLIC_URL || '').trim().replace(/\/+$/, ''),
});

function isConfigured() {
  const e = env();
  return !!(e.account && e.keyId && e.secret && e.bucket && e.publicUrl);
}

// Pastas permitidas (o cliente não escolhe caminhos livres)
const FOLDERS = new Set([
  'avatars', 'covers', 'posts', 'photos', 'groups', 'group-posts', 'pedidos', 'voice-messages',
  'music', 'music-covers', 'pastor', 'chat', 'misc',
]);

const LIMITS = { image: 15 * 1024 * 1024, video: 100 * 1024 * 1024, audio: 25 * 1024 * 1024 };

const EXT = {
  'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'image/heic': 'heic', 'image/heif': 'heif', 'image/avif': 'avif',
  'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm', 'video/3gpp': '3gp', 'video/x-m4v': 'm4v',
  'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a',
  'audio/aac': 'aac', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/mp3': 'mp3',
};

function kindOf(contentType) {
  const t = String(contentType || '').toLowerCase().split(';')[0].trim();
  if (!EXT[t]) return null;
  return t.split('/')[0]; // image | video | audio
}

function cleanType(contentType) {
  return String(contentType || '').toLowerCase().split(';')[0].trim();
}

function makeKey(folder, contentType) {
  const d = new Date();
  const ext = EXT[cleanType(contentType)] || 'bin';
  const id = crypto.randomBytes(12).toString('hex');
  return `${folder}/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${id}.${ext}`;
}

// Os ficheiros nunca mudam (nome aleatório), então podem ficar em cache por 1 ano
const CACHE = 'public, max-age=31536000, immutable';

// --- AWS SigV4 ---
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const hmac = (k, s) => crypto.createHmac('sha256', k).update(s).digest();

/** Assinatura genérica por query string (SigV4). headers: { nome-minúsculo: valor } incluindo host. */
function presignQuery({ method, host, path, headers, keyId, secret, region, amzDate, expiresIn }) {
  const date = amzDate.slice(0, 8);
  const scope = `${date}/${region}/s3/aws4_request`;
  const names = Object.keys(headers).sort();
  const signedHeaders = names.join(';');
  const q = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${keyId}/${scope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresIn),
    'X-Amz-SignedHeaders': signedHeaders,
  };
  const query = Object.keys(q).sort().map((k) => `${enc(k)}=${enc(q[k])}`).join('&');
  const canonical = [
    method, path, query,
    names.map((n) => `${n}:${String(headers[n]).trim()}\n`).join(''),
    signedHeaders, 'UNSIGNED-PAYLOAD',
  ].join('\n');
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonical)].join('\n');
  const kSigning = hmac(hmac(hmac(hmac('AWS4' + secret, date), region), 's3'), 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(toSign).digest('hex');
  return `https://${host}${path}?${query}&X-Amz-Signature=${signature}`;
}

/**
 * URL assinada para PUT. O navegador precisa enviar exatamente o mesmo
 * Content-Type e o mesmo tamanho (Content-Length) que foram assinados.
 */
function presignPut({ key, contentType, contentLength, expiresIn = 600 }) {
  const e = env();
  const host = `${e.account}.r2.cloudflarestorage.com`;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const path = '/' + [e.bucket, ...key.split('/')].map(enc).join('/');
  const type = cleanType(contentType);
  const uploadUrl = presignQuery({
    method: 'PUT', host, path, region: 'auto', amzDate, expiresIn,
    keyId: e.keyId, secret: e.secret,
    headers: { 'cache-control': CACHE, 'content-length': Number(contentLength), 'content-type': type, host },
  });
  return { uploadUrl, headers: { 'Content-Type': type, 'Cache-Control': CACHE }, publicUrl: `${e.publicUrl}/${key}` };
}

/** Pede um envio: valida pasta, tipo e tamanho. Lança erro com .status em caso de recusa. */
function prepareUpload({ folder, contentType, size }) {
  if (!isConfigured()) { const err = new Error('Armazenamento não configurado'); err.status = 503; throw err; }
  const f = String(folder || 'misc').replace(/^sigo-com-fe\//, '');
  if (!FOLDERS.has(f)) { const err = new Error('Pasta inválida'); err.status = 400; throw err; }
  const kind = kindOf(contentType);
  if (!kind) { const err = new Error('Tipo de ficheiro não permitido'); err.status = 415; throw err; }
  const n = Number(size);
  if (!Number.isFinite(n) || n <= 0) { const err = new Error('Tamanho inválido'); err.status = 400; throw err; }
  if (n > LIMITS[kind]) {
    const err = new Error(`Ficheiro muito grande (máximo ${Math.round(LIMITS[kind] / 1024 / 1024)} MB)`);
    err.status = 413; throw err;
  }
  const key = makeKey(f, contentType);
  return { key, kind, ...presignPut({ key, contentType, contentLength: n }) };
}

/** Envio feito pelo servidor (ex.: capa de grupo recebida por multer). Devolve a URL pública. */
async function putBuffer(buffer, folder, contentType) {
  const p = prepareUpload({ folder, contentType, size: buffer.length });
  const r = await fetch(p.uploadUrl, {
    method: 'PUT',
    headers: { ...p.headers, 'Content-Length': String(buffer.length) },
    body: buffer,
  });
  if (!r.ok) throw new Error(`R2 PUT ${r.status}`);
  return p.publicUrl;
}

module.exports = { isConfigured, prepareUpload, putBuffer, presignPut, presignQuery, kindOf, LIMITS, FOLDERS };
