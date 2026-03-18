const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Profile.jsx', 'utf8');

// Remove the broken duplicate block (lines 38-42)
c = c.replace(
  /  useEffect\(\(\) => \{\s*\n\s*const API_BASE = import\.meta\.env\.VITE_API_URL \|\| '';\s*\n\s*const API = `\$\{API_BASE\}\/api`;\s*\n\s*\n\s*useEffect\(\(\) => \{/,
  '  useEffect(() => {'
);

fs.writeFileSync('frontend/src/pages/Profile.jsx', c, 'utf8');

// Verify
const opens = (c.match(/\(/g)||[]).length;
const closes = (c.match(/\)/g)||[]).length;
console.log('Fixed! Opens:', opens, 'Closes:', closes, 'Diff:', opens-closes);