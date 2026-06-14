with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar estado para capas de musica
old_state = """  const [postAmens, setPostAmens] = useState({});"""
new_state = """  const [postAmens, setPostAmens] = useState({});
  const [musicCovers, setMusicCovers] = useState({});

  useEffect(() => {
    if (!token) return;
    fetch(API + "/music?limit=100", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(d => {
        const covers = {};
        (d.songs || []).forEach(s => { if (s.cover_url) covers[s.url] = s.cover_url; });
        setMusicCovers(covers);
      }).catch(() => {});
  }, [token]);"""

content = content.replace(old_state, new_state)

# Usar musicCovers para mostrar capa
old_cover = """                  {p.cover_url ? <img src={p.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} /> : null}"""
new_cover = """                  {(p.cover_url || musicCovers[p.audio_url]) ? <img src={p.cover_url || musicCovers[p.audio_url]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} /> : null}"""

content = content.replace(old_cover, new_cover)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('musicCovers: ' + ('OK' if 'musicCovers' in content else 'FALHOU'))
