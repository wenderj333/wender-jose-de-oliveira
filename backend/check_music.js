const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'COLA_AQUI_O_URL_COMPLETO', ssl: { rejectUnauthorized: false } });
async function check() {
  const r = await pool.query('SELECT id, title, artist, url FROM music LIMIT 10');
  console.log("Total musicas:", r.rows.length);
  r.rows.forEach(m => console.log("-", m.title, "|", m.url ? m.url.substring(0,50) : "SEM URL"));
  pool.end();
}
check().catch(e => { console.error("Erro:", e.message); pool.end(); });