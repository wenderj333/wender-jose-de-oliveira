with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Adicionar aba Galeria
old = '''        <div onClick={()=>setActiveTab("all")} style={{cursor:"pointer",padding:"12px 0",borderTop:activeTab==="all"?"2px solid #262626":"2px solid transparent"}}>Todas</div>
        <div onClick={()=>setActiveTab("foto")} style={{cursor:"pointer",padding:"12px 0",borderTop:activeTab==="foto"?"2px solid #262626":"2px solid transparent"}}>📸 Fotos</div>
        <div onClick={()=>setActiveTab("video")} style={{cursor:"pointer",padding:"12px 0",borderTop:activeTab==="video"?"2px solid #262626":"2px solid transparent"}}>🎥 Videos</div>'''

new = '''        <div onClick={()=>setActiveTab("all")} style={{cursor:"pointer",padding:"12px 0",borderTop:activeTab==="all"?"2px solid #262626":"2px solid transparent"}}>Todas</div>
        <div onClick={()=>setActiveTab("foto")} style={{cursor:"pointer",padding:"12px 0",borderTop:activeTab==="foto"?"2px solid #262626":"2px solid transparent"}}>📸 Fotos</div>
        <div onClick={()=>setActiveTab("video")} style={{cursor:"pointer",padding:"12px 0",borderTop:activeTab==="video"?"2px solid #262626":"2px solid transparent"}}>🎥 Videos</div>
        <div onClick={()=>setActiveTab("galeria")} style={{cursor:"pointer",padding:"12px 0",borderTop:activeTab==="galeria"?"2px solid #262626":"2px solid transparent"}}>🖼️ Galeria</div>'''

c = c.replace(old, new)

# Adicionar conteudo da galeria
old2 = "        {userPosts.length===0 && <div style={{gridColumn:\"1/-1\",textAlign:\"center\",padding:40,color:\"#999\"}}>Nenhuma publicacao ainda.</div>}"
new2 = """        {userPosts.length===0 && activeTab !== "galeria" && <div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#999"}}>Nenhuma publicacao ainda.</div>}
      </div>
      {activeTab==="galeria" && (
        <div style={{marginTop:16}}>
          {(!userId || userId===currentUser?.id) && (
            <div style={{marginBottom:16}}>
              <button onClick={()=>setShowUpload(!showUpload)} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:14}}>+ Adicionar Foto</button>
              {showUpload && (
                <div style={{background:"#f9f9fe",borderRadius:12,padding:16,marginTop:12,border:"1px solid #eee"}}>
                  <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadPhoto(e.target.files[0])} />
                  <button onClick={()=>photoInputRef.current?.click()} style={{background:"#eee",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",marginBottom:8}}>{uploading?"A fazer upload...":"Escolher foto"}</button>
                  <input placeholder="Legenda (opcional)" value={photoCaption} onChange={e=>setPhotoCaption(e.target.value)} style={{display:"block",width:"100%",padding:8,borderRadius:8,border:"1px solid #ddd",marginBottom:8,fontSize:13}} />
                  <select value={photoVisibility} onChange={e=>setPhotoVisibility(e.target.value)} style={{padding:8,borderRadius:8,border:"1px solid #ddd",fontSize:13}}>
                    <option value="public">🌎 Publico</option>
                    <option value="friends">🤝 So irmaos</option>
                    <option value="private">🔒 So eu</option>
                  </select>
                </div>
              )}
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3}}>
            {photos.map(p=>(
              <div key={p.id} style={{aspectRatio:"1",overflow:"hidden",background:"#f0f0f0",position:"relative"}}>
                <img src={p.url} alt={p.caption||""} style={{width:"100%",height:"100%",objectFit:"cover"}} />
              </div>
            ))}
            {photos.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#999"}}>Nenhuma foto ainda.</div>}
          </div>
        </div>"""

c = c.replace(old2, new2)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Passo 2 OK!')
