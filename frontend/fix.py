f = open(r'C:\Users\wender\Desktop\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', encoding='utf-8')
lines = f.readlines()
f.close()
old = lines[342]
new = old.replace('alt="post"', 'alt="post" onClick={() => window.open(mediaUrl, "_blank")}')
new = new.replace("display: 'block' }}", "display: 'block', cursor: 'zoom-in' }}")
lines[342] = new
f = open(r'C:\Users\wender\Desktop\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'w', encoding='utf-8')
f.writelines(lines)
f.close()
print('Feito!')
