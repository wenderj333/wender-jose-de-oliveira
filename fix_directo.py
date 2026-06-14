with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "'\u00f0\u0178\u201c\u00b4 Directo'",
    "'\U0001f534 Directo'"
)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK: ' + ('Directo fixed' if '\U0001f534 Directo' in content else 'FALHOU'))
