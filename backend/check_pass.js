require('dotenv').config();
const bcrypt = require('bcryptjs');
const hash = '\\\/P1I/IxytxE8gZ.ed6t.U/33xwxcgIC29m50dmfP5zCW4G';
bcrypt.compare('Lindaojose3333', hash).then(r => console.log('Password correta:', r));
