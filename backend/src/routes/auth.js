const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db/connection');
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');

// POST /api/auth/register
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/email');
const { createNotification } = require('./notifications');

function createWelcomeNotification(user) {
  return createNotification(
    user.id,
    'welcome',
    'Bem-vindo ao Sigo com Fé!',
    'Que alegria ter você aqui. Complete o seu perfil, encontre irmãos e participe da comunidade.',
    { destination: `/perfil/${user.id}` }
  );
}

router.post('/register', async (req, res) => {
  try {
    const emailNormalized = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const fullNameNormalized = String(req.body?.full_name || '').trim();
    const { role, avatar_url, email_updates_opt_in } = req.body || {};
    if (!emailNormalized || !password || !fullNameNormalized) {
      return res.status(400).json({ error: 'Email, senha e nome completo são obrigatórios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) {
      return res.status(400).json({ error: 'Informe um endereço de e-mail válido' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }


    const existing = await User.findByEmail(emailNormalized);
    if (existing) return res.status(409).json({ error: 'Email já cadastrado' });

    const user = await User.create({ email: emailNormalized, password, full_name: fullNameNormalized, role, email_updates_opt_in: email_updates_opt_in === true });

    // Salvar avatar se fornecido
    if (avatar_url) {
      const db = require('../db/connection');
      await db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatar_url, user.id);
      user.avatar_url = avatar_url;
    }

    const token = generateToken(user);
    sendWelcomeEmail(emailNormalized, fullNameNormalized).catch(()=>{});
    createWelcomeNotification(user).catch(()=>{});
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

async function ensurePasswordResetSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash CHAR(64) UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_lookup
      ON password_reset_tokens(token_hash, expires_at);
  `);
}

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const message = 'Se este e-mail estiver registado, receberá um link para criar uma nova senha.';
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Informe o seu e-mail.' });
    const user = await User.findByEmail(email);
    if (!user) return res.json({ message });

    await ensurePasswordResetSchema();
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1 OR expires_at < NOW()', [user.id]);
    await db.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')",
      [user.id, tokenHash],
    );
    const siteUrl = String(process.env.FRONTEND_URL || 'https://www.sigocomfe.com').replace(/\/$/, '');
    await sendPasswordResetEmail(user.email, user.full_name, `${siteUrl}/reset-password?token=${token}`);
    return res.json({ message });
  } catch (error) {
    console.error('Erro ao pedir recuperação de senha:', error.message);
    return res.status(500).json({ error: 'Não foi possível enviar o link agora. Tente novamente mais tarde.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const token = String(req.body?.token || '');
    const password = String(req.body?.password || '');
    if (!token || password.length < 6) return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    await ensurePasswordResetSchema();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await db.query(
      'SELECT user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() LIMIT 1',
      [tokenHash],
    );
    const reset = result.rows[0];
    if (!reset) return res.status(400).json({ error: 'Este link expirou ou já foi usado. Peça um novo link.' });
    const passwordHash = await bcrypt.hash(password, 12);
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, reset.user_id]);
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE token_hash = $1', [tokenHash]);
    return res.json({ message: 'Senha alterada com sucesso. Agora pode entrar.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error.message);
    return res.status(500).json({ error: 'Não foi possível alterar a senha agora. Tente novamente.' });
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
    let isNewUser = false;
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
      isNewUser = true;
      // Update avatar if provided
      if (photo) {
        const { pool } = require('../config/connection');
        await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [photo, user.id]);
        user.avatar_url = photo;
      }
    }

    // Generate our own JWT for this user
    const token = generateToken(user);
    await User.updateLastSeen(user.id);
    if (isNewUser) {
      sendWelcomeEmail(email, full_name || user.full_name).catch(()=>{});
      createWelcomeNotification(user).catch(()=>{});
    }

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

    const { pool } = require('../config/connection');

    // Try to find user by uid (stored in email field as phone:uid pattern) or phone
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [`phone:${uid}`]);
    let user = userRes.rows[0];
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
        await pool.query('UPDATE users SET phone = $1 WHERE id = $2', [phone, user.id]);
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
    const PROMOTE_SECRET = process.env.PROMOTE_SECRET;
    if (!PROMOTE_SECRET || secretKey !== PROMOTE_SECRET) {
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


// POST /api/auth/admin/reset-password - admin reset password
router.post('/admin/reset-password', async (req, res) => {
  try {
    const { email, newPassword, adminKey } = req.body;
    if (!process.env.ADMIN_SECRET || adminKey !== process.env.ADMIN_SECRET) return res.status(403).json({ error: 'Nao autorizado' });
    const hash = await bcrypt.hash(newPassword, 10);
    const result = await db.query('UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, full_name', [hash, email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilizador nao encontrado' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
