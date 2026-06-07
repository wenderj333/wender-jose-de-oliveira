with open('src/pages/Settings.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Remover todas as secoes duplicadas de foto de perfil exceto a primeira
foto_block = '''      <div style={{...sectionStyle, textAlign:"center"}}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>📸 Foto de Perfil</h3>
        <img src={avatar || form.avatar_url || "/pro.jpg"} onError={e=>e.target.src="/pro.jpg"} style={{width:100,height:100,borderRadius:"50%",objectFit:"cover",border:"3px solid #6C3FA0",marginBottom:12}} />
        <br/>
        <input ref={avatarInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadAvatar(e.target.files[0])} />
        <button onClick={()=>avatarInputRef.current?.click()} disabled={uploadingAvatar} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>
          {uploadingAvatar ? "A fazer upload..." : "Mudar Foto"}
        </button>
      </div>'''

# Contar quantas vezes aparece
count = c.count(foto_block)
print('Encontrado: ' + str(count) + ' vezes')

# Manter apenas a primeira, remover as restantes
first = c.find(foto_block)
result = c[:first + len(foto_block)]
rest = c[first + len(foto_block):]
rest = rest.replace(foto_block, '')
c = result + rest

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
