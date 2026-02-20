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

// =================== COURSE PURCHASES TABLE ===================
(async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS course_purchases (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        course_type TEXT NOT NULL,
        currency TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        stripe_session_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[course] course_purchases table ready');
  } catch (e) { console.error('[course] purchases migration error:', e.message); }
})();

// =================== STRIPE PAYMENT ===================
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const COURSE_PRICE_FULL = 999; // €9.99 in cents
const COURSE_PRICE_DISCOUNT = 499; // €4.99 in cents (50% off with 5 referrals)
const SITE_URL = process.env.FRONTEND_URL || 'https://sigo-com-fe.vercel.app';

// POST /api/course/create-checkout — create Stripe checkout session
router.post('/create-checkout', async (req, res) => {
  try {
    if (!STRIPE_SECRET) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }
    const stripe = require('stripe')(STRIPE_SECRET);
    const { email, hasDiscount } = req.body;
    if (!email) return res.status(400).json({ error: 'Email obrigat\u00f3rio' });

    // Check if user has 5+ referrals for discount
    let price = COURSE_PRICE_FULL;
    if (hasDiscount) {
      const enrollment = await db.prepare('SELECT referral_code FROM course_enrollments WHERE email = ?').get(email.trim().toLowerCase());
      if (enrollment) {
        const refs = await db.prepare('SELECT COUNT(*) AS count FROM course_enrollments WHERE referred_by = ?').get(enrollment.referral_code);
        if (parseInt(refs?.count || 0) >= 5) {
          price = COURSE_PRICE_DISCOUNT;
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email.trim().toLowerCase(),
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: price === COURSE_PRICE_DISCOUNT
              ? 'Curso B\u00edblico Avan\u00e7ado (50% OFF) - Sigo com F\u00e9'
              : 'Curso B\u00edblico Avan\u00e7ado - Sigo com F\u00e9',
            description: 'Acesso completo ao Curso B\u00edblico Avan\u00e7ado com 20+ li\u00e7\u00f5es exclusivas.',
          },
          unit_amount: price,
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

// =================== NEW PAID COURSES ===================

// Regional pricing config
const COURSE_PRICES = {
  finance: {
    EUR: { amount: 1999, name: 'Finan\u00e7as B\u00edblicas - Sigo com F\u00e9' },
    USD: { amount: 1999, name: 'Biblical Finance - Sigo com F\u00e9' },
    BRL: { amount: 4990, name: 'Finan\u00e7as B\u00edblicas - Sigo com F\u00e9' },
  },
  theology: {
    EUR: { amount: 2999, name: 'Curso de Teologia - Sigo com F\u00e9' },
    USD: { amount: 2999, name: 'Theology Course - Sigo com F\u00e9' },
    BRL: { amount: 7990, name: 'Curso de Teologia - Sigo com F\u00e9' },
  },
};

function createCourseCheckout(courseType) {
  return async (req, res) => {
    try {
      if (!STRIPE_SECRET) return res.status(500).json({ error: 'Stripe not configured' });
      const stripe = require('stripe')(STRIPE_SECRET);
      const { email, currency, amount } = req.body;
      if (!email) return res.status(400).json({ error: 'Email obrigat\u00f3rio' });

      const cur = (currency || 'EUR').toUpperCase();
      const config = COURSE_PRICES[courseType]?.[cur] || COURSE_PRICES[courseType]?.EUR;
      const finalAmount = amount || config.amount;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: email.trim().toLowerCase(),
        line_items: [{
          price_data: {
            currency: cur.toLowerCase(),
            product_data: {
              name: config.name,
              description: courseType === 'finance'
                ? 'Acesso completo ao curso de Finan\u00e7as B\u00edblicas com 16+ li\u00e7\u00f5es.'
                : 'Acesso completo ao curso de Teologia com 21+ li\u00e7\u00f5es.',
            },
            unit_amount: finalAmount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${SITE_URL}/curso-${courseType === 'finance' ? 'financas' : 'teologia'}?paid=success&email=${encodeURIComponent(email)}`,
        cancel_url: `${SITE_URL}/curso-${courseType === 'finance' ? 'financas' : 'teologia'}?paid=cancel`,
        metadata: { email: email.trim().toLowerCase(), courseType },
      });

      // Record purchase attempt
      try {
        await db.prepare(
          'INSERT INTO course_purchases (email, course_type, currency, amount_cents, stripe_session_id) VALUES (?, ?, ?, ?, ?)'
        ).run(email.trim().toLowerCase(), courseType, cur, finalAmount, session.id);
      } catch (e) { console.error('[course] record purchase error:', e.message); }

      res.json({ url: session.url });
    } catch (e) {
      console.error(`[course] ${courseType} checkout error:`, e);
      res.status(500).json({ error: 'Erro ao criar pagamento' });
    }
  };
}

router.post('/create-checkout-finance', createCourseCheckout('finance'));
router.post('/create-checkout-theology', createCourseCheckout('theology'));

// =================== AUTO-MIGRATE: course_purchases ===================
(async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS course_purchases (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        course_type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'eur',
        stripe_session_id TEXT,
        status TEXT DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) { console.log('[course] course_purchases table ready'); }
})();

// POST /api/course/create-checkout-finance — Stripe checkout for Biblical Finance course
router.post('/create-checkout-finance', async (req, res) => {
  try {
    if (!STRIPE_SECRET) return res.status(500).json({ error: 'Stripe not configured' });
    const stripe = require('stripe')(STRIPE_SECRET);
    const { email, amount, currency } = req.body;
    if (!email) return res.status(400).json({ error: 'Email obrigat\u00f3rio' });

    const unitAmount = amount || 1999;
    const cur = currency || 'eur';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email.trim().toLowerCase(),
      line_items: [{
        price_data: {
          currency: cur,
          product_data: {
            name: 'Finan\u00e7as B\u00edblicas - Sigo com F\u00e9',
            description: 'Curso completo de Finan\u00e7as B\u00edblicas com 15 li\u00e7\u00f5es.',
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${SITE_URL}/curso-financas?paid=success&email=${encodeURIComponent(email)}`,
      cancel_url: `${SITE_URL}/curso-financas?paid=cancel`,
      metadata: { email: email.trim().toLowerCase(), course_type: 'finance' },
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error('[course] finance checkout error:', e);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

// POST /api/course/create-checkout-theology — Stripe checkout for Theology course
router.post('/create-checkout-theology', async (req, res) => {
  try {
    if (!STRIPE_SECRET) return res.status(500).json({ error: 'Stripe not configured' });
    const stripe = require('stripe')(STRIPE_SECRET);
    const { email, amount, currency } = req.body;
    if (!email) return res.status(400).json({ error: 'Email obrigat\u00f3rio' });

    const unitAmount = amount || 2999;
    const cur = currency || 'eur';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email.trim().toLowerCase(),
      line_items: [{
        price_data: {
          currency: cur,
          product_data: {
            name: 'Teologia Crist\u00e3 - Sigo com F\u00e9',
            description: 'Curso completo de Teologia com 20 li\u00e7\u00f5es aprofundadas.',
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${SITE_URL}/curso-teologia?paid=success&email=${encodeURIComponent(email)}`,
      cancel_url: `${SITE_URL}/curso-teologia?paid=cancel`,
      metadata: { email: email.trim().toLowerCase(), course_type: 'theology' },
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error('[course] theology checkout error:', e);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

module.exports = router;
