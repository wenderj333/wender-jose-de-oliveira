const fs = require('fs');
let c = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// Remove the hardcoded notification badge (the "2" that never goes away)
// Replace the entire Bell button+badge with a simple bell button
const oldBell = `<button className="icon-btn" style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',color:'white',cursor:'pointer',position:'relative'}}>
            <Bell size={18} />
            <span className="badge" style={{position:'absolute',top:-2,right:-2,background:'red',width:14,height:14,borderRadius:'50%',fontSize:9,display:'flex',alignItems:'center',justifyContent:'center'}}>2</span>
          </button>`;

const newBell = `<button className="icon-btn" style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',color:'white',cursor:'pointer'}}>
            <Bell size={18} />
          </button>`;

if (c.includes(oldBell)) {
  c = c.replace(oldBell, newBell);
  fs.writeFileSync('frontend/src/App.jsx', c, 'utf8');
  console.log('Bell badge removed!');
} else {
  console.log('Pattern not found - checking file...');
  const idx = c.indexOf('badge');
  console.log('badge at index:', idx);
  console.log('context:', c.substring(idx - 50, idx + 200));
}
