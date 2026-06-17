with open(r'C:\Users\wender\Desktop\duelo-biblico\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Remover todos os emojis
content = re.sub(r'[\U00010000-\U0010ffff]', '', content)
# Corrigir textos especificos
content = content.replace('Sigo com Fe - 7 Idiomas', 'Sigo com Fe | 7 Idiomas')
content = content.replace('Duelo BÃ¡blico', 'Duelo Biblico')
content = content.replace('FÃ©', 'Fe')

with open(r'C:\Users\wender\Desktop\duelo-biblico\index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('OK')
