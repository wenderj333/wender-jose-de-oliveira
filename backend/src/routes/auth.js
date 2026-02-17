const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, role, avatar_url } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, senha e nome completo são obrigatórios' });
    }

    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email já cadastrado' });

    const user = await User.create({ email, password, full_name, role });

    // Salvar avatar se fornecido
    if (avatar_url) {
      const db = require('../db/connection');
      await db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatar_url, user.id);
      user.avatar_url = avatar_url;
    }

    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const valid = await User.verifyPassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

    await User.updateLastSeen(user.id);
    const token = generateToken(user);
    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, avatar_url: user.avatar_url },
      token,
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/social — sync Firebase social user (Google/Facebook) to local DB
// Also keep /google as alias for backward compatibility
router.post('/social', socialLoginHandler);
router.post('/google', socialLoginHandler);

async function socialLoginHandler(req, res) {
  try {
    const { uid, email, full_name, photo } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'uid e email são obrigatórios' });
    }

    // Check if user already exists (by email)
    let user = await User.findByEmail(email);
    if (!user) {
      // Create local user with a random password (won't be used for Google users)
      const crypto = require('crypto');
      const randomPass = crypto.randomBytes(32).toString('hex');
      user = await User.create({
        email,
        password: randomPass,
        full_name: full_name || email,
        role: 'member'
      });
      // Update avatar if provided
      if (photo) {
        const db = require('../db/connection');
        await db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(photo, user.id);
        user.avatar_url = photo;
      }
    }

    // Generate our own JWT for this user
    const token = generateToken(user);
    await User.updateLastSeen(user.id);

    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, avatar_url: user.avatar_url },
      token,
    });
  } catch (err) {
    console.error('Erro no login social:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// POST /api/auth/phone — sync Firebase phone user to local DB
router.post('/phone', async (req, res) => {
  try {
    const { uid, phone, full_name } = req.body;
    if (!uid || !phone) {
      return res.status(400).json({ error: 'uid e telefone são obrigatórios' });
    }

    const db = require('../db/connection');

    // Try to find user by uid (stored in email field as phone:uid pattern) or phone
    let user = await db.prepare('SELECT * FROM users WHERE email = ?').get(`phone:${uid}`);
    if (!user) {
      // Create local user for phone auth
      const crypto = require('crypto');
      const randomPass = crypto.randomBytes(32).toString('hex');
      user = await User.create({
        email: `phone:${uid}`,
        password: randomPass,
        full_name: full_name || phone,
        role: 'member'
      });
      // Store phone number (column added via migration, safe to ignore if missing)
      try {
        await db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(phone, user.id);
      } catch (e) {
        console.warn('Could not set phone:', e.message);
      }
      user.phone = phone;
    }

    const token = generateToken(user);
    await User.updateLastSeen(user.id);

    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, avatar_url: user.avatar_url, phone: user.phone || phone },
      token,
    });
  } catch (err) {
    console.error('Erro no login por telefone:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/promote — promote user to pastor/admin with secret key
router.post('/promote', authenticate, async (req, res) => {
  try {
    const { role, secretKey } = req.body;
    const PROMOTE_SECRET = process.env.PROMOTE_SECRET || 'sigocomfe-pastor-2026';
    if (secretKey !== PROMOTE_SECRET) {
      return res.status(403).json({ error: 'Chave secreta inválida' });
    }
    if (!['pastor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role inválido. Use: pastor ou admin' });
    }
    const db = require('../db/connection');
    await db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.user.id);
    const updated = await db.prepare('SELECT id, email, full_name, role, avatar_url FROM users WHERE id = ?').get(req.user.id);
    const token = generateToken(updated);
    res.json({ user: updated, token, message: `Promovido para ${role} com sucesso!` });
  } catch (err) {
    console.error('Erro ao promover:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
