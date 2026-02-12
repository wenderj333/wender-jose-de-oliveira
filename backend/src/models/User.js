const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const User = {
  async create({ email, password, full_name, role = 'member' }) {
    const password_hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO users (id, email, password_hash, full_name, role)
       VALUES (?, ?, ?, ?, ?)`
    );
    stmt.run(id, email, password_hash, full_name, role);
    return { id, email, full_name, role, created_at: new Date().toISOString() };
  },

  async findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  async findById(id) {
    return db.prepare(
      'SELECT id, email, full_name, display_name, avatar_url, role, bio, last_seen_at, created_at FROM users WHERE id = ?'
    ).get(id);
  },

  async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },

  async updateLastSeen(id) {
    db.prepare("UPDATE users SET last_seen_at = datetime('now') WHERE id = ?").run(id);
  },
};

module.exports = User;
