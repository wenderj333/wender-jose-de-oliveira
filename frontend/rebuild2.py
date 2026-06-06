with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

old = '''      <div style={{ display: "flex", justifyContent: "center", gap: "60px", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: "1px solid #262626", padding: "15px 0", marginTop: "-1px" }}>
          <Grid size={12} /> Publicacoes
        </div>
      </div>'''

new = '''      <div style={{display:"flex",justifyContent:"center",gap:"20px",fontSize:"12px",fontWeight:"600",borderTop:"1px solid #dbdbdb",marginTop:16}}>
        <div onClick={()=>setActiveTab("all")} style={{cursor:"pointer",padding:"12px 4px",borderTop:activeTab==="all"?"2px solid #262626":"2px solid transparent"}}>Todas</div>
        <div onClick={()=>setActiveTab("foto")} style={{cursor:"pointer",padding:"12px 4px",borderTop:activeTab==="foto"?"2px solid #262626":"2px solid transparent"}}>📸 Fotos</div>
        <div onClick={()=>setActiveTab("video")} style={{cursor:"pointer",padding:"12px 4px",borderTop:activeTab==="video"?"2px solid #262626":"2px solid transparent"}}>🎥 Videos</div>
        <div onClick={()=>setActiveTab("galeria")} style={{cursor:"pointer",padding:"12px 4px",borderTop:activeTab==="galeria"?"2px solid #262626":"2px solid transparent"}}>🖼️ Galeria</div>
      </div>
      {activeTab !== "galeria" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,marginTop:3}}>
          {userPosts.filter(p=>activeTab==="all"?true:activeTab==="foto"?(p.media_url&&!p.media_url.includes("video")):(p.media_url&&p.media_url.includes("video"))).map(p=>(
            <div key={p.id} style={{aspectRatio:"1",overflow:"hidden",background:"#f0f0f0"}}>
              {p.media_url&&p.media_url.includes("video")?<video src={p.media_url} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>:p.media_url?<img src={p.media_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{padding:8,fontSize:11,color:"#666",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"}}>{(p.content||"").slice(0,60)}</div>}
            </div>
          ))}
          {userPosts.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#999"}}>Nenhuma publicacao ainda.</div>}
        </div>
      )}
      {activeTab === "galeria" && (
        <div style={{marginTop:16}}>
          {(!userId||userId===currentUser?.id) && (
            <div style={{marginBottom:12}}>
              <button onClick={()=>setShowUpload(!showUpload)} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:14}}>+ Adicionar Foto</button>
              {showUpload && (
                <div style={{background:"#f9f9fe",borderRadius:12,padding:16,marginTop:10,border:"1px solid #eee"}}>
                  <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadPhoto(e.target.files[0])}/>
                  <select value={photoVisibility} onChange={e=>setPhotoVisibility(e.target.value)} style={{padding:8,borderRadius:8,border:"1px solid #ddd",fontSize:13,width:"100%",marginBottom:8}}>
                    <option value="public">🌎 Publico</option>
                    <option value="friends">🤝 So irmaos</option>
                    <option value="private">🔒 So eu</option>
                  </select>
                  <input placeholder="Legenda" value={photoCaption} onChange={e=>setPhotoCaption(e.target.value)} style={{display:"block",width:"100%",padding:8,borderRadius:8,border:"1px solid #ddd",marginBottom:8,fontSize:13,boxSizing:"border-box"}}/>
                  <button onClick={()=>photoInputRef.current?.click()} disabled={uploading} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"10px 0",cursor:"pointer",fontSize:14,width:"100%"}}>{uploading?"A fazer upload...":"📤 Publicar Foto"}</button>
                </div>
              )}
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3}}>
            {photos.map(p=>(<div key={p.id} style={{aspectRatio:"1",overflow:"hidden",background:"#f0f0f0",position:"relative"}}><img src={p.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>{p.visibility==="friends"&&<span style={{position:"absolute",top:4,right:4}}>🤝</span>}{p.visibility==="private"&&<span style={{position:"absolute",top:4,right:4}}>🔒</span>}</div>))}
            {photos.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#999"}}>Nenhuma foto ainda.</div>}
          </div>
        </div>
      )}'''

if old in c:
    c = c.replace(old, new)
    print('Passo 2 OK!')
else:
    print('NAO encontrado')

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
