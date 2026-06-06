with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Adicionar estado para posts e aba ativa
old = "  const [showInfo, setShowInfo] = useState(false);"
new = """  const [showInfo, setShowInfo] = useState(false);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    if (!targetId) return;
    fetch((import.meta.env.VITE_API_URL || "") + "/api/feed?userId=" + targetId, {
      headers: { Authorization: "Bearer " + token }
    })
    .then(r => r.json())
    .then(data => setPosts(data.posts || data || []))
    .catch(() => {});
  }, [targetId, token]);"""

content = content.replace(old, new)

# Substituir secao de publicacoes
old2 = """      <div style={{ display: "flex", justifyContent: "center", gap: "60px", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: "1px solid #262626", padding: "15px 0", marginTop: "-1px" }}>
          <Grid size={12} /> Publicacoes
        </div>
      </div>"""

new2 = """      <div style={{ display: "flex", justifyContent: "center", gap: "40px", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", letterSpacing: "1px", borderTop: "1px solid #dbdbdb", marginTop: 16 }}>
        <div onClick={() => setActiveTab("posts")} style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: activeTab==="posts" ? "2px solid #262626" : "2px solid transparent", padding: "15px 0", cursor: "pointer" }}>
          <Grid size={12} /> {t("profile.posts","Publicacoes")}
        </div>
        <div onClick={() => setActiveTab("fotos")} style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: activeTab==="fotos" ? "2px solid #262626" : "2px solid transparent", padding: "15px 0", cursor: "pointer" }}>
          📸 {t("profile.photos","Fotos")}
        </div>
        <div onClick={() => setActiveTab("videos")} style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: activeTab==="videos" ? "2px solid #262626" : "2px solid transparent", padding: "15px 0", cursor: "pointer" }}>
          🎥 {t("profile.videos","Videos")}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3, marginTop: 3 }}>
        {posts
          .filter(p => activeTab === "posts" ? true : activeTab === "fotos" ? p.media_type === "foto" || (p.media_url && !p.media_url.includes(".mp4") && !p.media_url.includes("video")) : p.media_type === "video" || (p.media_url && (p.media_url.includes(".mp4") || p.media_url.includes("video"))))
          .map(p => (
            <div key={p.id} style={{ aspectRatio: "1", overflow: "hidden", background: "#f0f0f0", position: "relative" }}>
              {p.media_url && (p.media_type === "video" || p.media_url.includes("video")) ? (
                <video src={p.media_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
              ) : p.media_url ? (
                <img src={p.media_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 8, fontSize: 12, color: "#666", textAlign: "center" }}>{p.content?.slice(0,60)}</div>
              )}
            </div>
          ))
        }
        {posts.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#999" }}>Nenhuma publicacao ainda.</div>}
      </div>"""

content = content.replace(old2, new2)

with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
