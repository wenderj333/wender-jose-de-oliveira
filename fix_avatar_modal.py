with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar estado para mostrar foto de perfil em grande
old_state = """  const [selectedPhoto, setSelectedPhoto] = useState(null);"""
new_state = """  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);"""
content = content.replace(old_state, new_state)

# Adicionar click na foto de perfil
old_avatar = """            <img src={user.avatar_url || "/pro.jpg"} style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "1px solid #dbdbdb" }} onError={e => e.target.src = "/pro.jpg"} />"""
new_avatar = """            <img src={user.avatar_url || "/pro.jpg"} onClick={() => user.avatar_url && setShowAvatarModal(true)} style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "1px solid #dbdbdb", cursor: user.avatar_url ? "zoom-in" : "default" }} onError={e => e.target.src = "/pro.jpg"} />"""
content = content.replace(old_avatar, new_avatar)

# Adicionar modal da foto de perfil
old_modal = """        {currentIndex !== null && <PhotoModal url={photos[currentIndex].url} onClose={closePhoto} onNext={nextPhoto} onPrev={prevPhoto} />}"""
new_modal = """        {currentIndex !== null && <PhotoModal url={photos[currentIndex].url} onClose={closePhoto} onNext={nextPhoto} onPrev={prevPhoto} />}
        {showAvatarModal && (
          <div onClick={() => setShowAvatarModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
              <img src={user.avatar_url} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 16, objectFit: "contain" }} />
              <button onClick={() => setShowAvatarModal(false)} style={{ position: "absolute", top: -16, right: -16, background: "white", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18, fontWeight: 700 }}>×</button>
            </div>
          </div>
        )}"""
content = content.replace(old_modal, new_modal)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Avatar modal: ' + ('OK' if 'showAvatarModal' in content else 'FALHOU'))
