with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

broken = '\u00c3\u00b0\u00c5\u00b8\u20ac\u0153\u20ac\u201c'
print(f"Encontrado: {broken in content}")
content = content.replace(broken, '📖')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
