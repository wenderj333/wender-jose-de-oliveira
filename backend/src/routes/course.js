const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const crypto = require('crypto');

// Auto-migrate
(async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS course_enrollments (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        referral_code TEXT UNIQUE NOT NULL,
        referred_by TEXT,
        current_day INTEGER DEFAULT 0,
        is_premium BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[course] Table ready');
  } catch (e) { console.error('[course] Migration error:', e.message); }
})();

// Generate unique referral code
function genCode() {
  return 'SCF-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// POST /api/course/enroll — enroll in course
router.post('/enroll', async (req, res) => {
  try {
    const { name, email, referredBy } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Nome e email obrigatórios' });
    }

    // Check if already enrolled
    const existing = await db.prepare('SELECT * FROM course_enrollments WHERE email = ?').get(email.trim().toLowerCase());
    if (existing) {
      return res.json({ success: true, alreadyEnrolled: true, referralCode: existing.referral_code, currentDay: existing.current_day });
    }

    const referralCode = genCode();

    // If referred, validate referrer code
    let referrerId = null;
    if (referredBy) {
      const referrer = await db.prepare('SELECT id FROM course_enrollments WHERE referral_code = ?').get(referredBy.trim());
      if (referrer) referrerId = referredBy.trim();
    }

    await db.prepare(
      'INSERT INTO course_enrollments (name, email, referral_code, referred_by) VALUES (?, ?, ?, ?)'
    ).run(name.trim(), email.trim().toLowerCase(), referralCode, referrerId);

    res.json({ success: true, referralCode, currentDay: 0 });
  } catch (e) {
    console.error('[course] enroll error:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/course/status?email=X — get enrollment status
router.get('/status', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email obrigatório' });

    const enrollment = await db.prepare('SELECT * FROM course_enrollments WHERE email = ?').get(email.trim().toLowerCase());
    if (!enrollment) return res.json({ enrolled: false });

    // Count referrals
    const referrals = await db.prepare(
      'SELECT COUNT(*) AS count FROM course_enrollments WHERE referred_by = ?'
    ).get(enrollment.referral_code);

    res.json({
      enrolled: true,
      referralCode: enrollment.referral_code,
      currentDay: enrollment.current_day,
      isPremium: enrollment.is_premium,
      referralCount: parseInt(referrals?.count || 0),
      name: enrollment.name,
    });
  } catch (e) {
    console.error('[course] status error:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/course/complete-day — mark a day as complete
router.post('/complete-day', async (req, res) => {
  try {
    const { email, day } = req.body;
    if (!email || !day) return res.status(400).json({ error: 'Dados incompletos' });

    await db.prepare('UPDATE course_enrollments SET current_day = ? WHERE email = ? AND current_day < ?')
      .run(day, email.trim().toLowerCase(), day);

    // Check if reached day 10 with 5+ referrals → unlock premium
    const enrollment = await db.prepare('SELECT * FROM course_enrollments WHERE email = ?').get(email.trim().toLowerCase());
    if (enrollment) {
      const referrals = await db.prepare('SELECT COUNT(*) AS count FROM course_enrollments WHERE referred_by = ?').get(enrollment.referral_code);
      if (parseInt(referrals?.count || 0) >= 5 && !enrollment.is_premium) {
        await db.prepare('UPDATE course_enrollments SET is_premium = true WHERE email = ?').run(email.trim().toLowerCase());
      }
    }

    res.json({ success: true });
  } catch (e) {
    console.error('[course] complete error:', e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/course/total — total enrollments (public)
router.get('/total', async (req, res) => {
  try {
    const result = await db.prepare('SELECT COUNT(*) AS count FROM course_enrollments').get();
    res.json({ total: parseInt(result?.count || 0) });
  } catch (e) {
    res.json({ total: 0 });
  }
});

module.exports = router;
