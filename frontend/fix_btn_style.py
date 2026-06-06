with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"10px 0",cursor:"pointer",fontSize:14,width:"100%"}}>{uploading?"A fazer upload...":"📤 Publicar Foto"}',
    'style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontSize:14,marginTop:8}}>{uploading?t("profile.uploading","A fazer upload..."):"📤 "+t("profile.publishPhoto","Publicar Foto")}'
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
