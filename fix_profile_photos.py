with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'const filteredPosts = userPosts.filter(p => activeTab === "all" ? true : activeTab === "foto" ? (p.media_url && !p.media_url.includes("video")) : activeTab === "video" ? (p.media_url && p.media_url.includes("video")) : false);'

new = 'const filteredPosts = userPosts.filter(p => activeTab === "all" ? true : activeTab === "foto" ? (p.media_url && !p.media_url.includes("video")) : activeTab === "video" ? (p.media_url && p.media_url.includes("video")) : false);\n  const displayPosts = activeTab === "foto" ? [...filteredPosts, ...photos.map(ph => ({ id: ph.id, media_url: ph.url, _isGallery: true }))] : filteredPosts;'

content = content.replace(old, new)

content = content.replace(
    '{activeTab !== "galeria" && (<div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3, marginTop: 3 }}>{filteredPosts.map(p => {',
    '{activeTab !== "galeria" && (<div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3, marginTop: 3 }}>{displayPosts.map(p => {'
)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('displayPosts: ' + ('OK' if 'displayPosts' in content else 'FALHOU'))
