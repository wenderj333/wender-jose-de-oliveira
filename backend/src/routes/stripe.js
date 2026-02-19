const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// POST /api/stripe/create-checkout-session — create Stripe checkout session for donations
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { amount, description, pastor_id } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Valor inválido' });
    }

    if (!pastor_id) {
      return res.status(400).json({ error: 'Pastor ID é obrigatório' });
    }

    // Verify pastor exists
    const pastor = await db.prepare('SELECT id, full_name FROM users WHERE id = ? AND role = ?').get(pastor_id, 'pastor');
    if (!pastor) {
      return res.status(404).json({ error: 'Pastor não encontrado' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: description || 'Doação/Oferta',
              description: `Doação para ${pastor.full_name}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/doar?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/doar?cancelled=true`,
      metadata: {
        user_id: req.user.id,
        pastor_id: pastor_id,
        description: description || 'Doação/Oferta',
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
  }
});

// POST /api/stripe/webhook — Stripe webhook to confirm payments
router.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Save payment record to database
    const savePayment = async () => {
      try {
        const { user_id, pastor_id, description } = session.metadata;
        
        await db.prepare(
          `INSERT INTO stripe_payments (user_id, pastor_id, stripe_session_id, amount, currency, status, description)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
          user_id,
          pastor_id,
          session.id,
          session.amount_total / 100, // Convert back from cents
          session.currency,
          'completed',
          description
        );

        // Also create offering record for compatibility
        await db.prepare(
          `INSERT INTO offering_records (donor_id, pastor_id, amount, type, method, note)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(
          user_id,
          pastor_id,
          session.amount_total / 100,
          'oferta',
          'stripe',
          `Stripe payment - ${description}`
        );

        console.log('✅ Payment saved successfully:', session.id);
      } catch (error) {
        console.error('❌ Error saving payment:', error);
      }
    };

    savePayment();
  }

  res.json({ received: true });
});

// GET /api/stripe/config — return publishable key for frontend
router.get('/config', (req, res) => {
  try {
    res.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configuração do Stripe' });
  }
});

module.exports = router;