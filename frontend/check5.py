with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'Adiciona uma foto' in line:
        print("Encontrado:", repr(line[:80]))
    new_lines.append(line)
