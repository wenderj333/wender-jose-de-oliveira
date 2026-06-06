with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = "Ã°Å¸â€œâ€\u201d"
print(f"Encontrado: {target in content}")
content = content.replace(target, '📖')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
