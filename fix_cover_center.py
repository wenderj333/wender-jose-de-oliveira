with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Centrar a foto de capa verticalmente
old_cover = """      {user.cover_url && <img src={user.cover_url} style={{ width: "100%", height: "200px", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />}"""
new_cover = """      {user.cover_url && (
        <div style={{ width: "100%", height: "200px", overflow: "hidden", position: "relative" }}>
          <img src={user.cover_url} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }} onError={e => e.target.style.display = "none"} />
        </div>
      )}"""

content = content.replace(old_cover, new_cover)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Cover centrado: ' + ('OK' if 'objectPosition' in content else 'FALHOU'))
