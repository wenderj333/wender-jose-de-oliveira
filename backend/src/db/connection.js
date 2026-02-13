const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

// Convert SQLite-style ? placeholders to PostgreSQL $1, $2, ...
function convertPlaceholders(sql) {
  let idx = 0;
  return sql.replace(/\?/g, () => `$${++idx}`);
}

// Convert SQLite functions to PostgreSQL equivalents
function convertSQL(sql) {
  return sql
    .replace(/datetime\('now'\)/gi, 'NOW()')
    .replace(/datetime\('now',\s*'([^']+)'\)/gi, (_, interval) => {
      // e.g. '-30 days' → NOW() - INTERVAL '30 days'
      const clean = interval.replace('-', '');
      return `NOW() - INTERVAL '${clean}'`;
    })
    .replace(/date\('now'\)/gi, 'CURRENT_DATE')
    .replace(/strftime\('%Y-%m-01',\s*(\w+)\)/gi, "to_char($1, 'YYYY-MM-01')")
    .replace(/julianday\('now'\)/gi, "EXTRACT(EPOCH FROM NOW())")
    .replace(/julianday\((\w+)\)/gi, "EXTRACT(EPOCH FROM $1)")
    .replace(/CAST\(\(EXTRACT\(EPOCH FROM NOW\(\)\)\s*-\s*EXTRACT\(EPOCH FROM (\w+)\)\)\s*\*\s*1440\s*AS INTEGER\)/gi,
      "EXTRACT(EPOCH FROM (NOW() - $1))::int / 60")
    .replace(/\bINTEGER\b/gi, 'INTEGER')
    .replace(/ON CONFLICT \((\w+), (\w+)\) DO UPDATE SET/gi, 'ON CONFLICT ($1, $2) DO UPDATE SET')
    .replace(/excluded\./gi, 'EXCLUDED.');
}

// Wrapper that mimics better-sqlite3 API but uses pg async
const db = {
  prepare(rawSql) {
    const sql = convertPlaceholders(convertSQL(rawSql));

    return {
      all(...params) {
        return pool.query(sql, params).then(r => r.rows);
      },
      get(...params) {
        return pool.query(sql, params).then(r => r.rows[0] || null);
      },
      run(...params) {
        return pool.query(sql, params).then(r => ({
          changes: r.rowCount,
          lastInsertRowid: r.rows?.[0]?.id || null,
        }));
      },
    };
  },

  async exec(sql) {
    await pool.query(convertSQL(sql));
  },

  pragma() {
    // no-op for PostgreSQL
  },
};

module.exports = db;
