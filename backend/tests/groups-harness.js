// Servidor mínimo para testar a API de Grupos com um PostgreSQL local.
// Usa o middleware de autenticação real (JWT) e as rotas reais de routes/groups.js.
// Uploads (Cloudinary) e notificações (FCM) são trocados por versões falsas que registam as chamadas.
//
//   DATABASE_URL=postgres://postgres@localhost:5491/groupstest JWT_SECRET=test node tests/groups-api.test.js
process.env.JWT_SECRET = process.env.JWT_SECRET || 'groups-test-secret';
process.env.GROUPS_DISABLE_JOBS = '1';
if (!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL (ex.: postgres://postgres@localhost:5491/groupstest)');
// Proteção: este harness APAGA a base inteira (DROP SCHEMA). Só corre numa base local cujo nome tenha "test".
if (!/@(localhost|127\.0\.0\.1)(:\d+)?\/[^/?]*test/i.test(process.env.DATABASE_URL)) throw new Error('Recuso-me: o harness só corre numa base LOCAL com "test" no nome.');

const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../src/db/connection');

// Esquema "antigo" tal como o db/migrate.js o cria (com CHECK na privacidade),
// para provar que os grupos ocultos e o resto funcionam sobre dados existentes.
const LEGACY_SCHEMA = `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'x',
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'member',
    language VARCHAR(5) DEFAULT 'pt-BR',
    fcm_token TEXT,
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, title VARCHAR(255), body TEXT, data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
  );
  CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url TEXT,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
    member_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS group_members (
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS group_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ALTER TABLE groups ADD COLUMN IF NOT EXISTS rules TEXT;
  ALTER TABLE groups ADD COLUMN IF NOT EXISTS category VARCHAR(80);
  ALTER TABLE groups ADD COLUMN IF NOT EXISTS require_approval BOOLEAN NOT NULL DEFAULT false;
  CREATE TABLE IF NOT EXISTS group_join_requests (
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS group_prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_answered BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS group_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS group_post_likes (
    post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS group_post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

async function resetDatabase() {
  await db.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await db.query(LEGACY_SCHEMA);
}

const notifications = [];
const uploads = [];

function buildApp({ extra } = {}) {
  const groups = require('../src/routes/groups');
  groups.setNotifier(async (userId, type, title, body, data) => { notifications.push({ userId: String(userId), type, title, body, data }); });
  groups.setUploader(async (buffer, folder) => { uploads.push({ size: buffer.length, folder }); return `https://res.cloudinary.test/${folder}/${uploads.length}.jpg`; });
  const app = express();
  app.use(express.json());
  if (extra) extra(app);
  app.use('/api/groups', groups);
  return { app, groups };
}

const tokenFor = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role || 'member' }, process.env.JWT_SECRET, { expiresIn: '1d' });

async function createUser(name, extra = {}) {
  const email = extra.email || `${name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}.${Math.random().toString(36).slice(2, 7)}@teste.com`;
  const u = (await db.query('INSERT INTO users (email, full_name, avatar_url, language) VALUES ($1,$2,$3,$4) RETURNING *', [email, name, extra.avatar_url || null, extra.language || 'pt-BR'])).rows[0];
  return { ...u, token: tokenFor(u) };
}

module.exports = { db, resetDatabase, buildApp, createUser, tokenFor, notifications, uploads };
