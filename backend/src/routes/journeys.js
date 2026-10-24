const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const JOURNEYS = { 'gratidao-e-oracao': { days: 7 } };
const validJourney = (id) => Object.prototype.hasOwnProperty.call(JOURNEYS, String(id || ''));

// Tabelas (journey_responses já existia: user_id é TEXT, por isso as junções usam u.id::text)
const ready = (async () => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS journey_responses (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      journey_id TEXT NOT NULL,
      day_index INTEGER NOT NULL,
      response_text TEXT NOT NULL,
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    // Remove duplicados antigos antes do índice único (fica a resposta mais recente)
    await db.query(`DELETE FROM journey_responses a USING journey_responses b
      WHERE a.user_id = b.user_id AND a.journey_id = b.journey_id AND a.day_index = b.day_index AND a.id < b.id`).catch(() => {});
    await db.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_journey_resp_unique ON journey_responses(user_id, journey_id, day_index)').catch(() => {});
    await db.query(`CREATE TABLE IF NOT EXISTS journey_starts (
      user_id TEXT NOT NULL, journey_id TEXT NOT NULL, started_on DATE NOT NULL DEFAULT CURRENT_DATE, finished_at TIMESTAMPTZ,
      PRIMARY KEY (user_id, journey_id))`);
    await db.query(`CREATE TABLE IF NOT EXISTS journey_progress (
      user_id TEXT NOT NULL, journey_id TEXT NOT NULL, day_index INTEGER NOT NULL, completed_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, journey_id, day_index))`);
    await db.query(`CREATE TABLE IF NOT EXISTS journey_amens (
      response_id INTEGER NOT NULL, user_id TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (response_id, user_id))`);
    await db.query(`CREATE TABLE IF NOT EXISTS journey_amen_notified (
      response_id INTEGER NOT NULL, user_id TEXT NOT NULL, PRIMARY KEY (response_id, user_id))`);
    await db.query(`CREATE TABLE IF NOT EXISTS journey_reminders (
      user_id TEXT NOT NULL, journey_id TEXT NOT NULL, day_index INTEGER NOT NULL, sent_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, journey_id, day_index))`);
  } catch (e) { console.error('[journeys] migration', e.message); }
})();

function viewer(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  try { return jwt.verify(h.slice(7), JWT_SECRET); } catch (_) { return null; }
}
const pickLang = (v) => { const k = String(v || 'pt').slice(0, 2).toLowerCase(); return ['pt', 'es', 'en', 'de', 'fr', 'ro', 'ru'].includes(k) ? k : 'pt'; };

// Quantos dias estão abertos: 1 no dia em que começou, +1 por cada dia que passa (no máximo 7)
async function stateFor(userId, journeyId) {
  const total = JOURNEYS[journeyId].days;
  const st = await db.query(`SELECT to_char(started_on, 'YYYY-MM-DD') AS started_on, finished_at, (CURRENT_DATE - started_on)::int AS elapsed
    FROM journey_starts WHERE user_id = $1 AND journey_id = $2`, [String(userId), journeyId]);
  const start = st.rows[0] || null;
  const done = await db.query('SELECT day_index FROM journey_progress WHERE user_id = $1 AND journey_id = $2 ORDER BY day_index', [String(userId), journeyId]);
  const resp = await db.query('SELECT id, day_index, response_text, is_public FROM journey_responses WHERE user_id = $1 AND journey_id = $2 ORDER BY day_index', [String(userId), journeyId]);
  const completed = done.rows.map(r => Number(r.day_index));
  // nunca abre menos dias do que os já concluídos + 1
  const unlocked = start ? Math.min(total, Math.max(Number(start.elapsed) + 1, completed.length ? Math.max(...completed) : 1)) : 1;
  const responses = {};
  resp.rows.forEach(r => { responses[r.day_index] = { id: r.id, response_text: r.response_text, is_public: !!r.is_public }; });
  return { started: !!start, startedOn: start?.started_on || null, finished: completed.length >= total, total, unlocked, completed, responses };
}

// GET /api/journeys/state?journeyId=X — o meu progresso
router.get('/state', authenticate, async (req, res) => {
  try {
    await ready;
    const journeyId = String(req.query.journeyId || '');
    if (!validJourney(journeyId)) return res.status(404).json({ error: 'journey' });
    res.set('Cache-Control', 'no-store');
    res.json(await stateFor(req.user.id, journeyId));
  } catch (e) { console.error('[journeys] state', e.message); res.status(500).json({ error: 'server' }); }
});

// POST /api/journeys/start { journeyId } — começar (ou recomeçar depois de terminar)
router.post('/start', authenticate, async (req, res) => {
  try {
    await ready;
    const journeyId = String(req.body?.journeyId || '');
    if (!validJourney(journeyId)) return res.status(404).json({ error: 'journey' });
    if (req.body?.restart) {
      await db.query('DELETE FROM journey_progress WHERE user_id = $1 AND journey_id = $2', [String(req.user.id), journeyId]);
      await db.query('DELETE FROM journey_reminders WHERE user_id = $1 AND journey_id = $2', [String(req.user.id), journeyId]);
      await db.query('DELETE FROM journey_starts WHERE user_id = $1 AND journey_id = $2', [String(req.user.id), journeyId]);
    }
    await db.query('INSERT INTO journey_starts (user_id, journey_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [String(req.user.id), journeyId]);
    res.json(await stateFor(req.user.id, journeyId));
  } catch (e) { console.error('[journeys] start', e.message); res.status(500).json({ error: 'server' }); }
});

// POST /api/journeys/complete { journeyId, dayIndex } — concluir um dia (só se já estiver aberto)
router.post('/complete', authenticate, async (req, res) => {
  try {
    await ready;
    const journeyId = String(req.body?.journeyId || '');
    const day = parseInt(req.body?.dayIndex, 10);
    if (!validJourney(journeyId) || !(day >= 1 && day <= JOURNEYS[journeyId].days)) return res.status(400).json({ error: 'bad_request' });
    await db.query('INSERT INTO journey_starts (user_id, journey_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [String(req.user.id), journeyId]);
    const before = await stateFor(req.user.id, journeyId);
    if (day > before.unlocked) return res.status(403).json({ error: 'locked', unlocked: before.unlocked });
    await db.query('INSERT INTO journey_progress (user_id, journey_id, day_index) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [String(req.user.id), journeyId, day]);
    const after = await stateFor(req.user.id, journeyId);
    if (after.finished && !before.finished) await db.query('UPDATE journey_starts SET finished_at = NOW() WHERE user_id = $1 AND journey_id = $2', [String(req.user.id), journeyId]);
    res.json({ ...after, justFinished: after.finished && !before.finished });
  } catch (e) { console.error('[journeys] complete', e.message); res.status(500).json({ error: 'server' }); }
});

// POST /api/journeys/respond — guardar/editar a resposta ao desafio do dia
router.post('/respond', authenticate, async (req, res) => {
  try {
    await ready;
    const { journeyId, dayIndex, responseText, isPublic } = req.body || {};
    const day = parseInt(dayIndex, 10);
    const text = String(responseText || '').trim().slice(0, 2000);
    if (!validJourney(journeyId) || !(day >= 1 && day <= JOURNEYS[journeyId].days) || !text) return res.status(400).json({ error: 'Missing fields' });
    if (isPublic) {
      try {
        const reason = await require('../services/requestGuard').checkRequest(text, 'comment');
        if (reason) return res.status(422).json({ error: 'moderated', reason });
      } catch (_) { /* sem guardião: segue */ }
    }
    const r = await db.query(`INSERT INTO journey_responses (user_id, journey_id, day_index, response_text, is_public)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, journey_id, day_index) DO UPDATE SET response_text = EXCLUDED.response_text, is_public = EXCLUDED.is_public
      RETURNING id`, [String(req.user.id), journeyId, day, text, !!isPublic]);
    await db.query('INSERT INTO journey_starts (user_id, journey_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [String(req.user.id), journeyId]);
    res.json({ success: true, id: r.rows[0].id });
  } catch (e) { console.error('[journeys] respond', e.message); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/journeys/my?journeyId=X — compatibilidade com a versão antiga
router.get('/my', authenticate, async (req, res) => {
  try {
    await ready;
    const r = await db.query('SELECT day_index, response_text, is_public FROM journey_responses WHERE user_id = $1 AND journey_id = $2 ORDER BY day_index', [String(req.user.id), String(req.query.journeyId || '')]);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/journeys/public?journeyId=X&dayIndex=Y — mural de gratidão do dia
router.get('/public', async (req, res) => {
  try {
    await ready;
    const me = viewer(req);
    const journeyId = String(req.query.journeyId || '');
    const day = parseInt(req.query.dayIndex, 10);
    if (!validJourney(journeyId) || !(day >= 1)) return res.json([]);
    const r = await db.query(`
      SELECT jr.id, jr.response_text, jr.created_at, jr.user_id,
             split_part(COALESCE(NULLIF(u.display_name, ''), u.full_name, ''), ' ', 1) AS user_name, u.avatar_url,
             (SELECT COUNT(*)::int FROM journey_amens a WHERE a.response_id = jr.id) AS amen_count,
             EXISTS (SELECT 1 FROM journey_amens a WHERE a.response_id = jr.id AND a.user_id = $3) AS amened
        FROM journey_responses jr
        LEFT JOIN users u ON u.id::text = jr.user_id
       WHERE jr.journey_id = $1 AND jr.day_index = $2 AND jr.is_public = true
       ORDER BY jr.created_at DESC
       LIMIT 30`, [journeyId, day, me ? String(me.id) : '']);
    res.json(r.rows.map(row => ({ ...row, is_mine: !!me && String(row.user_id) === String(me.id), user_id: undefined })));
  } catch (e) { console.error('[journeys] public', e.message); res.status(500).json({ error: 'Server error' }); }
});

// POST /api/journeys/responses/:id/amen — Amém numa resposta (avisa quem escreveu, uma vez)
router.post('/responses/:id/amen', authenticate, async (req, res) => {
  try {
    await ready;
    const id = parseInt(req.params.id, 10);
    if (!(id > 0)) return res.status(404).json({ error: 'not_found' });
    const resp = await db.query('SELECT jr.user_id, u.language FROM journey_responses jr LEFT JOIN users u ON u.id::text = jr.user_id WHERE jr.id = $1 AND jr.is_public = true', [id]);
    if (!resp.rows[0]) return res.status(404).json({ error: 'not_found' });
    const removed = await db.query('DELETE FROM journey_amens WHERE response_id = $1 AND user_id = $2 RETURNING 1', [id, String(req.user.id)]);
    let amened = false;
    if (!removed.rows[0]) {
      await db.query('INSERT INTO journey_amens (response_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, String(req.user.id)]);
      amened = true;
      const owner = resp.rows[0];
      // avisa só da primeira vez (tirar e voltar a dar Amém não repete o aviso)
      const first = await db.query('INSERT INTO journey_amen_notified (response_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING 1', [id, String(req.user.id)]);
      if (first.rows[0] && owner.user_id && String(owner.user_id) !== String(req.user.id)) {
        const who = String(req.user.full_name || '').trim().split(/\s+/)[0] || '🙏';
        const T = { pt: `${who} disse Amém à sua gratidão 🙏`, es: `${who} dijo Amén a tu gratitud 🙏`, en: `${who} said Amen to your gratitude 🙏`, de: `${who} hat zu deiner Dankbarkeit Amen gesagt 🙏`, fr: `${who} a dit Amen à votre gratitude 🙏`, ro: `${who} a spus Amin recunoștinței tale 🙏`, ru: `${who} сказал(а) «Аминь» вашей благодарности 🙏` };
        try { require('./notifications').createNotification(owner.user_id, 'like', T[pickLang(owner.language)], '', { url: '/journeys', kind: 'journey_amen', from: String(req.user.id) }); } catch (_) { /* ignore */ }
      }
    }
    const c = await db.query('SELECT COUNT(*)::int AS n FROM journey_amens WHERE response_id = $1', [id]);
    res.json({ amened, amen_count: c.rows[0].n });
  } catch (e) { console.error('[journeys] amen', e.message); res.status(500).json({ error: 'server' }); }
});

// Lembrete diário: "O dia N da sua Jornada já está aberto" (uma vez por dia, entre as 9h e as 20h de Madrid/Lisboa/Brasil aprox.)
const REMIND = {
  pt: (n) => [`🙏 Dia ${n} da sua Jornada de Gratidão`, 'O desafio de hoje já está aberto. Reserve alguns minutos com Deus.'],
  es: (n) => [`🙏 Día ${n} de tu Jornada de Gratitud`, 'El desafío de hoy ya está disponible. Reserva unos minutos con Dios.'],
  en: (n) => [`🙏 Day ${n} of your Gratitude Journey`, 'Today’s challenge is ready. Take a few minutes with God.'],
  de: (n) => [`🙏 Tag ${n} deiner Dankbarkeitsreise`, 'Die heutige Aufgabe ist bereit. Nimm dir ein paar Minuten mit Gott.'],
  fr: (n) => [`🙏 Jour ${n} de votre Parcours de Gratitude`, 'Le défi du jour est prêt. Prenez quelques minutes avec Dieu.'],
  ro: (n) => [`🙏 Ziua ${n} din Călătoria Recunoștinței`, 'Provocarea de azi este gata. Rezervă câteva minute cu Dumnezeu.'],
  ru: (n) => [`🙏 День ${n} вашего Пути благодарности`, 'Задание на сегодня готово. Уделите несколько минут Богу.'],
};
async function sendJourneyReminders(force = false) {
  try {
    await ready;
    const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Europe/Madrid' }).format(new Date())) % 24;
    if (!force && (hour < 9 || hour >= 20)) return;
    const r = await db.query(`
      SELECT s.user_id, s.journey_id, LEAST($1::int, (CURRENT_DATE - s.started_on)::int + 1) AS day_open, u.language
        FROM journey_starts s
        JOIN users u ON u.id::text = s.user_id
       WHERE s.finished_at IS NULL AND (CURRENT_DATE - s.started_on) BETWEEN 1 AND 6
         AND NOT EXISTS (SELECT 1 FROM journey_progress p WHERE p.user_id = s.user_id AND p.journey_id = s.journey_id
                          AND p.day_index = LEAST($1::int, (CURRENT_DATE - s.started_on)::int + 1))
       LIMIT 500`, [7]);
    const { createNotification } = require('./notifications');
    for (const row of r.rows) {
      const ins = await db.query('INSERT INTO journey_reminders (user_id, journey_id, day_index) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING 1', [row.user_id, row.journey_id, row.day_open]);
      if (!ins.rows[0]) continue;
      const [title, body] = (REMIND[pickLang(row.language)] || REMIND.pt)(row.day_open);
      await createNotification(row.user_id, 'reminder', title, body, { url: '/journeys', kind: 'journey_day', day: row.day_open });
    }
  } catch (e) { console.error('[journeys] reminders', e.message); }
}
setInterval(sendJourneyReminders, 30 * 60 * 1000);
setTimeout(sendJourneyReminders, 60 * 1000);

router.sendJourneyReminders = sendJourneyReminders;
module.exports = router;
