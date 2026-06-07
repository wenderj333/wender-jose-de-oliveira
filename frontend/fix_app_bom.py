with open('src/App.jsx', 'rb') as f:
    raw = f.read()
# Remover BOM se existir
if raw.startswith(b'\xef\xbb\xbf'):
    raw = raw[3:]
text = raw.decode('utf-8')
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('BOM removido!')
