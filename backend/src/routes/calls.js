const express = require('express');
const { authenticate } = require('../middleware/auth');

const { AccessToken } = require('livekit-server-sdk');
const router = express.Router();

router.get('/ice-servers', authenticate, async (_req, res) => {
  const apiKey = process.env.METERED_API_KEY;
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
