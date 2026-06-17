with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    c = f.read()

lines = c.split("\n")
for i, line in enumerate(lines):
    if "desafio-biblico" in line and "button" in line:
        new = '      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>\n        <button onClick={()=>window.location.href="/desafio-biblico"} style={{padding:"8px 16px",borderRadius:20,border:"none",background:"linear-gradient(135deg,#6c47d4,#e74c3c)",color:"white",cursor:"pointer",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>🎮 Desafio Biblico</button>\n        <button onClick={()=>window.open("https://duelo-biblico.vercel.app","_blank")} style={{padding:"8px 16px",borderRadius:20,border:"none",background:"linear-gradient(135deg,#c0392b,#922b21)",color:"white",cursor:"pointer",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>⚔️ Duelo Biblico</button>\n      </div>'
        lines[i] = new
        print("OK linha", i)
        break

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))