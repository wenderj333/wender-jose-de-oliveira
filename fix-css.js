const fs = require('fs');
let c = fs.readFileSync('frontend/src/App.jsx', 'utf8');
if (!c.includes('main.css')) {
  c = "import './styles/main.css';\n" + c;
  fs.writeFileSync('frontend/src/App.jsx', c, 'utf8');
  console.log('CSS adicionado!');
} else {
  console.log('Ja tem CSS');
}
