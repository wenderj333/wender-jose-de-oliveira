with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = """          <img src={user.cover_url} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }} onError={e => e.target.style.display = "none"} />"""
new = """          <img src={user.cover_url} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} onError={e => e.target.style.display = "none"} />"""

content = content.replace(old, new)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK: ' + ('center 30%' if 'center 30%' in content else 'FALHOU'))
