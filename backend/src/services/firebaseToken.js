// Verifica o "ID token" que o Firebase (ou o Google) entrega ao navegador depois do login.
// Sem isto, qualquer pessoa podia enviar só um e-mail e entrar na conta de outra.
const jwt = require('jsonwebtoken');

const PROJECT = process.env.FIREBASE_PROJECT_ID || 'sigo-com-fe';
const SOURCES = {
  firebase: 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
  google: 'https://www.googleapis.com/oauth2/v1/certs',
};
const cache = {};

async function certs(kind) {
  const c = cache[kind];
  if (c && c.exp > Date.now()) return c.keys;
  const r = await fetch(SOURCES[kind], { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error('certs_unavailable');
  const keys = await r.json();
  const m = /max-age=(\d+)/.exec(r.headers.get('cache-control') || '');
  cache[kind] = { keys, exp: Date.now() + (m ? Number(m[1]) * 1000 : 3600e3) };
  return keys;
}

async function keyFor(kind, kid) {
  let keys = await certs(kind);
  if (!keys[kid]) { cache[kind] = null; keys = await certs(kind); } // as chaves do Google mudam de tempos a tempos
  if (!keys[kid]) throw new Error('unknown_key');
  return keys[kid];
}

// Devolve { uid, email, emailVerified, phone, name, picture, provider } ou lança erro
async function verifyIdToken(token) {
  const dec = jwt.decode(String(token || ''), { complete: true });
  if (!dec || !dec.header || dec.header.alg !== 'RS256' || !dec.header.kid || !dec.payload) throw new Error('bad_token');
  const iss = dec.payload.iss;
  if (iss === `https://securetoken.google.com/${PROJECT}`) {
    const pem = await keyFor('firebase', dec.header.kid);
    const p = jwt.verify(token, pem, { algorithms: ['RS256'], audience: PROJECT, issuer: iss, clockTolerance: 60 });
    if (!p.sub) throw new Error('bad_token');
    return {
      uid: p.sub, email: p.email ? String(p.email).trim().toLowerCase() : null, emailVerified: p.email_verified === true,
      phone: p.phone_number || null, name: p.name || null, picture: p.picture || null, provider: p.firebase?.sign_in_provider || null,
    };
  }
  if (iss === 'accounts.google.com' || iss === 'https://accounts.google.com') {
    // Token do Google (ex.: login nativo no Android). Só aceito para os IDs de cliente configurados.
    const allowed = String(process.env.GOOGLE_CLIENT_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!allowed.length) throw new Error('google_not_configured');
    const pem = await keyFor('google', dec.header.kid);
    const p = jwt.verify(token, pem, { algorithms: ['RS256'], audience: allowed, issuer: ['accounts.google.com', 'https://accounts.google.com'], clockTolerance: 60 });
    return {
      uid: 'google:' + p.sub, email: p.email ? String(p.email).trim().toLowerCase() : null, emailVerified: p.email_verified === true || p.email_verified === 'true',
      phone: null, name: p.name || null, picture: p.picture || null, provider: 'google.com',
    };
  }
  throw new Error('bad_issuer');
}

module.exports = { verifyIdToken, _cache: cache };
