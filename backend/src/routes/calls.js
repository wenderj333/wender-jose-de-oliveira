const express = require('express');
const { authenticate } = require('../middleware/auth');

const { AccessToken } = require('livekit-server-sdk');
const router = express.Router();

// TURN da Cloudflare (1000 GB/mês grátis). As credenciais duram 24 h; guardamos 1 h em memória.
let cfCache = { at: 0, servers: null };
async function cloudflareIceServers() {
  const keyId = process.env.CLOUDFLARE_TURN_KEY_ID;
  const token = process.env.CLOUDFLARE_TURN_API_TOKEN;
  if (!keyId || !token) return null;
  if (cfCache.servers && Date.now() - cfCache.at < 60 * 60 * 1000) return cfCache.servers;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const body = JSON.stringify({ ttl: 86400 });
  const base = `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(keyId)}/credentials`;
  let r = await fetch(`${base}/generate-ice-servers`, { method: 'POST', headers, body, signal: AbortSignal.timeout(8000) });
  if (r.status === 404) r = await fetch(`${base}/generate`, { method: 'POST', headers, body, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`Cloudflare returned ${r.status}`);
  const d = await r.json();
  let list = Array.isArray(d.iceServers) ? d.iceServers : (d.iceServers ? [d.iceServers] : []);
  // A porta 53 é bloqueada por alguns navegadores: tiramos esses endereços
  list = list.map(s => ({ ...s, urls: (Array.isArray(s.urls) ? s.urls : [s.urls]).filter(u => !/:53(\?|$)/.test(u)) })).filter(s => s.urls.length);
  if (!list.length) throw new Error('Cloudflare returned no ICE servers');
  cfCache = { at: Date.now(), servers: list };
  return list;
}

router.get('/ice-servers', authenticate, async (_req, res) => {
  try {
    const cf = await cloudflareIceServers();
    if (cf) return res.json({ iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }, ...cf], turnEnabled: true, provider: 'cloudflare' });
  } catch (error) {
    console.error('[calls] Cloudflare TURN error:', error.message);
  }
  // Aceita a chave mesmo que tenha sido colada com espaços, aspas ou o endereço completo (…?apiKey=XXXX")
  const rawKey = String(process.env.METERED_API_KEY || '');
  const fromUrl = rawKey.match(/apiKey=([A-Za-z0-9]+)/);
  const apiKey = fromUrl ? fromUrl[1] : ((rawKey.match(/[A-Za-z0-9]{24,}/) || [''])[0]);
  const appName = process.env.METERED_TURN_APP || 'sigo-com-fe';
  const fallback = [{ urls: 'stun:stun.l.google.com:19302' }];

  if (!apiKey) return res.json({ iceServers: fallback, turnEnabled: false });

  try {
    const url = `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Metered returned ${response.status}`);
    const iceServers = await response.json();
    if (!Array.isArray(iceServers) || iceServers.length === 0) throw new Error('Metered returned no ICE servers');
    res.json({ iceServers, turnEnabled: true });
  } catch (error) {
    console.error('[calls] TURN credential error:', error.message);
    res.json({ iceServers: fallback, turnEnabled: false });
  }
});

// A chave do LiveKit fica somente no Render. Cada pessoa recebe um token curto
// para entrar na sala de oração; apenas pastor/admin pode transmitir.
router.post('/prayer-room-token', authenticate, async (req, res) => {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!url || !apiKey || !apiSecret) return res.status(503).json({ error: 'A sala de oração ainda está a ser preparada.' });

  const canHost = ['pastor', 'admin'].includes(req.user.role);
  const token = new AccessToken(apiKey, apiSecret, {
    identity: `${req.user.id}-${Date.now()}`,
    name: req.user.full_name || 'Membro Sigo com Fé',
    metadata: JSON.stringify({ userId: req.user.id, role: req.user.role, host: canHost })
  });
  token.addGrant({ roomJoin: true, room: 'oracao-com-fe', canPublish: canHost, canSubscribe: true, canPublishData: true });
  res.json({ token: await token.toJwt(), url, room: 'oracao-com-fe', canHost });
});

module.exports = router;
