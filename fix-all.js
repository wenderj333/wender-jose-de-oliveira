const fs = require('fs');
const dir = 'frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
let fixed = 0;
files.forEach(f => {
  const path = dir + '/' + f;
  let c = fs.readFileSync(path, 'utf8');
  if (c.includes("/api';")) {
    c = c.split("/api';").join('/api`;');
    fs.writeFileSync(path, c, 'utf8');
    console.log('FIXED:', f);
    fixed++;
  }
});
console.log('Total fixed:', fixed);