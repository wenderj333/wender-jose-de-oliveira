with open('index.html', 'rb') as f:
    raw = f.read()

# Decodificar como latin-1 e recodificar como utf-8
text = raw.decode('latin-1')
# Corrigir double-encoding
import codecs
fixed = text.encode('latin-1').decode('utf-8', errors='replace')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(fixed)
print('Feito!')
