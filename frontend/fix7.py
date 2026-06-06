with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'sidebar.verse' in line and 'VERSICULO DO DIA' in line:
        line = "            <p style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',opacity:0.8,marginBottom:8}}>📖 {t('sidebar.verse','VERSICULO DO DIA')}</p>\n"
    if 'Sala do Pastor' in line and 'BookOpen' in line and 'Å' in line:
        line = "              <Link to=\"/sala-pastor\" onClick={() => setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'#c9a84c',fontSize:'1rem',textDecoration:'none',padding:'11px 16px',borderBottom:'1px solid rgba(255,255,255,0.08)',fontWeight:600}}>\n                <BookOpen size={20}/> ✝️ <span className=\"nav-text\" style={{marginLeft:8}}>Sala do Pastor</span>\n              </Link>\n"
    new_lines.append(line)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('Feito!')
