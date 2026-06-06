with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Encontra a linha com "Directo"
for line in content.split('\n'):
    if 'Directo' in line or 'VERSICULO' in line or 'Adiciona uma foto' in line:
        print(repr(line.strip()[:100]))
