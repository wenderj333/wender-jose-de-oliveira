with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "style={{ width: '100%', maxHeight: 400, objectFit: 'contain', display: 'block' }}",
    "style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }}"
)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK: ' + ('maxHeight 280' if 'maxHeight: 280' in content else 'FALHOU'))
