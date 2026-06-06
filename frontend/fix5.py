with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

broken = '\xc3\xb0\xc5\xb8\xe2\x80\x9c\xe2\x80\x9c'
print(f"Encontrado: {broken in content}")
content = content.replace(broken, '📖')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
