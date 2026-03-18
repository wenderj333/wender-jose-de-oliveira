const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Profile.jsx', 'utf8');
// Find the useEffect that's missing closing
c = c.replace(
  /(\s*fetchProfileData\(\);\s*\}, \[userId, currentUser\?\.id, token\]\);)/,
  '$1\n'
);
// Check if there's a double useEffect issue
const count = (c.match(/useEffect/g) || []).length;
console.log('useEffect count:', count);
const lines = c.split('\n');
lines.forEach((l, i) => {
  if(l.includes('useEffect') || l.includes('}, [')) {
    console.log(i+1, l);
  }
});