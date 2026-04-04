f = open(r'C:\Users\wender\Desktop\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', encoding='utf-8')
lines = f.readlines()
f.close()

for i, line in enumerate(lines):
    if "const [isMuted, setIsMuted] = useState(true);" in line:
        lines[i] = line.rstrip() + "\n  const [imageModal, setImageModal] = useState(null);\n"
        break

for i, line in enumerate(lines):
    if "reportOpen && (" in line:
        modal = "      {imageModal && (\n        <div onClick={() => setImageModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>\n          <img src={imageModal} alt='' style={{maxWidth:'95vw',maxHeight:'95vh',objectFit:'contain',borderRadius:12}} />\n          <button onClick={() => setImageModal(null)} style={{position:'fixed',top:16,right:16,background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',width:40,height:40,color:'white',cursor:'pointer',fontSize:24}}>x</button>\n        </div>\n      )}\n"
        lines[i] = modal + line
        break

f = open(r'C:\Users\wender\Desktop\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'w', encoding='utf-8')
f.writelines(lines)
f.close()
print('Feito!')
