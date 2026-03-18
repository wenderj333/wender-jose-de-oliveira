const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Profile.jsx', 'utf8');
c = c.trimEnd() + '\n';
// The file ends with } but needs );
// Check last few chars
console.log('Last 50 chars:', JSON.stringify(c.slice(-50)));