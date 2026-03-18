const fs = require('fs');
const c = fs.readFileSync('frontend/src/pages/Profile.jsx', 'utf8');
const lines = c.split('\n');
// Find unclosed brackets
let opens = 0;
let closes = 0;
c.split('').forEach(ch => {
  if(ch === '(') opens++;
  if(ch === ')') closes++;
});
console.log('Opens:', opens, 'Closes:', closes, 'Diff:', opens-closes);