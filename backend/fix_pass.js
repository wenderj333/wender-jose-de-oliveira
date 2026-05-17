require('dotenv').config();
const bcrypt = require('bcryptjs');
const {Pool} = require('pg');
const p = new Pool({connectionString: process.env.DATABASE_URL});
bcrypt.hash('Lindaojose3333', 10).then(h => {
  console.log('Novo hash:', h);
  return p.query("UPDATE users SET password_hash='" + h + "' WHERE email='sigocomfe333@gmail.com'");
}).then(r => {
  console.log('Atualizado:', r.rowCount);
  p.end();
});
