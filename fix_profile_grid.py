with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Substituir o grid de posts para mostrar capa de musica e botao play
old_grid = """{activeTab !== "galeria" && (<div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3, marginTop: 3 }}>{filteredPosts.map(p => (<div key={p.id} style={{ aspectRatio: "1", overflow: "hidden", background: "#f0f0f0" }}>{p.media_url && p.media_url.includes("video") ? <video src={p.media_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline /> : p.media_url ? <img src={p.media_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ padding: 8, fontSize: 11, color: "#666", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>{(p.content || "").slice(0,60)}</div>}</div>))}{filteredPosts.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#999" }}>{t("profile.noPosts","Nenhuma publicacao"""

new_grid = """{activeTab !== "galeria" && (<div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3, marginTop: 3 }}>{filteredPosts.map(p => {
            const isMusic = p.audio_url && !p.media_url;
            const coverImg = p.cover_url || (isMusic ? null : null);
            return (
            <div key={p.id} style={{ aspectRatio: "1", overflow: "hidden", background: "#f0f0f0", position: "relative", cursor: "pointer" }}>
              {p.media_url && p.media_url.includes("video") ? (
                <video src={p.media_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
              ) : p.media_url ? (
                <img src={p.media_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : isMusic ? (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#4a80d4,#764ba2)", padding: 8 }}>
                  {coverImg ? <img src={coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} /> : null}
                  <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>🎵</div>
                    <div style={{ fontSize: 10, color: "white", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>{p.content?.replace("🎵 ","").split("—")[0]?.trim()}</div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 8, fontSize: 11, color: "#666", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>{(p.content || "").slice(0,60)}</div>
              )}
              {isMusic && (
                <div style={{ position: "absolute", bottom: 4, right: 4, background: "#4a80d4", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              )}
            </div>
            );
          })}{filteredPosts.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#999" }}>{t("profile.noPosts","Nenhuma publicacao"""

content = content.replace(old_grid, new_grid)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Grid musica: ' + ('OK' if 'isMusic' in content else 'FALHOU'))
