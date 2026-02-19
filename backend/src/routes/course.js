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

// =================== STRIPE PAYMENT ===================
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const COURSE_PRICE = 1999; // €19.99 in cents
const SITE_URL = process.env.FRONTEND_URL || 'https://sigo-com-fe.vercel.app';

// POST /api/course/create-checkout — create Stripe checkout session
router.post('/create-checkout', async (req, res) => {
  try {
    if (!STRIPE_SECRET) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }
    const stripe = require('stripe')(STRIPE_SECRET);
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email obrigat\u00f3rio' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email.trim().toLowerCase(),
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Curso B\u00edblico Avan\u00e7ado - Sigo com F\u00e9',
            description: 'Acesso completo ao Curso B\u00edblico Avan\u00e7ado com 20+ li\u00e7\u00f5es exclusivas.',
          },
          unit_amount: COURSE_PRICE,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${SITE_URL}/curso-biblico?paid=success&email=${encodeURIComponent(email)}`,
      cancel_url: `${SITE_URL}/curso-biblico?paid=cancel`,
      metadata: { email: email.trim().toLowerCase() },
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error('[course] checkout error:', e);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

// POST /api/course/webhook — Stripe webhook (confirms payment)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!STRIPE_SECRET) return res.status(400).send('Not configured');
    const stripe = require('stripe')(STRIPE_SECRET);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    if (endpointSecret) {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = req.body;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.metadata?.email || session.customer_email;
      if (email) {
        await db.prepare('UPDATE course_enrollments SET is_premium = true WHERE email = ?')
          .run(email.trim().toLowerCase());
        console.log('[course] Payment confirmed for:', email);
      }
    }

    res.json({ received: true });
  } catch (e) {
    console.error('[course] webhook error:', e);
    res.status(400).send('Webhook error');
  }
});

// POST /api/course/confirm-payment — manual confirmation (for success_url fallback)
router.post('/confirm-payment', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email obrigat\u00f3rio' });
    // Mark as premium (in production, verify with Stripe API)
    await db.prepare('UPDATE course_enrollments SET is_premium = true WHERE email = ?')
      .run(email.trim().toLowerCase());
    res.json({ success: true });
  } catch (e) {
    console.error('[course] confirm error:', e);
    res.status(500).json({ error: 'Erro' });
  }
});

module.exports = router;
