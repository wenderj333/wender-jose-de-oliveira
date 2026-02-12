const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

const PastorSession = {
  async startSession(pastor_id, church_id, prayer_focus) {
    const id = uuidv4();
    db.prepare(
      `INSERT INTO pastor_prayer_sessions (id, pastor_id, church_id, prayer_focus)
       VALUES (?, ?, ?, ?)`
    ).run(id, pastor_id, church_id, prayer_focus);
    return db.prepare('SELECT * FROM pastor_prayer_sessions WHERE id = ?').get(id);
  },

  async endSession(session_id) {
    db.prepare(
      `UPDATE pastor_prayer_sessions
       SET is_live = 0, ended_at = datetime('now'),
           duration_minutes = CAST((julianday('now') - julianday(started_at)) * 1440 AS INTEGER)
       WHERE id = ?`
    ).run(session_id);
    return db.prepare('SELECT * FROM pastor_prayer_sessions WHERE id = ?').get(session_id);
  },

  async getLiveSessions() {
    return db.prepare(
      `SELECT ps.*, c.name AS church_name, u.full_name AS pastor_name, u.avatar_url
       FROM pastor_prayer_sessions ps
       JOIN churches c ON ps.church_id = c.id
       JOIN users u ON ps.pastor_id = u.id
       WHERE ps.is_live = 1
       ORDER BY ps.started_at DESC`
    ).all();
  },

  async incrementViewers(session_id) {
    db.prepare(
      'UPDATE pastor_prayer_sessions SET viewer_count = viewer_count + 1 WHERE id = ?'
    ).run(session_id);
  },

  async getLiveCount() {
    const row = db.prepare(
      'SELECT COUNT(*) AS count FROM pastor_prayer_sessions WHERE is_live = 1'
    ).get();
    return row.count;
  },
};

module.exports = PastorSession;
