with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar estado para amens por post
old_state = """  const [playingPost, setPlayingPost] = useState(null);
  const audioRef = React.useRef(null);"""
new_state = """  const [playingPost, setPlayingPost] = useState(null);
  const audioRef = React.useRef(null);
  const [postAmens, setPostAmens] = useState({});
  const handlePostAmen = async (postId) => {
    if (postAmens[postId]) return;
    setPostAmens(prev => ({ ...prev, [postId]: true }));
    try {
      await fetch(API + "/feed/" + postId + "/like", { method: "POST", headers: { Authorization: "Bearer " + token } });
    } catch(e) {}
  };"""
content = content.replace(old_state, new_state)

# Adicionar botao Amen em cada post do grid
old_play_btn = """              {isMusic && (
                <div style={{ position: "absolute", bottom: 4, right: 4, background: "#4a80d4", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              )}"""
new_play_btn = """              {isMusic && (
                <div style={{ position: "absolute", bottom: 4, right: 4, background: "#4a80d4", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); handlePostAmen(p.id); }} style={{ position: "absolute", top: 4, right: 4, background: postAmens[p.id] ? "#e11d48" : "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>
                {postAmens[p.id] ? "❤️" : "🤍"}
              </button>"""
content = content.replace(old_play_btn, new_play_btn)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Amen btn: ' + ('OK' if 'handlePostAmen' in content else 'FALHOU'))
