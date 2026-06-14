with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Substituir o texto corrompido pelo emoji correcto
old = "'\u00c3\u00b0\u00c5\u00b8\u2018\u00c2\u00b4 Directo'"
new = "'\U0001f534 Directo'"
content = content.replace(old, new)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Verificar
with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    check = f.read()
    
line = [l for l in check.split('\n') if 'Directo' in l and 'live' in l]
print('Linha:', line[0] if line else 'nao encontrado')
