code = open(r'src\App.jsx', encoding='utf-8').read()
code = code.replace(
    "style={{background:'transparent',border:'none',color:'white',display:'none',cursor:'pointer'}}",
    "style={{background:'transparent',border:'none',color:'white',cursor:'pointer'}}"
)
open(r'src\App.jsx', 'w', encoding='utf-8').write(code)
print('Feito!')
