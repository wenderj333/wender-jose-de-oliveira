with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

old = '      <div style={{ display: "flex", justifyContent: "center", gap: "60px", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>'
new = '      <div style={{display:"flex",justifyContent:"center",gap:"30px",fontSize:"12px",fontWeight:"600",borderTop:"1px solid #dbdbdb",marginTop:16}}>{[["all","Todas"],["foto","Fotos"],["video","Videos"]].map(([tab,label])=>(<div key={tab} onClick={()=>setActiveTab(tab)} style={{cursor:"pointer",padding:"12px 0",borderTop:activeTab===tab?"2px solid #262626":"2px solid transparent"}}>{label}</div>))}</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,marginTop:3}}>{userPosts.filter(p=>activeTab==="all"?true:activeTab==="foto"?(p.media_url&&!p.media_url.includes(".mp4")):(p.media_url&&p.media_url.includes(".mp4"))).map(p=>(<div key={p.id} style={{aspectRatio:"1",overflow:"hidden",background:"#f0f0f0"}}>{p.media_url&&p.media_url.includes(".mp4")?<video src={p.media_url} style={{width:"100%",height:"100%",objectFit:"cover"}} muted/>:p.media_url?<img src={p.media_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{padding:8,fontSize:11,color:"#666"}}>{(p.content||"").slice(0,50)}</div>}</div>))}{userPosts.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#999"}}>Nenhuma publicacao.</div>}</div>'

idx = c.find(old)
if idx > -1:
    end = c.find('</div>', idx + len(old))
    end2 = c.find('</div>', end + 1)
    end3 = c.find('</div>', end2 + 1)
    c = c[:idx] + new + c[end3+6:]
    print('OK secao!')
else:
    print('NAO encontrado')

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
