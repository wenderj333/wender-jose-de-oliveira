with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = '      <div style={{ display: "flex", justifyContent: "center", gap: "60px", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>\n        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: "1px solid #262626", padding: "15px 0", marginTop: "-1px" }}>\n          <Grid size={12} /> Publicacoes\n        </div>\n      </div>'

new = '''      <div style={{ display:"flex", justifyContent:"center", gap:"30px", fontSize:"12px", fontWeight:"600", borderTop:"1px solid #dbdbdb", marginTop:16 }}>
        {[["all","Todas"],["foto","Fotos"],["video","Videos"]].map(([tab,label]) => (
          <div key={tab} onClick={() => setActiveTab(tab)} style={{ cursor:"pointer", padding:"12px 0", borderTop:activeTab===tab?"2px solid #262626":"2px solid transparent" }}>{label}</div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:3, marginTop:3 }}>
        {userPosts.filter(p => activeTab==="all" ? true : activeTab==="foto" ? (p.media_url && !p.media_url.match(/\\.(mp4|mov|webm)/i)) : (p.media_url && p.media_url.match(/\\.(mp4|mov|webm)/i))).map(p => (
          <div key={p.id} style={{ aspectRatio:"1", overflow:"hidden", background:"#f0f0f0" }}>
            {p.media_url && p.media_url.match(/\\.(mp4|mov|webm)/i) ? (
              <video src={p.media_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} muted playsInline />
            ) : p.media_url ? (
              <img src={p.media_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            ) : (
              <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", padding:8, fontSize:11, color:"#666" }}>{(p.content||"").slice(0,50)}</div>
            )}
          </div>
        ))}
        {userPosts.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", padding:40, color:"#999" }}>Nenhuma publicacao ainda.</div>}
      </div>'''

if old in content:
    content = content.replace(old, new)
    print("Passo 3 OK!")
else:
    print("NAO encontrado - tentando via linha")
    for i, line in enumerate(content.split("\n")):
        if "Publicacoes" in line and "Grid" in line:
            print(f"Linha {i}: {repr(line[:80])}")

with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
