const jwt = require('jsonwebtoken');
const db = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'sigo-com-fe-secret-dev';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '90d' }
  );
}

// Atualiza "visto por último" no máximo 1 vez por minuto por pessoa (bolinha verde de online)
const lastTouch = new Map();
function touchLastSeen(id) {
  const now = Date.now(); const k = String(id);
  if (now - (lastTouch.get(k) || 0) < 60000) return;
  lastTouch.set(k, now);
  if (lastTouch.size > 20000) lastTouch.clear();
  db.query('UPDATE users SET last_seen_at = NOW() WHERE id = $1', [id]).catch(() => {});
}

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await db.query('SELECT id, email, full_name, role, avatar_url, is_suspended FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
    if (user.is_suspended) return res.status(403).json({ error: 'Esta conta foi suspensa pela moderação.' });
    req.user = user;
    touchLastSeen(user.id);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissão negada' });
    }
    next();
  };
}

module.exports = { generateToken, authenticate, requireRole, JWT_SECRET };
