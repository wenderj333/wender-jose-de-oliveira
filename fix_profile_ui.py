with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix botao Amen estilo Instagram + play centrado
old_music_div = """              ) : isMusic ? (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#4a80d4,#764ba2)", padding: 8 }}>
                  {coverImg ? <img src={coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} /> : null}
                  <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>🎵</div>
                    <div style={{ fontSize: 10, color: "white", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>{p.content?.replace("🎵 ","").split("—")[0]?.trim()}</div>
                  </div>
                </div>"""

new_music_div = """              ) : isMusic ? (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#4a80d4,#764ba2)", position: "relative" }}>
                  {p.cover_url ? <img src={p.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} /> : null}
                  <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{p.cover_url ? "" : "🎵"}</div>
                    <div style={{ fontSize: 10, color: "white", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>{p.content?.replace("🎵 ","").split("—")[0]?.trim()}</div>
                  </div>
                </div>"""

content = content.replace(old_music_div, new_music_div)

# Fix botao play - maior e centrado
old_play = """              {isMusic && (
                <div style={{ position: "absolute", bottom: 4, right: 4, background: "#4a80d4", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              )}"""

new_play = """              {isMusic && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                  </div>
                </div>
              )}"""

content = content.replace(old_play, new_play)

# Fix botao Amen estilo Instagram - coração simples
old_btn = """              <button onClick={(e) => { e.stopPropagation(); handlePostAmen(p.id); }} style={{ position: "absolute", top: 4, right: 4, background: postAmens[p.id] ? "#e11d48" : "rgba(255,255,255,0.85)", border: "none", borderRadius: 20, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3, cursor: "pointer", fontSize: 11, fontWeight: 700, color: postAmens[p.id] ? "white" : "#e11d48" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={postAmens[p.id] ? "white" : "#e11d48"}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                {t("profile.amen","Amen")}
              </button>"""

new_btn = """              <button onClick={(e) => { e.stopPropagation(); handlePostAmen(p.id); }} style={{ position: "absolute", bottom: 6, left: 6, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, color: "white", textShadow: "0 1px 3px rgba(0,0,0,0.8)", fontSize: 12, fontWeight: 700 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={postAmens[p.id] ? "#e11d48" : "none"} stroke="white" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>"""

content = content.replace(old_btn, new_btn)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Play centrado: ' + ('OK' if 'inset: 0' in content else 'FALHOU'))
print('Capa musica: ' + ('OK' if 'p.cover_url' in content else 'FALHOU'))
print('Amen Instagram: ' + ('OK' if 'strokeWidth' in content else 'FALHOU'))
