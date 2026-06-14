with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Carregar likes ao abrir o perfil
old_fetch = """    fetch(API + "/photos/" + targetId, { headers: { Authorization: "Bearer " + token } })
      .then(r => r.ok ? r.json() : { photos: [] }).then(d => setPhotos(d.photos || [])).catch(() => {});"""

new_fetch = """    fetch(API + "/photos/" + targetId, { headers: { Authorization: "Bearer " + token } })
      .then(r => r.ok ? r.json() : { photos: [] }).then(d => setPhotos(d.photos || [])).catch(() => {});
    fetch(API + "/feed/liked-posts", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json()).then(d => {
        const liked = {};
        (d.likedIds || []).forEach(id => { liked[id] = true; });
        setPostAmens(liked);
      }).catch(() => {});"""

content = content.replace(old_fetch, new_fetch)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Likes persistentes: ' + ('OK' if 'liked-posts' in content else 'FALHOU'))
