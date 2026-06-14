with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Adicionar estado para o player modal
old_state = """  const [friendStatus, setFriendStatus] = useState(null);"""
new_state = """  const [friendStatus, setFriendStatus] = useState(null);
  const [playingPost, setPlayingPost] = useState(null);
  const audioRef = React.useRef(null);"""
content = content.replace(old_state, new_state)

# 2. Adicionar onClick no post de musica
old_div = """            <div key={p.id} style={{ aspectRatio: "1", overflow: "hidden", background: "#f0f0f0", position: "relative", cursor: "pointer" }}>"""
new_div = """            <div key={p.id} onClick={() => isMusic ? setPlayingPost(p) : null} style={{ aspectRatio: "1", overflow: "hidden", background: "#f0f0f0", position: "relative", cursor: "pointer" }}>"""
content = content.replace(old_div, new_div)

# 3. Adicionar player modal antes do fechamento do return
old_end = """        {currentIndex !== null && <PhotoModal url={photos[currentIndex].url} onClose={closePhoto} onNext={nextPhoto} onPrev={prevPhoto} />}"""
new_end = """        {currentIndex !== null && <PhotoModal url={photos[currentIndex].url} onClose={closePhoto} onNext={nextPhoto} onPrev={prevPhoto} />}
        {playingPost && (
          <div onClick={() => setPlayingPost(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: 24, maxWidth: 380, width: "100%", textAlign: "center" }}>
              <div style={{ width: 200, height: 200, borderRadius: 16, overflow: "hidden", margin: "0 auto 16px", background: "linear-gradient(135deg,#4a80d4,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {playingPost.cover_url ? <img src={playingPost.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 64 }}>🎵</span>}
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>{playingPost.content?.replace("🎵 ","").split("—")[0]?.trim()}</h3>
              <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px" }}>{playingPost.content?.split("—")[1]?.trim()}</p>
              <audio ref={audioRef} src={playingPost.audio_url} controls autoPlay style={{ width: "100%", marginBottom: 16 }} />
              <button onClick={() => setPlayingPost(null)} style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 600 }}>{t("profile.closePlayer","Fechar")}</button>
            </div>
          </div>
        )}"""
content = content.replace(old_end, new_end)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Player modal: ' + ('OK' if 'playingPost' in content else 'FALHOU'))
