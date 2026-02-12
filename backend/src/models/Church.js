const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

const Church = {
  async create(data) {
    const { name, denomination, description, address, city, state, country, country_code, latitude, longitude, phone, email, pastor_id } = data;
    const id = uuidv4();
    db.prepare(
      `INSERT INTO churches (id, name, denomination, description, address, city, state, country, country_code, latitude, longitude, phone, email, pastor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, name, denomination, description, address, city, state, country, country_code, latitude, longitude, phone, email, pastor_id);
    return db.prepare('SELECT * FROM churches WHERE id = ?').get(id);
  },

  async findByCity(city) {
    return db.prepare(
      `SELECT c.*, u.full_name AS pastor_name
       FROM churches c LEFT JOIN users u ON c.pastor_id = u.id
       WHERE LOWER(c.city) = LOWER(?)
       ORDER BY c.name`
    ).all(city);
  },

  async findNearby(lat, lng, radiusKm = 25) {
    // SQLite doesn't have built-in trig functions by default, so we use a bounding box approximation
    // 1 degree latitude ≈ 111km
    const latDelta = radiusKm / 111.0;
    const lngDelta = radiusKm / (111.0 * Math.cos(lat * Math.PI / 180));
    return db.prepare(
      `SELECT * FROM churches
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL
         AND latitude BETWEEN ? AND ?
         AND longitude BETWEEN ? AND ?
       ORDER BY name
       LIMIT 50`
    ).all(lat - latDelta, lat + latDelta, lng - lngDelta, lng + lngDelta);
  },

  async getById(id) {
    return db.prepare(
      `SELECT c.*, u.full_name AS pastor_name
       FROM churches c LEFT JOIN users u ON c.pastor_id = u.id
       WHERE c.id = ?`
    ).get(id);
  },

  async getMembers(church_id) {
    return db.prepare(
      `SELECT cr.*, u.full_name, u.avatar_url, u.email, u.last_seen_at
       FROM church_roles cr
       JOIN users u ON cr.user_id = u.id
       WHERE cr.church_id = ?
       ORDER BY cr.role_type, u.full_name`
    ).all(church_id);
  },
};

module.exports = Church;
