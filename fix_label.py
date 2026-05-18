f = open("frontend/src/pages/AjudaUmaVida.jsx", "rb")
content = f.read().decode("utf-8")
f.close()

old = "            <input value={pixKey} onChange={e=>setPixKey(e.target.value)}"
new = """            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,padding:10,marginTop:8}}>
              <span style={{fontSize:13,color:"white"}}>{mediaFile ? mediaFile.name : "Foto/Video (opcional)"}</span>
              <input type="file" accept="image/*,video/*" style={{display:"none"}} onChange={e=>setMediaFile(e.target.files[0])}/>
            </label>
            <input value={pixKey} onChange={e=>setPixKey(e.target.value)}"""

if old in content:
    content = content.replace(old, new)
    print("OK!")
else:
    print("NAO ENCONTRADO")

open("frontend/src/pages/AjudaUmaVida.jsx", "wb").write(content.encode("utf-8"))
print("Feito!")
