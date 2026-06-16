require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { setupWebSocket } = require('./websocket');

const app = express();
app.set('trust proxy', 1);
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
// Stripe webhook needs raw body BEFORE express.json()
app.use('/api/stripe/webhook', express.raw({type: 'application/json'}));
app.use(express.json());
app.use(require('helmet')());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: { error: 'Muitas requisiÃ§Ãµes. Tente novamente em 15 minutos.' } });
const chatLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 30, message: { error: 'Limite de mensagens atingido.' } });
app.use('/api/', limiter);
app.use('/api/chat', chatLimiter);

// JWT secret warning
if (process.env.JWT_SECRET === 'sigocomfe-secret-key-2026-mudar-em-producao') {
  console.warn('âš ï¸  AVISO: Usando JWT_SECRET padrÃ£o! Defina um segredo forte em produÃ§Ã£o.');
}

// Auto-migrate on startup (runs CREATE TABLE IF NOT EXISTS â€” safe to repeat)
const { Pool: MigratePool } = require('pg');
(async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('âš ï¸  DATABASE_URL nÃ£o definida, pulando migraÃ§Ã£o.');
    return;
  }
  const mp = new MigratePool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });
  try {
    console.log('ðŸ”„ Auto-migraÃ§Ã£o iniciando...');
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
    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS audio_url TEXT`);
    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS cover_url TEXT`);
    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS music_title TEXT`);

    // Stripe payments table
    await mp.query(`
      CREATE TABLE IF NOT EXISTS stripe_payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pastor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        stripe_session_id VARCHAR(255) NOT NULL UNIQUE,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'eur',
        status VARCHAR(20) DEFAULT 'pending',
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

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

    // Music table
    await mp.query(`
      CREATE TABLE IF NOT EXISTS music (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255),
        url TEXT NOT NULL,
        user_name VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ============ CRIADOR DE LOUVOR COM IA ============
    await mp.query(`
      CREATE TABLE IF NOT EXISTS ai_songs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        lyrics TEXT NOT NULL,
        theme VARCHAR(100),
        style VARCHAR(50),
        emotion VARCHAR(50),
        bible_book VARCHAR(100),
        verse_reference TEXT,
        language VARCHAR(5) DEFAULT 'pt',
        is_public BOOLEAN DEFAULT false,
        like_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS song_credits (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        credits_remaining INT DEFAULT 4,
        total_generated INT DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // â”€â”€ Fase 1 Sala do Pastor: church_members, church_events, novas colunas â”€â”€
    await mp.query(`ALTER TABLE churches ADD COLUMN IF NOT EXISTS pastor_name VARCHAR(200)`);
    await mp.query(`ALTER TABLE churches ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`);
    await mp.query(`
      CREATE TABLE IF NOT EXISTS church_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        member_tag VARCHAR(30) DEFAULT 'member',
        joined_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(church_id, user_id)
      );
    `);
    await mp.query(`
      CREATE TABLE IF NOT EXISTS church_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
        created_by UUID REFERENCES users(id),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        event_type VARCHAR(30) DEFAULT 'culto',
        event_date DATE NOT NULL,
        event_time TIME,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('âœ… Auto-migraÃ§Ã£o concluÃ­da!');
  } catch (err) {
    console.error('âš ï¸  Erro na auto-migraÃ§Ã£o (continuando):', err.message);
  } finally {
    await mp.end();
  }
})();

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
const quizRoutes = require('./routes/quiz');
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/prayers', require('./routes/prayer'));
app.use('/api/churches', require('./routes/churches'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/photos', require('./routes/photo_comments'));
app.use('/api/help-requests', require('./routes/help'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/pastoral-ai', require('./routes/pastoral-ai'));
app.use('/api/bible-ai', require('./routes/bible-ai'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/music', require('./routes/music'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/members', require('./routes/members'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/consecration', require('./routes/consecration'));
app.use('/api/notifications', require('./routes/notifications').router);
app.use('/api/offerings', require('./routes/offerings'));
app.use('/api/pastor', require('./routes/pastor-dashboard'));
app.use('/api/journeys', require('./routes/journeys'));
app.use('/api/course', require('./routes/course'));
app.use('/api/stripe', require('./routes/stripe'));
app.use('/api/ai-louvor', require('./routes/ai-louvor'));
app.use('/api/openclaw', require('./routes/openclaw'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/help-posts', require('./routes/help-posts'));
app.use('/api/live-community', require('./routes/live-community'));

// Log OpenClaw routes for debugging
console.log('âœ… OpenClaw routes registered: /api/openclaw/health, /api/openclaw/users/new');
console.log('   Available endpoints: GET /api/openclaw/health, POST /api/openclaw/users/new');

// Root route
app.get('/', (req, res) => {
  res.json({ name: 'Sigo com FÃ© API', status: 'online', version: '1.0.0' });
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
    if (!['member', 'leader', 'pastor', 'admin'].includes(role)) return res.status(400).json({ error: 'Role invÃ¡lido' });
    const user = await db.prepare('UPDATE users SET role = ? WHERE email = ? RETURNING id, email, full_name, role').get(role, email);
    if (!user) return res.status(404).json({ error: 'UsuÃ¡rio nÃ£o encontrado' });
    res.json({ message: 'Role atualizado!', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Bible proxy route
app.get('/api/bible/chapter', async (req, res) => {
  try {
    const { book, chapter, translation } = req.query;
    const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${translation || 'kjv'}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/bible/search', async (req, res) => {
  try {
    const { q, translation } = req.query;
    const url = `https://bible-api.com/${encodeURIComponent(q)}?translation=${translation || 'kjv'}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ========== DUELO BIBLICO ==========
const perguntasDuelo = {
  pt: [
    {q:"Quem foi o homem mais velho da Biblia?",a:["Abraao","Metusalem","Noe","Moises"],c:1},
    {q:"Quantos dias choveu no Diluvio?",a:["7 dias","12 dias","40 dias","100 dias"],c:2},
    {q:"Onde esta escrito No principio era o Verbo?",a:["Mateus","Lucas","Marcos","Joao"],c:3},
    {q:"Quantos apostolos Jesus escolheu?",a:["7","10","12","14"],c:2},
    {q:"Qual foi o primeiro milagre de Jesus?",a:["Curou um cego","Ressuscitou Lazaro","Agua em vinho","Alimentou 5000"],c:2},
    {q:"Onde Jesus nasceu?",a:["Nazare","Jerusalem","Belem","Jerico"],c:2},
    {q:"Quantos livros tem a Biblia?",a:["60","63","66","72"],c:2},
    {q:"Quem traiu Jesus?",a:["Pedro","Judas","Tome","Filipe"],c:1},
    {q:"Qual o versiculo mais curto da Biblia?",a:["Deus e amor","Jesus chorou","Orai sempre","Alegrai-vos"],c:1},
    {q:"Quem escreveu a maioria das cartas do NT?",a:["Pedro","Paulo","Joao","Tiago"],c:1}
  ],
  en: [
    {q:"Who was the oldest man in the Bible?",a:["Abraham","Methuselah","Noah","Moses"],c:1},
    {q:"How many days did it rain in the Flood?",a:["7 days","12 days","40 days","100 days"],c:2},
    {q:"Where is written In the beginning was the Word?",a:["Matthew","Luke","Mark","John"],c:3},
    {q:"How many apostles did Jesus choose?",a:["7","10","12","14"],c:2},
    {q:"What was Jesus first miracle?",a:["Healed blind","Raised Lazarus","Water to wine","Fed 5000"],c:2},
    {q:"Where was Jesus born?",a:["Nazareth","Jerusalem","Bethlehem","Jericho"],c:2},
    {q:"How many books are in the Bible?",a:["60","63","66","72"],c:2},
    {q:"Who betrayed Jesus?",a:["Peter","Judas","Thomas","Philip"],c:1},
    {q:"What is the shortest verse in the Bible?",a:["God is love","Jesus wept","Pray always","Rejoice"],c:1},
    {q:"Who wrote most NT letters?",a:["Peter","Paul","John","James"],c:1}
  ],
  es: [
    {q:"Quien fue el hombre mas anciano de la Biblia?",a:["Abraham","Matusalen","Noe","Moises"],c:1},
    {q:"Cuantos dias llovo en el Diluvio?",a:["7 dias","12 dias","40 dias","100 dias"],c:2},
    {q:"Donde dice En el principio era el Verbo?",a:["Mateo","Lucas","Marcos","Juan"],c:3},
    {q:"Cuantos apostoles eligio Jesus?",a:["7","10","12","14"],c:2},
    {q:"Cual fue el primer milagro de Jesus?",a:["Sano un ciego","Resucito a Lazaro","Agua en vino","Alimento 5000"],c:2},
    {q:"Donde nacio Jesus?",a:["Nazaret","Jerusalem","Belen","Jerico"],c:2},
    {q:"Cuantos libros tiene la Biblia?",a:["60","63","66","72"],c:2},
    {q:"Quien traiciono a Jesus?",a:["Pedro","Judas","Tomas","Felipe"],c:1},
    {q:"Cual es el versiculo mas corto?",a:["Dios es amor","Jesus lloro","Orad siempre","Alegraos"],c:1},
    {q:"Quien escribio la mayoria de las cartas del NT?",a:["Pedro","Pablo","Juan","Santiago"],c:1}
  ],
  fr: [
    {q:"Qui etait le plus vieux de la Bible?",a:["Abraham","Mathusalem","Noe","Moise"],c:1},
    {q:"Combien de jours a-t-il plu pendant le Deluge?",a:["7 jours","12 jours","40 jours","100 jours"],c:2},
    {q:"Ou est ecrit Au commencement etait la Parole?",a:["Matthieu","Luc","Marc","Jean"],c:3},
    {q:"Combien d apostres Jesus a-t-il choisi?",a:["7","10","12","14"],c:2},
    {q:"Quel fut le premier miracle de Jesus?",a:["Guerit aveugle","Ressuscita Lazare","Eau en vin","Nourrit 5000"],c:2},
    {q:"Ou Jesus est-il ne?",a:["Nazareth","Jerusalem","Bethleem","Jericho"],c:2},
    {q:"Combien de livres dans la Bible?",a:["60","63","66","72"],c:2},
    {q:"Qui a trahi Jesus?",a:["Pierre","Judas","Thomas","Philippe"],c:1},
    {q:"Quel est le verset le plus court?",a:["Dieu est amour","Jesus pleura","Priez toujours","Rejouissez-vous"],c:1},
    {q:"Qui a ecrit la plupart des lettres du NT?",a:["Pierre","Paul","Jean","Jacques"],c:1}
  ],
  de: [
    {q:"Wer war der aelteste Mann in der Bibel?",a:["Abraham","Methusalem","Noah","Moses"],c:1},
    {q:"Wie viele Tage regnete es bei der Sintflut?",a:["7 Tage","12 Tage","40 Tage","100 Tage"],c:2},
    {q:"Wo steht Im Anfang war das Wort?",a:["Matthaeus","Lukas","Markus","Johannes"],c:3},
    {q:"Wie viele Apostel waehlte Jesus?",a:["7","10","12","14"],c:2},
    {q:"Was war Jesu erstes Wunder?",a:["Heilte Blinden","Erweckte Lazarus","Wasser zu Wein","Speiste 5000"],c:2},
    {q:"Wo wurde Jesus geboren?",a:["Nazareth","Jerusalem","Bethlehem","Jericho"],c:2},
    {q:"Wie viele Buecher hat die Bibel?",a:["60","63","66","72"],c:2},
    {q:"Wer verriet Jesus?",a:["Petrus","Judas","Thomas","Philippus"],c:1},
    {q:"Was ist der kuerzeste Vers der Bibel?",a:["Gott ist Liebe","Jesus weinte","Betet immer","Freuet euch"],c:1},
    {q:"Wer schrieb die meisten NT-Briefe?",a:["Petrus","Paulus","Johannes","Jakobus"],c:1}
  ],
  ro: [
    {q:"Cine a fost cel mai batran om din Biblie?",a:["Avraam","Matusalem","Noe","Moise"],c:1},
    {q:"Cate zile a plouat in timpul Potopului?",a:["7 zile","12 zile","40 de zile","100 de zile"],c:2},
    {q:"Unde scrie La inceput era Cuvantul?",a:["Matei","Luca","Marcu","Ioan"],c:3},
    {q:"Cati apostoli a ales Isus?",a:["7","10","12","14"],c:2},
    {q:"Care a fost prima minune a lui Isus?",a:["Vindecat orb","Inviat Lazar","Apa in vin","Hranit 5000"],c:2},
    {q:"Unde s-a nascut Isus?",a:["Nazaret","Ierusalim","Betleem","Ierihon"],c:2},
    {q:"Cate carti are Biblia?",a:["60","63","66","72"],c:2},
    {q:"Cine L-a tradat pe Isus?",a:["Petru","Iuda","Toma","Filip"],c:1},
    {q:"Care e cel mai scurt verset?",a:["Dumnezeu e dragoste","Isus a plans","Rugati-va","Bucurati-va"],c:1},
    {q:"Cine a scris majoritatea epistolelor NT?",a:["Petru","Pavel","Ioan","Iacov"],c:1}
  ],
  ru: [
    {q:"Kto byl samym starym v Biblii?",a:["Avraam","Mafusail","Noi","Moisei"],c:1},
    {q:"Skolko dney shyol dozhd v Potop?",a:["7 dney","12 dney","40 dney","100 dney"],c:2},
    {q:"Gde napisano V nachale bylo Slovo?",a:["Matvei","Luka","Mark","Ioann"],c:3},
    {q:"Skolko apostolov vibral Iisus?",a:["7","10","12","14"],c:2},
    {q:"Kakoe bylo pervoe chudo Iisusa?",a:["Istseli slepogo","Voskresil Lazarya","Voda v vino","Nakormil 5000"],c:2},
    {q:"Gde rodilsya Iisus?",a:["Nazaret","Ierusalim","Viflehem","Ierihon"],c:2},
    {q:"Skolko knig v Biblii?",a:["60","63","66","72"],c:2},
    {q:"Kto predal Iisusa?",a:["Petr","Iuda","Foma","Filip"],c:1},
    {q:"Kakoy samiy korotkiy stih?",a:["Bog est lyubov","Iisus zaplakal","Moliytes","Raduytsya"],c:1},
    {q:"Kto napisal bolshinstvo pisem NT?",a:["Petr","Pavel","Ioann","Iakov"],c:1}
  ]
};

let duelEsperando = null;
let duelSalas = {};

const { Server: SocketServer } = require('socket.io');
const ioduelo = new SocketServer(server, { cors: { origin: '*' }, path: '/duelo' });

ioduelo.on('connection', (socket) => {
  socket.on('procurarPartida', (d) => {
    const lang = d.idioma || 'pt';
    const nome = d.nome || 'Jogador';
    if (!duelEsperando) {
      duelEsperando = { socket, nome, lang };
      socket.emit('status', 'Aguardando...');
    } else {
      const op = duelEsperando; duelEsperando = null;
      const sid = 'duelo_' + Date.now();
      socket.join(sid); op.socket.join(sid);
      const p1 = perguntasDuelo[lang] || perguntasDuelo.pt;
      const p2 = perguntasDuelo[op.lang] || perguntasDuelo.pt;
      duelSalas[sid] = { j:[{id:socket.id,nome,lang,pts:0,resp:false},{id:op.socket.id,nome:op.nome,lang:op.lang,pts:0,resp:false}], qi:0, t:15, timer:null };
      socket.emit('inicioJogo', {salaId:sid, oponente:op.nome, pergunta:p1[0]});
      op.socket.emit('inicioJogo', {salaId:sid, oponente:nome, pergunta:p2[0]});
      duelTimer(sid);
    }
  });
  socket.on('enviarResposta', (d) => {
    const sala = duelSalas[d.salaId]; if (!sala) return;
    const j = sala.j.find(x => x.id === socket.id);
    if (j && !j.resp) {
      j.resp = true;
      const p = (perguntasDuelo[j.lang]||perguntasDuelo.pt)[sala.qi];
      if (d.escolha === p.c) j.pts += 100 + (sala.t * 5);
      const op = sala.j.find(x => x.id !== socket.id);
      if (op) ioduelo.to(op.id).emit('oponenteRespondeu');
      if (sala.j.every(x => x.resp)) { clearInterval(sala.timer); setTimeout(() => duelProxima(d.salaId), 1500); }
    }
  });
  socket.on('disconnect', () => {
    if (duelEsperando && duelEsperando.socket.id === socket.id) duelEsperando = null;
    for (const [sid, sala] of Object.entries(duelSalas)) {
      if (sala.j.find(x => x.id === socket.id)) {
        clearInterval(sala.timer);
        ioduelo.to(sid).emit('oponenteSaiu');
        delete duelSalas[sid];
      }
    }
  });
});

function duelTimer(sid) {
  const sala = duelSalas[sid]; if (!sala) return;
  sala.t = 15;
  sala.timer = setInterval(() => {
    sala.t--;
    ioduelo.to(sid).emit('atualizarTimer', sala.t);
    if (sala.t <= 0) { clearInterval(sala.timer); duelProxima(sid); }
  }, 1000);
}

function duelProxima(sid) {
  const sala = duelSalas[sid]; if (!sala) return;
  sala.qi++; sala.j.forEach(j => j.resp = false);
  if (sala.qi < 10) {
    sala.j.forEach(j => {
      const p = (perguntasDuelo[j.lang]||perguntasDuelo.pt)[sala.qi];
      ioduelo.to(j.id).emit('novaPergunta', {pergunta:p});
    });
    duelTimer(sid);
  } else {
    ioduelo.to(sid).emit('fimJogo', sala.j.map(j=>({nome:j.nome,pontos:j.pts})));
    delete duelSalas[sid];
  }
}
// ========== FIM DUELO BIBLICO ==========
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Sigo com FÃ© API', version: '1.0.0' });
});

// WebSocket
const wss = setupWebSocket(server);

// Give help route access to WSS for broadcasting
const helpRoute = require('./routes/help');
helpRoute.setWss(wss);

const PORT = process.env.PORT || 3001;

// Criar tabela quiz_resultados se nao existir
const { Pool } = require('pg');
const _pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
_pool.query('CREATE TABLE IF NOT EXISTS quiz_resultados (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, pontos INTEGER DEFAULT 0, perguntas_corretas INTEGER DEFAULT 5, perguntas_total INTEGER DEFAULT 5, livro VARCHAR(50), tempo_medio FLOAT DEFAULT 0, criado_em TIMESTAMP DEFAULT NOW())').then(()=>console.log('quiz_resultados OK')).catch(e=>console.log('quiz_resultados erro:', e.message));

server.listen(PORT, () => {
  console.log(`ðŸ™ Sigo com FÃ© API rodando na porta ${PORT}`);
  console.log(`ðŸ“¡ WebSocket disponÃ­vel em ws://localhost:${PORT}/ws`);
});


// deploy trigger

// Adicionar coluna fcm_token se nao existir
async function addFcmTokenColumn() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT');
    console.log('? fcm_token column ready');
  } catch(e) {
    console.error('fcm_token migration error:', e.message);
  }
}
addFcmTokenColumn();

// Adicionar coluna pix_key se nao existir
async function addPixKeyColumn() {
  try {
    await pool.query('ALTER TABLE help_posts ADD COLUMN IF NOT EXISTS pix_key TEXT');
    console.log('pix_key column ready');
  } catch(e) {
    console.error('pix_key migration error:', e.message);
  }
}
addPixKeyColumn();

// Adicionar colunas perfil sobre mim
async function addProfileColumns() {
  try {
    await _pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT');
    await _pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT');
    await _pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT');
    await _pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profession TEXT');
    await _pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS work TEXT');
    await _pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS marital_status TEXT');
    await _pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_verse TEXT');
    await _pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS birthdate TEXT');
    console.log('Profile columns ready');
  } catch(e) { console.error('Profile columns error:', e.message); }
}
addProfileColumns();

// favorite_verse column added via addProfileColumns()


