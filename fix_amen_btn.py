with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_btn = """              <button onClick={(e) => { e.stopPropagation(); handlePostAmen(p.id); }} style={{ position: "absolute", top: 4, right: 4, background: postAmens[p.id] ? "#e11d48" : "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>
                {postAmens[p.id] ? "\u2764\ufe0f" : "\U0001f90d"}
              </button>"""

new_btn = """              <button onClick={(e) => { e.stopPropagation(); handlePostAmen(p.id); }} style={{ position: "absolute", top: 4, right: 4, background: postAmens[p.id] ? "#e11d48" : "rgba(255,255,255,0.85)", border: "none", borderRadius: 20, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3, cursor: "pointer", fontSize: 11, fontWeight: 700, color: postAmens[p.id] ? "white" : "#e11d48" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={postAmens[p.id] ? "white" : "#e11d48"}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                {t("profile.amen","Amen")}
              </button>"""

content = content.replace(old_btn, new_btn)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Amen btn: OK')
