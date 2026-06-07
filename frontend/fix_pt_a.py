with open('src/i18n/pt.json', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('Ã  ', 'à ')
content = content.replace('Ã ', 'à ')

with open('src/i18n/pt.json', 'w', encoding='utf-8') as f:
    f.write(content)
print('OK')
