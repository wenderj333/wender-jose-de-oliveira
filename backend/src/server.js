require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { setupWebSocket } = require('./websocket');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowed = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    // Allow any .vercel.app domain
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(require('helmet')());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' } });
const chatLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 30, message: { error: 'Limite de mensagens atingido.' } });
app.use('/api/', limiter);
app.use('/api/chat', chatLimiter);

// JWT secret warning
if (process.env.JWT_SECRET === 'sigocomfe-secret-key-2026-mudar-em-producao') {
  console.warn('⚠️  AVISO: Usando JWT_SECRET padrão! Defina um segredo forte em produção.');
}

// Auto-migrate on startup (runs CREATE TABLE IF NOT EXISTS — safe to repeat)
const { Pool: MigratePool } = require('pg');
(async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL não definida, pulando migração.');
    return;
  }
  const mp = new MigratePool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });
  try {
    console.log('🔄 Auto-migração iniciando...');
    await mp.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await mp.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        avatar_url TEXT,
        phone VARCHAR(30),
        bio TEXT,
        role VARCHAR(20) DEFAULT 'member',
        country_code CHAR(2) DEFAULT 'BR',
        language VARCHAR(5) DEFAULT 'pt-BR',
        is_active BOOLEAN DEFAULT true,
        last_seen_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS churches (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        denomination VARCHAR(100),
        description TEXT,
        logo_url TEXT,
        cover_url TEXT,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        country_code CHAR(2),
        postal_code VARCHAR(20),
        latitude DECIMAL(10,7),
        longitude DECIMAL(10,7),
        phone VARCHAR(30),
        email VARCHAR(255),
        website VARCHAR(255),
        service_times JSONB DEFAULT '[]',
        languages TEXT[] DEFAULT ARRAY['pt'],
        member_count INT DEFAULT 0,
        plan VARCHAR(20) DEFAULT 'free',
        parent_church_id UUID REFERENCES churches(id),
        pastor_id UUID REFERENCES users(id),
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS church_roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_name VARCHAR(50) NOT NULL,
        role_type VARCHAR(30) DEFAULT 'member',
        permissions JSONB DEFAULT '{}',
        assigned_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(church_id, user_id, role_type)
      );
      CREATE TABLE IF NOT EXISTS prayers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        church_id UUID REFERENCES churches(id) ON DELETE SET NULL,
        title VARCHAR(255),
        content TEXT NOT NULL,
        category VARCHAR(30) DEFAULT 'other',
        visibility VARCHAR(20) DEFAULT 'public',
        is_urgent BOOLEAN DEFAULT false,
        is_answered BOOLEAN DEFAULT false,
        answered_testimony TEXT,
        answered_at TIMESTAMPTZ,
        prayer_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS prayer_responses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        prayer_id UUID NOT NULL REFERENCES prayers(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(prayer_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS feed_posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        church_id UUID REFERENCES churches(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        category VARCHAR(30) DEFAULT 'testemunho',
        media_url TEXT,
        verse_reference VARCHAR(100),
        amem_count INT DEFAULT 0,
        comment_count INT DEFAULT 0,
        visibility VARCHAR(20) DEFAULT 'public',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS help_requests (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        name VARCHAR(255),
        contact VARCHAR(255) NOT NULL,
        message TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        assigned_church_id UUID REFERENCES churches(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        requester_name VARCHAR(255),
        requester_language VARCHAR(10) DEFAULT 'pt',
        help_type VARCHAR(50),
        pastor_name VARCHAR(255),
        pastor_language VARCHAR(10),
        target_church_id UUID REFERENCES churches(id),
        target_church_name VARCHAR(255),
        status VARCHAR(20) DEFAULT 'waiting',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        closed_at TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
        sender_role VARCHAR(20) NOT NULL,
        sender_name VARCHAR(255),
        original_text TEXT NOT NULL,
        translated_text TEXT,
        original_lang VARCHAR(10),
        target_lang VARCHAR(10),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(30) NOT NULL,
        title VARCHAR(255),
        body TEXT,
        data JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS friendships (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(requester_id, addressee_id)
      );
      CREATE TABLE IF NOT EXISTS pastor_prayer_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pastor_id UUID NOT NULL REFERENCES users(id),
        church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        ended_at TIMESTAMPTZ,
        is_live BOOLEAN DEFAULT true,
        viewer_count INT DEFAULT 0,
        prayer_focus TEXT,
        duration_minutes INT
      );
    `);
    // Add is_private column to users
    await mp.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false`);
    // Direct messages table
    await mp.query(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    // Offerings config and records
    await mp.query(`
      CREATE TABLE IF NOT EXISTS offering_config (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pastor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        pix_key VARCHAR(255),
        pix_name VARCHAR(255),
        paypal_email VARCHAR(255),
        bank_name VARCHAR(100),
        bank_agency VARCHAR(20),
        bank_account VARCHAR(30),
        bank_holder VARCHAR(255),
        custom_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS offering_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pastor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(20) DEFAULT 'oferta',
        method VARCHAR(20) DEFAULT 'pix',
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    // Groups
    await mp.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        privacy VARCHAR(20) DEFAULT 'public',
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS group_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member',
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(group_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS group_posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        media_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Consecrations
    await mp.query(`
      CREATE TABLE IF NOT EXISTS consecrations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) DEFAULT 'fasting',
        start_date TIMESTAMPTZ DEFAULT NOW(),
        end_date TIMESTAMPTZ,
        purpose TEXT,
        count INT DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Add missing columns to feed_posts
    await mp.query(`
      ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS media_type VARCHAR(20);
      ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
      ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS flag_reason TEXT;
    `);

    // Post likes
    await mp.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      );
    `);

    // Post comments
    await mp.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Add like_count to feed_posts if missing
    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0`);

    // Technical issues
    await mp.query(`
      CREATE TABLE IF NOT EXISTS technical_issues (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        issue_type VARCHAR(50) DEFAULT 'bug',
        description TEXT NOT NULL,
        severity VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'open',
        assigned_to UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('✅ Auto-migração concluída!');
  } catch (err) {
    console.error('⚠️  Erro na auto-migração (continuando):', err.message);
  } finally {
    await mp.end();
  }
})();

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/prayers', require('./routes/prayer'));
app.use('/api/churches', require('./routes/churches'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/help-requests', require('./routes/help'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/pastoral-ai', require('./routes/pastoral-ai'));
app.use('/api/bible-ai', require('./routes/bible-ai'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/members', require('./routes/members'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/consecration', require('./routes/consecration'));
app.use('/api/notifications', require('./routes/notifications').router);
app.use('/api/offerings', require('./routes/offerings'));

// Root route
app.get('/', (req, res) => {
  res.json({ name: 'Sigo com Fé API', status: 'online', version: '1.0.0' });
});

// Temporary admin route - set user role
const db = require('./db/connection');
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await db.prepare('SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 50').all();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/admin/set-role', async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!['member', 'leader', 'pastor', 'admin'].includes(role)) return res.status(400).json({ error: 'Role inválido' });
    const user = await db.prepare('UPDATE users SET role = ? WHERE email = ? RETURNING id, email, full_name, role').get(role, email);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Role atualizado!', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Sigo com Fé API', version: '1.0.0' });
});

// WebSocket
const wss = setupWebSocket(server);

// Give help route access to WSS for broadcasting
const helpRoute = require('./routes/help');
helpRoute.setWss(wss);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🙏 Sigo com Fé API rodando na porta ${PORT}`);
  console.log(`📡 WebSocket disponível em ws://localhost:${PORT}/ws`);
});
