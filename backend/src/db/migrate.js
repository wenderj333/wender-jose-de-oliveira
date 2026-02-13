const db = require('./connection');

function migrate() {
  console.log('🔄 Executando migração do banco de dados (SQLite)...');

  db.exec(`
    -- ============ USUÁRIOS ============
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      phone TEXT,
      bio TEXT,
      role TEXT DEFAULT 'member' CHECK (role IN ('member', 'leader', 'pastor', 'admin')),
      country_code TEXT DEFAULT 'BR',
      language TEXT DEFAULT 'pt-BR',
      is_active INTEGER DEFAULT 1,
      last_seen_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- ============ IGREJAS ============
    CREATE TABLE IF NOT EXISTS churches (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      name TEXT NOT NULL,
      denomination TEXT,
      description TEXT,
      logo_url TEXT,
      cover_url TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      country_code TEXT,
      postal_code TEXT,
      latitude REAL,
      longitude REAL,
      phone TEXT,
      email TEXT,
      website TEXT,
      service_times TEXT DEFAULT '[]',
      languages TEXT DEFAULT 'pt',
      member_count INTEGER DEFAULT 0,
      plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'vip', 'corporate')),
      parent_church_id TEXT REFERENCES churches(id),
      pastor_id TEXT REFERENCES users(id),
      is_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_churches_location ON churches(city, country_code);
    CREATE INDEX IF NOT EXISTS idx_churches_coords ON churches(latitude, longitude);

    -- ============ CARGOS NA IGREJA ============
    CREATE TABLE IF NOT EXISTS church_roles (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role_name TEXT NOT NULL,
      role_type TEXT DEFAULT 'member' CHECK (role_type IN (
        'pastor', 'co_pastor', 'secretary', 'treasurer',
        'worship_leader', 'youth_leader', 'children_leader',
        'deacon', 'cell_leader', 'member'
      )),
      permissions TEXT DEFAULT '{}',
      assigned_at TEXT DEFAULT (datetime('now')),
      UNIQUE(church_id, user_id, role_type)
    );

    -- ============ PEDIDOS DE ORAÇÃO ============
    CREATE TABLE IF NOT EXISTS prayers (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      church_id TEXT REFERENCES churches(id) ON DELETE SET NULL,
      title TEXT,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'other' CHECK (category IN (
        'health', 'work_finance', 'family', 'studies',
        'housing', 'emotional', 'decisions', 'other'
      )),
      visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'church', 'circle', 'pastor_only')),
      is_urgent INTEGER DEFAULT 0,
      is_answered INTEGER DEFAULT 0,
      answered_testimony TEXT,
      answered_at TEXT,
      prayer_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_prayers_church ON prayers(church_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_prayers_category ON prayers(category);
    CREATE INDEX IF NOT EXISTS idx_prayers_answered ON prayers(is_answered);

    -- ============ RESPOSTAS / "ESTOU ORANDO" ============
    CREATE TABLE IF NOT EXISTS prayer_responses (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      prayer_id TEXT NOT NULL REFERENCES prayers(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(prayer_id, user_id)
    );

    -- ============ CÍRCULOS DE ORAÇÃO ============
    CREATE TABLE IF NOT EXISTS prayer_circles (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      leader_id TEXT REFERENCES users(id),
      meeting_schedule TEXT,
      meeting_type TEXT DEFAULT 'online' CHECK (meeting_type IN ('online', 'presential', 'hybrid')),
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prayer_circle_members (
      circle_id TEXT NOT NULL REFERENCES prayer_circles(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (circle_id, user_id)
    );

    -- ============ CAMPANHAS DE ORAÇÃO ============
    CREATE TABLE IF NOT EXISTS prayer_campaigns (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
      created_by TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      base_verse TEXT,
      campaign_type TEXT DEFAULT 'prayer' CHECK (campaign_type IN ('prayer', 'fasting', 'vigil', 'mixed')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      goal_participants INTEGER DEFAULT 0,
      current_participants INTEGER DEFAULT 0,
      daily_verses TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS campaign_checkins (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      campaign_id TEXT NOT NULL REFERENCES prayer_campaigns(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      check_date TEXT NOT NULL DEFAULT (date('now')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(campaign_id, user_id, check_date)
    );

    -- ============ PASTOR ORANDO AO VIVO ============
    CREATE TABLE IF NOT EXISTS pastor_prayer_sessions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      pastor_id TEXT NOT NULL REFERENCES users(id),
      church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
      started_at TEXT DEFAULT (datetime('now')),
      ended_at TEXT,
      is_live INTEGER DEFAULT 1,
      viewer_count INTEGER DEFAULT 0,
      prayer_focus TEXT,
      duration_minutes INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_pastor_sessions_live ON pastor_prayer_sessions(is_live);

    -- ============ DÍZIMOS E OFERTAS ============
    CREATE TABLE IF NOT EXISTS tithes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id),
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'BRL',
      type TEXT DEFAULT 'tithe' CHECK (type IN ('tithe', 'offering', 'special', 'mission', 'other')),
      description TEXT,
      is_anonymous INTEGER DEFAULT 0,
      payment_method TEXT,
      payment_ref TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tithes_church ON tithes(church_id, created_at);

    -- ============ NOVOS CONVERTIDOS ============
    CREATE TABLE IF NOT EXISTS new_converts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      conversion_date TEXT DEFAULT (date('now')),
      baptism_date TEXT,
      is_baptized INTEGER DEFAULT 0,
      discipleship_leader_id TEXT REFERENCES users(id),
      pastoral_notes TEXT,
      status TEXT DEFAULT 'new' CHECK (status IN ('new', 'discipleship', 'integrated', 'inactive')),
      registered_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- ============ NOTAS PASTORAIS ============
    CREATE TABLE IF NOT EXISTS pastoral_notes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      pastor_id TEXT NOT NULL REFERENCES users(id),
      member_id TEXT NOT NULL REFERENCES users(id),
      church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      is_private INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- ============ NOTIFICAÇÕES ============
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT,
      body TEXT,
      data TEXT DEFAULT '{}',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at);

    -- ============ MURAL / FEED ============
    CREATE TABLE IF NOT EXISTS feed_posts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      church_id TEXT REFERENCES churches(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'testemunho' CHECK (category IN (
        'testemunho', 'louvor', 'foto', 'versiculo', 'reflexao'
      )),
      media_url TEXT,
      verse_reference TEXT,
      amem_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'church')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_feed_posts_created ON feed_posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_feed_posts_category ON feed_posts(category);
    CREATE INDEX IF NOT EXISTS idx_feed_posts_church ON feed_posts(church_id, created_at);

    -- ============ PEDIDOS DE AJUDA ============
    CREATE TABLE IF NOT EXISTS help_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT,
      contact TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending',
      assigned_church_id TEXT REFERENCES churches(id),
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('✅ Migração concluída com sucesso! (13 tabelas criadas)');
}

migrate();
