with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('ðŸ™\x8f', '🙏')

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
