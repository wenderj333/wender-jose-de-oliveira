const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');

// All routes require pastor/admin
router.use(authenticate);
router.use(requireRole('pastor', 'admin'));

// Create tables if not exist
(async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS church_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
        created_by UUID NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        event_time VARCHAR(10),
        event_type VARCHAR(30) DEFAULT 'culto',
        location TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS bible_studies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        bible_references TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS church_expenses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
        created_by UUID NOT NULL REFERENCES users(id),
        category VARCHAR(50) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency CHAR(3) DEFAULT 'EUR',
        description TEXT,
        expense_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Pastor dashboard tables ready');
  } catch (e) {
    console.error('Pastor dashboard table creation:', e.message);
  }
})();

// Helper: get pastor's church
async function getPastorChurch(userId) {
  return await db.prepare('SELECT * FROM churches WHERE pastor_id = ?').get(userId);
}

// GET /overview
router.get('/overview', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.json({ church: null, stats: null });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const ms = monthStart.toISOString();

    const members = await db.prepare('SELECT COUNT(*) as count FROM church_roles WHERE church_id = ?').get(church.id);
    const prayers = await db.prepare('SELECT COUNT(*) as count FROM prayers WHERE church_id = ? AND created_at >= ?').get(church.id, ms);
    const tithes = await db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM tithes WHERE church_id = ? AND type = 'tithe' AND created_at >= ?").get(church.id, ms);
    const offerings = await db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM tithes WHERE church_id = ? AND type = 'offering' AND created_at >= ?").get(church.id, ms);

    res.json({
      church,
      stats: {
        members: parseInt(members?.count || 0),
        prayers: parseInt(prayers?.count || 0),
        tithesTotal: parseFloat(tithes?.total || 0),
        offeringsTotal: parseFloat(offerings?.total || 0),
      }
    });
  } catch (err) {
    console.error('Pastor overview error:', err);
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
});

// GET /members
router.get('/members', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.json({ members: [] });

    const members = await db.prepare(`
      SELECT u.id, u.full_name, u.email, u.avatar_url, u.role, cr.role_type, cr.created_at as joined_at
      FROM church_roles cr
      JOIN users u ON u.id = cr.user_id
      WHERE cr.church_id = ?
      ORDER BY cr.created_at DESC
    `).all(church.id);

    res.json({ members });
  } catch (err) {
    console.error('Pastor members error:', err);
    res.status(500).json({ error: 'Erro ao carregar membros' });
  }
});

// POST /tithes
router.post('/tithes', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.status(404).json({ error: 'Igreja não encontrada' });

    const { amount, type, description } = req.body;
    if (!amount || !type) return res.status(400).json({ error: 'Valor e tipo são obrigatórios' });

    await db.prepare(`
      INSERT INTO tithes (id, church_id, user_id, amount, currency, type, description, created_at)
      VALUES (uuid_generate_v4(), ?, ?, ?, 'EUR', ?, ?, NOW())
    `).run(church.id, req.user.id, parseFloat(amount), type, description || '');

    res.json({ success: true });
  } catch (err) {
    console.error('Pastor tithe error:', err);
    res.status(500).json({ error: 'Erro ao registrar' });
  }
});

// GET /tithes?month=YYYY-MM
router.get('/tithes', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.json({ tithes: [], summary: {} });

    const month = req.query.month;
    let tithes, startDate, endDate;

    if (month) {
      startDate = `${month}-01`;
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + 1);
      endDate = d.toISOString().slice(0, 10);
      tithes = await db.prepare('SELECT * FROM tithes WHERE church_id = ? AND created_at >= ? AND created_at < ? ORDER BY created_at DESC').all(church.id, startDate, endDate);
    } else {
      tithes = await db.prepare('SELECT * FROM tithes WHERE church_id = ? ORDER BY created_at DESC LIMIT 50').all(church.id);
    }

    let total_tithes = 0, total_offerings = 0, total_special = 0;
    tithes.forEach(t => {
      const amt = parseFloat(t.amount);
      if (t.type === 'tithe') total_tithes += amt;
      else if (t.type === 'offering') total_offerings += amt;
      else total_special += amt;
    });

    res.json({
      tithes,
      summary: { total_tithes, total_offerings, total_special, grand_total: total_tithes + total_offerings + total_special }
    });
  } catch (err) {
    console.error('Pastor tithes error:', err);
    res.status(500).json({ error: 'Erro ao carregar' });
  }
});

// POST /announcements
router.post('/announcements', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.status(404).json({ error: 'Igreja não encontrada' });

    const { title, content, priority } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });

    // Get all church members
    const members = await db.prepare('SELECT user_id FROM church_roles WHERE church_id = ?').all(church.id);

    // Create notification for each member
    let count = 0;
    for (const m of members) {
      await db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
        VALUES (uuid_generate_v4(), ?, 'announcement', ?, ?, false, NOW())
      `).run(m.user_id, `${priority === 'urgent' ? '🚨 ' : '📢 '}${title}`, content);
      count++;
    }

    res.json({ success: true, recipients: count });
  } catch (err) {
    console.error('Pastor announcement error:', err);
    res.status(500).json({ error: 'Erro ao enviar comunicado' });
  }
});

// GET /announcements
router.get('/announcements', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.json({ announcements: [] });

    // Get member IDs to find their announcements
    const members = await db.prepare('SELECT user_id FROM church_roles WHERE church_id = ?').all(church.id);
    if (!members.length) return res.json({ announcements: [] });

    // Get unique announcements by title+body+time (since we create one per member)
    const announcements = await db.prepare(`
      SELECT DISTINCT ON (title, body, DATE_TRUNC('minute', created_at))
        id, title, body, created_at
      FROM notifications
      WHERE type = 'announcement' AND user_id = ?
      ORDER BY title, body, DATE_TRUNC('minute', created_at), created_at DESC
    `).all(members[0].user_id);

    res.json({
      announcements: announcements.map(a => ({
        ...a,
        recipients: members.length
      }))
    });
  } catch (err) {
    console.error('Pastor announcements error:', err);
    res.status(500).json({ error: 'Erro ao carregar' });
  }
});

// POST /events
router.post('/events', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.status(404).json({ error: 'Igreja não encontrada' });

    const { title, description, event_date, event_time, event_type } = req.body;
    if (!title || !event_date) return res.status(400).json({ error: 'Título e data são obrigatórios' });

    await db.prepare(`
      INSERT INTO church_events (id, church_id, created_by, title, description, event_date, event_time, event_type, created_at)
      VALUES (uuid_generate_v4(), ?, ?, ?, ?, ?, ?, ?, NOW())
    `).run(church.id, req.user.id, title, description || '', event_date, event_time || '', event_type || 'culto');

    res.json({ success: true });
  } catch (err) {
    console.error('Pastor event error:', err);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

// GET /events
router.get('/events', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.json({ events: [] });

    const events = await db.prepare(`
      SELECT * FROM church_events WHERE church_id = ? AND event_date >= CURRENT_DATE ORDER BY event_date ASC, event_time ASC
    `).all(church.id);

    res.json({ events });
  } catch (err) {
    console.error('Pastor events error:', err);
    res.status(500).json({ error: 'Erro ao carregar' });
  }
});

// POST /studies
router.post('/studies', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.status(404).json({ error: 'Igreja não encontrada' });

    const { title, content, bible_references } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });

    await db.prepare(`
      INSERT INTO bible_studies (id, church_id, author_id, title, content, bible_references, created_at)
      VALUES (uuid_generate_v4(), ?, ?, ?, ?, ?, NOW())
    `).run(church.id, req.user.id, title, content, bible_references || '');

    res.json({ success: true });
  } catch (err) {
    console.error('Pastor study error:', err);
    res.status(500).json({ error: 'Erro ao criar estudo' });
  }
});

// GET /studies
router.get('/studies', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.json({ studies: [] });

    const studies = await db.prepare('SELECT * FROM bible_studies WHERE church_id = ? ORDER BY created_at DESC').all(church.id);
    res.json({ studies });
  } catch (err) {
    console.error('Pastor studies error:', err);
    res.status(500).json({ error: 'Erro ao carregar' });
  }
});

// POST /expenses
router.post('/expenses', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.status(404).json({ error: 'Igreja não encontrada' });

    const { category, amount, description, expense_date } = req.body;
    if (!category || !amount) return res.status(400).json({ error: 'Categoria e valor são obrigatórios' });

    await db.prepare(`
      INSERT INTO church_expenses (id, church_id, created_by, category, amount, description, expense_date, created_at)
      VALUES (uuid_generate_v4(), ?, ?, ?, ?, ?, ?, NOW())
    `).run(church.id, req.user.id, category, parseFloat(amount), description || '', expense_date || new Date().toISOString().slice(0, 10));

    res.json({ success: true });
  } catch (err) {
    console.error('Pastor expense error:', err);
    res.status(500).json({ error: 'Erro ao registrar despesa' });
  }
});

// GET /expenses?month=YYYY-MM
router.get('/expenses', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.json({ expenses: [], summary: {} });

    const month = req.query.month;
    let expenses;

    if (month) {
      const startDate = `${month}-01`;
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + 1);
      const endDate = d.toISOString().slice(0, 10);
      expenses = await db.prepare('SELECT * FROM church_expenses WHERE church_id = ? AND expense_date >= ? AND expense_date < ? ORDER BY expense_date DESC').all(church.id, startDate, endDate);
    } else {
      expenses = await db.prepare('SELECT * FROM church_expenses WHERE church_id = ? ORDER BY expense_date DESC LIMIT 50').all(church.id);
    }

    const by_category = {};
    let total = 0;
    expenses.forEach(e => {
      const amt = parseFloat(e.amount);
      by_category[e.category] = (by_category[e.category] || 0) + amt;
      total += amt;
    });

    res.json({ expenses, summary: { by_category, total } });
  } catch (err) {
    console.error('Pastor expenses error:', err);
    res.status(500).json({ error: 'Erro ao carregar' });
  }
});

// GET /reports
router.get('/reports', async (req, res) => {
  try {
    const church = await getPastorChurch(req.user.id);
    if (!church) return res.json({ error: 'Igreja não encontrada' });

    const members = await db.prepare('SELECT COUNT(*) as count FROM church_roles WHERE church_id = ?').get(church.id);
    const prayers = await db.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN is_answered = true THEN 1 ELSE 0 END) as answered FROM prayers WHERE church_id = ?').get(church.id);
    const tithesSum = await db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM tithes WHERE church_id = ? AND (type = 'tithe' OR type = 'offering')").get(church.id);
    const expensesSum = await db.prepare('SELECT COALESCE(SUM(amount),0) as total FROM church_expenses WHERE church_id = ?').get(church.id);
    const events = await db.prepare('SELECT * FROM church_events WHERE church_id = ? AND event_date >= CURRENT_DATE ORDER BY event_date ASC LIMIT 5').all(church.id);

    const tithesTotal = parseFloat(tithesSum?.total || 0);
    const expensesTotal = parseFloat(expensesSum?.total || 0);

    res.json({
      members_count: parseInt(members?.count || 0),
      prayers_total: parseInt(prayers?.total || 0),
      prayers_answered: parseInt(prayers?.answered || 0),
      financial: {
        tithes: tithesTotal,
        expenses: expensesTotal,
        balance: tithesTotal - expensesTotal,
      },
      recent_events: events,
    });
  } catch (err) {
    console.error('Pastor reports error:', err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

module.exports = router;
