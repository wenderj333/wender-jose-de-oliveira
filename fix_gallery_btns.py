with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Nao mostrar botao amen nem apagar em fotos da galeria
old_btn = """              <button onClick={(e) => { e.stopPropagation(); handlePostAmen(p.id, p.like_count); }} style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.3)", border: "none", borderRadius: 20, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, color: "white", fontSize: 11, fontWeight: 700 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={postAmens[p.id] ? "#e11d48" : "none"} stroke="white" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                {postLikeCounts[p.id] ?? p.like_count ?? 0}
              </button>
              {isOwner && (
                <button onClick={(e) => { e.stopPropagation(); handleDeletePost(p.id); }} style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>
                </button>
              )}"""

new_btn = """              {!p._isGallery && (
                <button onClick={(e) => { e.stopPropagation(); handlePostAmen(p.id, p.like_count); }} style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.3)", border: "none", borderRadius: 20, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, color: "white", fontSize: 11, fontWeight: 700 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={postAmens[p.id] ? "#e11d48" : "none"} stroke="white" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  {postLikeCounts[p.id] ?? p.like_count ?? 0}
                </button>
              )}
              {isOwner && !p._isGallery && (
                <button onClick={(e) => { e.stopPropagation(); handleDeletePost(p.id); }} style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>
                </button>
              )}"""

content = content.replace(old_btn, new_btn)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fix gallery btns: ' + ('OK' if '_isGallery' in content else 'FALHOU'))
