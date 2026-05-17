const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = {
  async create({ email, password, full_name, role = 'member' }) {
    const password_hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    await db.query(
      'INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5)',
      [id, email, password_hash, full_name, role]
    );
    return { id, email, full_name, role, created_at: new Date().toISOString() };
  },
  async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },
  async findById(id) {
    const result = await db.query(
      'SELECT id, email, full_name, display_name, avatar_url, role, bio, last_seen_at, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },
  async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },
  async updateLastSeen(id) {
    await db.query('UPDATE users SET last_seen_at = NOW() WHERE id = $1', [id]);
  },
};
module.exports = User;