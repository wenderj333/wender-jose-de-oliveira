const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

const Prayer = {
  async create({ author_id, church_id, title, content, category, visibility, is_urgent }) {
    const id = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO prayers (id, author_id, church_id, title, content, category, visibility, is_urgent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(id, author_id, church_id || null, title, content, category || 'other', visibility || 'public', is_urgent ? 1 : 0);
    return db.prepare('SELECT * FROM prayers WHERE id = ?').get(id);
  },

  async getFeed({ church_id, limit = 20, offset = 0 }) {
    if (church_id) {
      return db.prepare(
        `SELECT p.*, u.full_name AS author_name, u.avatar_url AS author_avatar,
                c.name AS church_name
         FROM prayers p
         JOIN users u ON p.author_id = u.id
         LEFT JOIN churches c ON p.church_id = c.id
         WHERE p.church_id = ? AND p.visibility = 'public'
         ORDER BY p.is_urgent DESC, p.created_at DESC
         LIMIT ? OFFSET ?`
      ).all(church_id, limit, offset);
    }
    return db.prepare(
      `SELECT p.*, u.full_name AS author_name, u.avatar_url AS author_avatar,
              c.name AS church_name
       FROM prayers p
       JOIN users u ON p.author_id = u.id
       LEFT JOIN churches c ON p.church_id = c.id
       WHERE p.visibility = 'public'
       ORDER BY p.is_urgent DESC, p.created_at DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset);
  },

  async getAnswered({ limit = 20, offset = 0 }) {
    return db.prepare(
      `SELECT p.*, u.full_name AS author_name, u.avatar_url AS author_avatar
       FROM prayers p
       JOIN users u ON p.author_id = u.id
       WHERE p.is_answered = 1
       ORDER BY p.answered_at DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset);
  },

  async markAnswered(id, testimony) {
    db.prepare(
      `UPDATE prayers SET is_answered = 1, answered_testimony = ?, answered_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ?`
    ).run(testimony, id);
    return db.prepare('SELECT * FROM prayers WHERE id = ?').get(id);
  },

  async addPrayerResponse(prayer_id, user_id, message) {
    const id = uuidv4();
    // Use INSERT OR REPLACE to handle the UNIQUE constraint
    db.prepare(
      `INSERT INTO prayer_responses (id, prayer_id, user_id, message)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (prayer_id, user_id) DO UPDATE SET message = excluded.message, created_at = datetime('now')`
    ).run(id, prayer_id, user_id, message);
    // Increment counter
    db.prepare("UPDATE prayers SET prayer_count = prayer_count + 1, updated_at = datetime('now') WHERE id = ?").run(prayer_id);
    return db.prepare(
      'SELECT * FROM prayer_responses WHERE prayer_id = ? AND user_id = ?'
    ).get(prayer_id, user_id);
  },

  async getPrayerResponses(prayer_id) {
    return db.prepare(
      `SELECT pr.*, u.full_name, u.avatar_url
       FROM prayer_responses pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.prayer_id = ?
       ORDER BY pr.created_at DESC`
    ).all(prayer_id);
  },

  async getById(id) {
    return db.prepare(
      `SELECT p.*, u.full_name AS author_name, u.avatar_url AS author_avatar
       FROM prayers p JOIN users u ON p.author_id = u.id
       WHERE p.id = ?`
    ).get(id);
  },
};

module.exports = Prayer;
