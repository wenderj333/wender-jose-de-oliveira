const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, senha e nome completo são obrigatórios' });
    }

    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email já cadastrado' });

    const user = await User.create({ email, password, full_name, role });
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

// POST /api/auth/google — sync Firebase Google user to local DB
router.post('/google', async (req, res) => {
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
        db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(photo, user.id);
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
    console.error('Erro no login Google:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
