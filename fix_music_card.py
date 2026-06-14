with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = """                  <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{p.cover_url ? "" : "🎵"}</div>
                    <div style={{ fontSize: 10, color: "white", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>{p.content?.replace("🎵 ","").split("—")[0]?.trim()}</div>
                  </div>"""

new = """                  <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: 8 }}>
                    <div style={{ fontSize: 36, marginBottom: 6 }}>🎵</div>
                    <div style={{ fontSize: 11, color: "white", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>{p.content?.replace("🎵 ","").split("—")[0]?.trim()}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{p.content?.split("—")[1]?.trim()}</div>
                  </div>"""

content = content.replace(old, new)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('OK')
