with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    '<select value={photoVisibility} onChange={e=>setPhotoVisibility(e.target.value)} style={{padding:8,borderRadius:8,border:"1px solid #ddd",fontSize:13,width:"100%"}}>><option value="public">',
    '<select value={photoVisibility} onChange={e=>setPhotoVisibility(e.target.value)} style={{padding:8,borderRadius:8,border:"1px solid #ddd",fontSize:13,width:"100%",marginBottom:8}}><option value="public">'
)

c = c.replace(
    '<option value="private">🔒 So eu</option></select></div>)}',
    '<option value="private">🔒 So eu</option></select><button onClick={()=>photoInputRef.current?.click()} disabled={uploading} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontSize:14,width:"100%",marginTop:8}}>{uploading?"A fazer upload...":"📤 Publicar Foto"}</button></div>)}'
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
