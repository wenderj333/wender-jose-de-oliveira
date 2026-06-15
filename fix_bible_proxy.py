with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\BibleAI.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Usar allorigins como proxy para resolver CORS
old_fetch1 = """const res = await fetch("https://bible-api.com/"+encodeURIComponent(book)+"+"+ch+"?translation="+translation+"");"""
new_fetch1 = """const bibleUrl = "https://bible-api.com/"+encodeURIComponent(book)+"+"+ch+"?translation="+translation;
      const res = await fetch("https://api.allorigins.win/get?url="+encodeURIComponent(bibleUrl));
      const raw = await res.json();
      const data = JSON.parse(raw.contents);"""

content = content.replace(old_fetch1, new_fetch1)
# Remover o segundo await res.json()
content = content.replace(
    """const res = await fetch("https://bible-api.com/"+encodeURIComponent(book)+"+"+ch+"?translation="+translation+"");
      const data = await res.json();""",
    new_fetch1
)

old_fetch2 = """const res = await fetch("https://bible-api.com/"+encodeURIComponent(search)+"?translation="+translation+"");
      const data = await res.json();"""
new_fetch2 = """const bibleUrl2 = "https://bible-api.com/"+encodeURIComponent(search)+"?translation="+translation;
      const res = await fetch("https://api.allorigins.win/get?url="+encodeURIComponent(bibleUrl2));
      const raw = await res.json();
      const data = JSON.parse(raw.contents);"""
content = content.replace(old_fetch2, new_fetch2)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\BibleAI.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Proxy: ' + ('OK' if 'allorigins' in content else 'FALHOU'))
