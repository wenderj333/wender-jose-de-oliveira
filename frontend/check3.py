with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

for line in content.split('\n'):
    if 'sidebar.verse' in line:
        # Mostra os primeiros 30 chars antes do {t(
        idx = line.find('}>')
        snippet = line[idx+2:idx+35]
        print(repr(snippet))
