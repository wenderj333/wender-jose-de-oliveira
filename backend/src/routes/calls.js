const express = require('express');
const { authenticate } = require('../middleware/auth');

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

module.exports = router;
