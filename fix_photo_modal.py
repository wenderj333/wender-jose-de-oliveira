with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar estado para foto selecionada e likes de fotos
old_state = """  const [postAmens, setPostAmens] = useState({});
  const [postLikeCounts, setPostLikeCounts] = useState({});"""

new_state = """  const [postAmens, setPostAmens] = useState({});
  const [postLikeCounts, setPostLikeCounts] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoLikes, setPhotoLikes] = useState({});
  const [photoComments, setPhotoComments] = useState({});
  const [photoComment, setPhotoComment] = useState("");
  const handlePhotoLike = (photoId) => {
    setPhotoLikes(prev => ({ ...prev, [photoId]: !prev[photoId] }));
  };
  const handlePhotoComment = (photoId) => {
    if (!photoComment.trim()) return;
    setPhotoComments(prev => ({ ...prev, [photoId]: [...(prev[photoId] || []), { text: photoComment, user: currentUser?.full_name || "Eu" }] }));
    setPhotoComment("");
  };"""

content = content.replace(old_state, new_state)

# Adicionar onClick na foto da galeria
old_gallery_img = """              {p.media_url && p.media_url.includes("video") ? (
                <video src={p.media_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
              ) : p.media_url ? (
                <img src={p.media_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />"""

new_gallery_img = """              {p.media_url && p.media_url.includes("video") ? (
                <video src={p.media_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
              ) : p.media_url ? (
                <img src={p.media_url} alt="" onClick={() => p._isGallery ? setSelectedPhoto(p) : null} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: p._isGallery ? "zoom-in" : "default" }} />"""

content = content.replace(old_gallery_img, new_gallery_img)

# Adicionar modal da foto
old_modal = """        {currentIndex !== null && <PhotoModal url={photos[currentIndex].url} onClose={closePhoto} onNext={nextPhoto} onPrev={prevPhoto} />}"""

new_modal = """        {currentIndex !== null && <PhotoModal url={photos[currentIndex].url} onClose={closePhoto} onNext={nextPhoto} onPrev={prevPhoto} />}
        {selectedPhoto && (
          <div onClick={() => setSelectedPhoto(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, overflow: "hidden", maxWidth: 500, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
              <img src={selectedPhoto.media_url} alt="" style={{ width: "100%", maxHeight: 400, objectFit: "cover" }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <button onClick={() => handlePhotoLike(selectedPhoto.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: photoLikes[selectedPhoto.id] ? "#e11d48" : "#555" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={photoLikes[selectedPhoto.id] ? "#e11d48" : "none"} stroke={photoLikes[selectedPhoto.id] ? "#e11d48" : "#555"} strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    {t("profile.likePhoto","Gostei")}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <input value={photoComment} onChange={e => setPhotoComment(e.target.value)} placeholder={t("profile.commentPhoto","Adicionar comentario...")} style={{ flex: 1, padding: "8px 12px", borderRadius: 20, border: "1px solid #ddd", fontSize: 13, outline: "none" }} onKeyDown={e => e.key === "Enter" && handlePhotoComment(selectedPhoto.id)} />
                  <button onClick={() => handlePhotoComment(selectedPhoto.id)} style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{t("profile.commentPhoto","Enviar")}</button>
                </div>
                <div style={{ maxHeight: 150, overflowY: "auto" }}>
                  {(photoComments[selectedPhoto.id] || []).map((c, i) => (
                    <div key={i} style={{ fontSize: 13, padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <b>{c.user}</b>: {c.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}"""

content = content.replace(old_modal, new_modal)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Modal foto: ' + ('OK' if 'selectedPhoto' in content else 'FALHOU'))
print('Like foto: ' + ('OK' if 'photoLikes' in content else 'FALHOU'))
print('Comentar foto: ' + ('OK' if 'photoComments' in content else 'FALHOU'))
