with open('src/i18n/ru.json', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('EspaÃƒÂ±ol', 'Español')

with open('src/i18n/ru.json', 'w', encoding='utf-8') as f:
    f.write(content)
print('OK')
