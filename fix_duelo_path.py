with open(r'C:\Users\wender\Desktop\duelo-biblico\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remover emojis corrompidos
import re
content = re.sub(r'[^\x00-\x7F\u00C0-\u024F\u0400-\u04FF\s]', '', content)

# Corrigir textos
content = content.replace('Duelo Biblico', 'Duelo Biblico')
content = content.replace('Sigo com Fe', 'Sigo com Fe')

with open(r'C:\Users\wender\Desktop\duelo-biblico\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK')
