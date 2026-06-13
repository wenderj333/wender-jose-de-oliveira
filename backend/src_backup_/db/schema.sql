-- =============================================
-- SIGO COM FÉ - Schema Completo (PostgreSQL)
-- Rede Social Cristã com Ferramentas Pastorais
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ USUÁRIOS ============
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(30),
  bio TEXT,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'leader', 'pastor', 'admin')),
  country_code CHAR(2) DEFAULT 'BR',
  language VARCHAR(5) DEFAULT 'pt-BR',
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ IGREJAS ============
CREATE TABLE churches (
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
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  phone VARCHAR(30),
  email VARCHAR(255),
  website VARCHAR(255),
  service_times JSONB DEFAULT '[]',
  languages TEXT[] DEFAULT ARRAY['pt'],
  member_count INT DEFAULT 0,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'vip', 'corporate')),
  parent_church_id UUID REFERENCES churches(id),
  pastor_id UUID REFERENCES users(id),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_churches_location ON churches(city, country_code);
CREATE INDEX idx_churches_coords ON churches(latitude, longitude);

-- ============ CARGOS NA IGREJA ============
CREATE TABLE church_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_name VARCHAR(50) NOT NULL,
  role_type VARCHAR(30) DEFAULT 'member' CHECK (role_type IN (
    'pastor', 'co_pastor', 'secretary', 'treasurer',
    'worship_leader', 'youth_leader', 'children_leader',
    'deacon', 'cell_leader', 'member'
  )),
  permissions JSONB DEFAULT '{}',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, user_id, role_type)
);

-- ============ PEDIDOS DE ORAÇÃO ============
CREATE TABLE prayers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  church_id UUID REFERENCES churches(id) ON DELETE SET NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  category VARCHAR(30) DEFAULT 'other' CHECK (category IN (
    'health', 'work_finance', 'family', 'studies',
    'housing', 'emotional', 'decisions', 'other'
  )),
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'church', 'circle', 'pastor_only')),
  is_urgent BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  answered_testimony TEXT,
  answered_at TIMESTAMPTZ,
  prayer_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prayers_church ON prayers(church_id, created_at DESC);
CREATE INDEX idx_prayers_category ON prayers(category);
CREATE INDEX idx_prayers_answered ON prayers(is_answered);

-- ============ RESPOSTAS / "ESTOU ORANDO" ============
CREATE TABLE prayer_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_id UUID NOT NULL REFERENCES prayers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prayer_id, user_id)
);

-- ============ CÍRCULOS DE ORAÇÃO ============
CREATE TABLE prayer_circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES users(id),
  meeting_schedule VARCHAR(255),
  meeting_type VARCHAR(20) DEFAULT 'online' CHECK (meeting_type IN ('online', 'presential', 'hybrid')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prayer_circle_members (
  circle_id UUID NOT NULL REFERENCES prayer_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (circle_id, user_id)
);

-- ============ CAMPANHAS DE ORAÇÃO ============
CREATE TABLE prayer_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  base_verse TEXT,
  campaign_type VARCHAR(30) DEFAULT 'prayer' CHECK (campaign_type IN ('prayer', 'fasting', 'vigil', 'mixed')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goal_participants INT DEFAULT 0,
  current_participants INT DEFAULT 0,
  daily_verses JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES prayer_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id, check_date)
);

-- ============ PASTOR ORANDO AO VIVO ============
CREATE TABLE pastor_prayer_sessions (
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

CREATE INDEX idx_pastor_sessions_live ON pastor_prayer_sessions(is_live) WHERE is_live = true;

-- ============ DÍZIMOS E OFERTAS ============
CREATE TABLE tithes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(12, 2) NOT NULL,
  currency CHAR(3) DEFAULT 'BRL',
  type VARCHAR(20) DEFAULT 'tithe' CHECK (type IN ('tithe', 'offering', 'special', 'mission', 'other')),
  description TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  payment_method VARCHAR(30),
  payment_ref VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tithes_church ON tithes(church_id, created_at DESC);

-- ============ NOVOS CONVERTIDOS ============
CREATE TABLE new_converts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(255),
  address TEXT,
  conversion_date DATE DEFAULT CURRENT_DATE,
  baptism_date DATE,
  is_baptized BOOLEAN DEFAULT false,
  discipleship_leader_id UUID REFERENCES users(id),
  pastoral_notes TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'discipleship', 'integrated', 'inactive')),
  registered_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ NOTAS PASTORAIS ============
CREATE TABLE pastoral_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pastor_id UUID NOT NULL REFERENCES users(id),
  member_id UUID NOT NULL REFERENCES users(id),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category VARCHAR(30) DEFAULT 'general',
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ NOTIFICAÇÕES ============
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(255),
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============ MURAL / FEED ============
CREATE TABLE feed_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  church_id UUID REFERENCES churches(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  category VARCHAR(30) DEFAULT 'testemunho' CHECK (category IN (
    'testemunho', 'louvor', 'foto', 'versiculo', 'reflexao'
  )),
  media_url TEXT,
  verse_reference VARCHAR(100),
  amem_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'church')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feed_posts_created ON feed_posts(created_at DESC);
CREATE INDEX idx_feed_posts_category ON feed_posts(category);
CREATE INDEX idx_feed_posts_church ON feed_posts(church_id, created_at DESC);
