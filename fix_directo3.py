with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'Directo' in line and '/live' in line:
        print(f'Linha {i}: {repr(line)}')
        lines[i] = "              ['/live', <PlayCircle size={20}/>, '\U0001f534 Directo'],\n"
        print(f'Corrigido: {lines[i]}')
        break

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\App.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Feito!')
