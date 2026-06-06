with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('Ã°Å¸â€\x9dÂ´', '📺')
content = content.replace('Ã°Å¸â€œâ€"', '📖')
content = content.replace('ðŸ\u201c¸', '📸')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
