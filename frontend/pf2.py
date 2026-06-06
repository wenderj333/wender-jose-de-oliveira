with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

old = '''      <div style={{ display: "flex", justifyContent: "center", gap: "60px", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: "1px solid #262626", padding: "15px 0", marginTop: "-1px" }}>
          <Grid size={12} /> Publicacoes
        </div>
      </div>'''

new = '''      <div style={{display:"flex",justifyContent:"center",gap:"30px",fontSize:"12px",fontWeight:"600",borderTop:"1px solid #dbdbdb",marginTop:16}}>
        <div onClick={()=>setActiveTab("all")} style={{cursor:"pointer",padding:"12px 0",borderTop:activeTab==="all"?"2px solid #262626":"2px solid transparent"}}>Todas</div>
        <div onClick={()=>setActiveTab("foto")} style={{cursor:"pointer",padding:"12px 0",borderTop:activeTab==="foto"?"2px solid #262626":"2px solid transparent"}}>📸 Fotos</div>
        <div onClick={()=>setActiveTab("video")} style={{cursor:"pointer",padding:"12px 0",borderTop:activeTab==="video"?"2px solid #262626":"2px solid transparent"}}>🎥 Videos</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,marginTop:3}}>
        {userPosts
          .filter(p => activeTab==="all" ? true : activeTab==="foto" ? (p.media_url && !p.media_url.includes("video")) : (p.media_url && p.media_url.includes("video")))
          .map(p => (
            <div key={p.id} style={{aspectRatio:"1",overflow:"hidden",background:"#f0f0f0"}}>
              {p.media_url && p.media_url.includes("video")
                ? <video src={p.media_url} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>
                : p.media_url
                ? <img src={p.media_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <div style={{padding:8,fontSize:11,color:"#666",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>{(p.content||"").slice(0,50)}</div>
              }
            </div>
          ))
        }
        {userPosts.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#999"}}>Nenhuma publicacao ainda.</div>}
      </div>'''

if old in c:
    c = c.replace(old, new)
    print('Passo 2 OK!')
else:
    print('NAO encontrado')

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
