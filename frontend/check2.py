with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

for line in content.split('\n'):
    if 'VERSICULO DO DIA' in line or 'sidebar.verse' in line:
        print(repr(line.strip()[:150]))
