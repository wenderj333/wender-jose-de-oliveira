const fs = require('fs');
let c = fs.readFileSync('frontend/src/App.jsx', 'utf8');

c = c.replace(
  /<Route path="\/pedidos-ajuda" element=\{\s*\} \/>/,
  '<Route path="/pedidos-ajuda" element={<HelpRequests />} />'
);
c = c.replace(
  /<Route path="\/pastor-dashboard" element=\{\s*\} \/>/,
  '<Route path="/pastor-dashboard" element={<PastorChat />} />'
);

fs.writeFileSync('frontend/src/App.jsx', c, 'utf8');
console.log('OK');