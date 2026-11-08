// POST /api/media/presign — o app pede licença para enviar uma foto/vídeo/áudio
// e recebe uma URL assinada para enviar o ficheiro direto ao Cloudflare R2.
const express = require('express');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');
const storage = require('../services/storage');

const router = express.Router();

const presignLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user && req.user.id ? 'u:' + req.user.id : ipKeyGenerator(req.ip || '')),
  message: { error: 'Muitos envios seguidos. Tente de novo daqui a pouco.' },
});

router.get('/status', (_req, res) => {
  res.json({ r2: storage.isConfigured() });
});

router.post('/presign', authenticate, presignLimiter, (req, res) => {
  try {
    const { folder, contentType, size } = req.body || {};
    const p = storage.prepareUpload({ folder, contentType, size });
    res.set('Cache-Control', 'no-store');
    res.json({ uploadUrl: p.uploadUrl, headers: p.headers, url: p.publicUrl, kind: p.kind });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Erro ao preparar envio' });
  }
});

module.exports = router;
