with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "aspectRatio: '1/1'" in line and 'onClick' not in line:
        if i > 0 and '<div style={{' in lines[i-1]:
            lines[i-1] = lines[i-1].replace(
                '<div style={{',
                '<div onClick={(e) => { e.stopPropagation(); if (!isVideo) onPlay(song); }} style={{ cursor: isVideo ? "default" : "pointer",'
            )
            print(f"onClick adicionado na linha {i-1}")
        break

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Feito!')
