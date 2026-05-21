require('dotenv').config();
const {Pool} = require('pg');
const p = new Pool({connectionString: process.env.DATABASE_URL});
p.query("SELECT email, role, password_hash FROM users WHERE email='sigocomfe333@gmail.com'").then(r=>{console.log(r.rows); p.end()});
