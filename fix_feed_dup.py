with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\feed.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remover duplicados de coverUrl e musicTitle
old = """    let coverUrl = req.body.cover_url || null;
    let musicTitle = req.body.music_title || null;
    let coverUrl = req.body.cover_url || null;
    let musicTitle = req.body.music_title || null;"""

new = """    let coverUrl = req.body.cover_url || null;
    let musicTitle = req.body.music_title || null;"""

content = content.replace(old, new)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\feed.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Duplicados removidos: ' + ('OK' if content.count('let coverUrl') == 1 else 'FALHOU'))
