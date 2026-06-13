with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Encontrar a linha da div da capa
for i, line in enumerate(lines):
    if "aspectRatio: '1/1'" in line and 'onClick' not in line:
        print(f"Linha {i}: {line.rstrip()}")
        break
