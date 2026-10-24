const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { pastor_id } = req.body || {};
    const amount = Math.round(Number(req.body?.amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount < 1 || amount > 10000) return res.status(400).json({ error: 'Valor invalido' });
    const description = req.body?.description === 'Dizimo' ? 'Dizimo' : 'Oferta';
    if (!pastor_id) return res.status(400).json({ error: 'Pastor ID obrigatorio' });

    const pastorRes = await db.query('SELECT id, full_name FROM users WHERE id = $1 AND role = $2', [pastor_id, 'pastor']);
    const pastor = pastorRes.rows[0];
    if (!pastor) return res.status(404).json({ error: 'Pastor nao encontrado' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: description || 'Dizimo/Oferta',
            description: `Dizimo para ${pastor.full_name}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'https://sigo-com-fe.vercel.app'}/dizimos?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://sigo-com-fe.vercel.app'}/dizimos?cancelled=true`,
      metadata: {
        user_id: req.user.id,
        pastor_id: pastor_id,
        description: description || 'Dizimo/Oferta',
      },
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Erro ao criar sessao de pagamento' });
  }
});

router.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const savePayment = async () => {
      try {
        const { user_id, pastor_id, description } = session.metadata || {};
        // A tabela "donations" nunca existiu: o pagamento fica em stripe_payments (criada no arranque).
        // O registo na lista do pastor só é feito na primeira vez (o Stripe reenvia avisos).
        const ins = await db.query(
          `INSERT INTO stripe_payments (user_id, pastor_id, amount, currency, stripe_session_id, description, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'completed')
           ON CONFLICT (stripe_session_id) DO NOTHING RETURNING id`,
          [user_id, pastor_id, session.amount_total / 100, String(session.currency || 'eur').toUpperCase().slice(0, 3), session.id, description]
        );
        if (!ins.rows.length) return;
        await db.query(
          `INSERT INTO offering_records (donor_id, pastor_id, amount, type, method, note, currency, verified)
           VALUES ($1, $2, $3, $4, 'stripe', $5, $6, true)`,
          [user_id, pastor_id, session.amount_total / 100, description === 'Dizimo' ? 'dizimo' : 'oferta', `Stripe - ${description}`, String(session.currency || 'eur').toUpperCase().slice(0, 3)]
        );
        console.log('Payment saved:', session.id);
      } catch (error) {
        console.error('Error saving payment:', error);
      }
    };
    savePayment();
  }
  res.json({ received: true });
});

router.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

module.exports = router;
