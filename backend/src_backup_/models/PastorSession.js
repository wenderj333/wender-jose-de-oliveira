const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

const PastorSession = {
  async startSession(pastor_id, church_id, prayer_focus) {
    const id = uuidv4();
    await db.prepare(
      `INSERT INTO pastor_prayer_sessions (id, pastor_id, church_id, prayer_focus)
       VALUES (?, ?, ?, ?)`
    ).run(id, pastor_id, church_id, prayer_focus);
    return await db.prepare('SELECT * FROM pastor_prayer_sessions WHERE id = ?').get(id);
  },

  async endSession(session_id) {
    await db.prepare(
      `UPDATE pastor_prayer_sessions
       SET is_live = false, ended_at = NOW(),
           duration_minutes = EXTRACT(EPOCH FROM (NOW() - started_at))::int / 60
       WHERE id = ?`
    ).run(session_id);
    return await db.prepare('SELECT * FROM pastor_prayer_sessions WHERE id = ?').get(session_id);
  },

  async getLiveSessions() {
    return await db.prepare(
      `SELECT ps.*, c.name AS church_name, u.full_name AS pastor_name, u.avatar_url
       FROM pastor_prayer_sessions ps
       JOIN churches c ON ps.church_id = c.id
       JOIN users u ON ps.pastor_id = u.id
       WHERE ps.is_live = true
       ORDER BY ps.started_at DESC`
    ).all();
  },

  async incrementViewers(session_id) {
    await db.prepare(
      'UPDATE pastor_prayer_sessions SET viewer_count = viewer_count + 1 WHERE id = ?'
    ).run(session_id);
  },

  async getLiveCount() {
    const row = await db.prepare(
      'SELECT COUNT(*) AS count FROM pastor_prayer_sessions WHERE is_live = true'
    ).get();
    return row.count;
  },
};

module.exports = PastorSession;
