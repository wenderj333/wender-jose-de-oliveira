// Grupos (estilo Facebook): tabelas e colunas novas.
// Tudo é idempotente (IF NOT EXISTS) e nunca apaga nem renomeia nada que já existe.
// É chamado pela auto-migração do server.js e, por segurança, também na primeira
// chamada à API de grupos (caso a migração ainda esteja a correr).

const STATEMENTS = [
  // Colunas novas em groups
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS cover_url TEXT`,
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS rules TEXT`,
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS category VARCHAR(80)`,
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS require_approval BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,
  // visibility: public | private | hidden. A coluna antiga "privacy" continua a ser
  // 'public' ou 'private' (um grupo oculto fica 'private' lá), por isso o código
  // antigo e a restrição CHECK antiga continuam a funcionar.
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS visibility VARCHAR(20)`,
  `UPDATE groups SET visibility = CASE WHEN privacy = 'private' THEN 'private' ELSE 'public' END WHERE visibility IS NULL`,
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS rules_list JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS membership_questions JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS post_approval BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS invite_code VARCHAR(40)`,
  `ALTER TABLE groups ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code) WHERE invite_code IS NOT NULL`,

  // Membros: definição de notificações e silenciamento
  `ALTER TABLE group_members ADD COLUMN IF NOT EXISTS notify_level VARCHAR(20) NOT NULL DEFAULT 'all'`,
  `ALTER TABLE group_members ADD COLUMN IF NOT EXISTS muted_until TIMESTAMPTZ`,
  `CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id)`,

  // Pedidos de entrada: respostas às perguntas
  `ALTER TABLE group_join_requests ADD COLUMN IF NOT EXISTS answers JSONB NOT NULL DEFAULT '[]'::jsonb`,

  // Bloqueados (não podem voltar a entrar)
  `CREATE TABLE IF NOT EXISTS group_bans (
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    banned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
  )`,

  // Publicações: tipos, várias fotos, destaque, comentários desligados, aprovação
  `ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS post_type VARCHAR(20) NOT NULL DEFAULT 'text'`,
  `ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS media_urls JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ`,
  `ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS comments_off BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'published'`,
  `ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ`,
  `ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ`,
  `ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS testimony TEXT`,
  `ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS legacy_prayer_id UUID`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_group_posts_legacy_prayer ON group_posts(legacy_prayer_id) WHERE legacy_prayer_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_group_posts_feed ON group_posts(group_id, status, created_at DESC)`,

  // Reações (uma por pessoa): amen | love | praise | sad
  `CREATE TABLE IF NOT EXISTS group_post_reactions (
    post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction VARCHAR(12) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
  )`,

  // Comentários: respostas (um nível) e edição
  `ALTER TABLE group_post_comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES group_post_comments(id) ON DELETE CASCADE`,
  `ALTER TABLE group_post_comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ`,

  // Enquetes
  `CREATE TABLE IF NOT EXISTS group_poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    text VARCHAR(120) NOT NULL,
    position INT NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_group_poll_options_post ON group_poll_options(post_id, position)`,
  `CREATE TABLE IF NOT EXISTS group_poll_votes (
    post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES group_poll_options(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
  )`,

  // "Orei" nos pedidos de oração
  `CREATE TABLE IF NOT EXISTS group_prayer_prayed (
    post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
  )`,

  // Eventos: local, link online, lembrete e presenças
  `ALTER TABLE group_events ADD COLUMN IF NOT EXISTS location VARCHAR(200)`,
  `ALTER TABLE group_events ADD COLUMN IF NOT EXISTS online_url TEXT`,
  `ALTER TABLE group_events ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ`,
  `CREATE TABLE IF NOT EXISTS group_event_rsvps (
    event_id UUID NOT NULL REFERENCES group_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(12) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
  )`,

  // Denúncias dentro do grupo (vão para os administradores do grupo)
  `CREATE TABLE IF NOT EXISTS group_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES group_post_comments(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason VARCHAR(40) NOT NULL,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_group_reports_group ON group_reports(group_id, status, created_at DESC)`,

  // Dados antigos: os "gostos" passam a ser a reação Amém e os pedidos de oração
  // antigos (group_prayers) aparecem como publicações do tipo oração. Idempotente.
  `INSERT INTO group_post_reactions (post_id, user_id, reaction, created_at)
     SELECT post_id, user_id, 'amen', created_at FROM group_post_likes
   ON CONFLICT DO NOTHING`,
  `INSERT INTO group_posts (group_id, author_id, content, post_type, status, created_at, answered_at, legacy_prayer_id)
     SELECT p.group_id, p.author_id, p.content, 'prayer', 'published', p.created_at,
            CASE WHEN p.is_answered THEN p.created_at ELSE NULL END, p.id
       FROM group_prayers p
      WHERE NOT EXISTS (SELECT 1 FROM group_posts gp WHERE gp.legacy_prayer_id = p.id)`,
];

// Tabelas base (iguais às do server.js), para ambientes onde ainda não existem.
const BASE = [
  `CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    privacy VARCHAR(20) DEFAULT 'public',
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS group_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS group_join_requests (
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS group_prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_answered BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS group_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS group_post_likes (
    post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS group_post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_group_post_comments_post ON group_post_comments(post_id, created_at)`,
];

// Corre uma única vez por processo (a auto-migração e a API partilham a mesma promessa,
// para não haver dois ALTER TABLE ao mesmo tempo).
let running = null;
function ensureGroupsSchema(query) {
  if (!running) {
    running = (async () => {
      for (const sql of BASE) await query(sql);
      for (const sql of STATEMENTS) await query(sql);
    })().catch((error) => { running = null; throw error; });
  }
  return running;
}

module.exports = { ensureGroupsSchema };
