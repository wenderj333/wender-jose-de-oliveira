with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remover tab galeria e incluir fotos em Todas e Fotos
old_tabs = """  const tabs = [["all", t("profile.allPosts","Todas")], ["foto", t("profile.photos","Fotos")], ["video", t("profile.videos","Videos")], ["galeria", t("profile.gallery","Galeria")]];
  const filteredPosts = userPosts.filter(p => activeTab === "all" ? true : activeTab === "foto" ? (p.media_url && !p.media_url.includes("video")) : activeTab === "video" ? (p.media_url && p.media_url.includes("video")) : false);
  const displayPosts = activeTab === "foto" ? [...filteredPosts, ...photos.map(ph => ({ id: ph.id, media_url: ph.url, _isGallery: true }))] : filteredPosts;"""

new_tabs = """  const tabs = [["all", t("profile.allPosts","Todas")], ["foto", t("profile.photos","Fotos")], ["video", t("profile.videos","Videos")]];
  const galleryItems = photos.map(ph => ({ id: ph.id, media_url: ph.url, _isGallery: true }));
  const filteredPosts = userPosts.filter(p => activeTab === "foto" ? (p.media_url && !p.media_url.includes("video")) : activeTab === "video" ? (p.media_url && p.media_url.includes("video")) : true);
  const displayPosts = activeTab === "all" ? [...filteredPosts, ...galleryItems] : activeTab === "foto" ? [...filteredPosts, ...galleryItems] : filteredPosts;"""

content = content.replace(old_tabs, new_tabs)

# Remover o bloco da galeria separado
old_galeria = """{activeTab === "galeria" && (<div style={{ marginTop: 16 }}>{isOwner && <button onClick={() => setShowUploader(true)} style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 14, marginBottom: 12 }}>+ {t("profile.addPhoto","Adicionar Foto")}</button>}<div className="gallery-grid">{photos.map((p, index) => (<div key={p.id} className="gallery-item" onClick={() => openPhoto(index)}><img src={p.url} alt="" /></div>))}</div>{photos.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#999" }}>{t("profile.noPhotos","Nenhuma foto ainda.")}</div>}</div>)}"""

new_galeria = """{isOwner && activeTab === "all" && <button onClick={() => setShowUploader(true)} style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 14, marginBottom: 12, marginTop: 8 }}>+ {t("profile.addPhoto","Adicionar Foto")}</button>}"""

content = content.replace(old_galeria, new_galeria)

# Mudar activeTab !== "galeria" para sempre mostrar
content = content.replace(
    '{activeTab !== "galeria" && (<div style={{ display: "grid"',
    '{(<div style={{ display: "grid"'
)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Tabs: ' + ('OK' if '"video"' in content and 'galeria' not in content.split('tabs =')[1].split(';')[0] else 'verificar'))
print('displayPosts: ' + ('OK' if 'galleryItems' in content else 'FALHOU'))
