with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\BibleAI.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remover a linha duplicada
old = """      const raw = await res.json();
      const data = JSON.parse(raw.contents);
      const data = await res.json();"""
new = """      const raw = await res.json();
      const data = JSON.parse(raw.contents);"""

content = content.replace(old, new)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\BibleAI.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fix: OK')
