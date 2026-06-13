with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_wa = """encodeURIComponent('\U0001f3b5 ' + song.title + (song.artist ? ' - ' + song.artist : '') + ' https://sigo-com-fe-api.onrender.com/api/music/share/' + song.id)"""
new_wa = """encodeURIComponent('\U0001f3b5 ' + song.title + (song.artist ? ' - ' + song.artist : '') + '\\n\U0001f64f Partilhado via Sigo com Fe - Rede Social Crista\\n\U0001f517 https://sigo-com-fe-api.onrender.com/api/music/share/' + song.id)"""
content = content.replace(old_wa, new_wa)

old_tg = """encodeURIComponent('https://sigo-com-fe-api.onrender.com/api/music/share/' + song.id) + '&text=' + encodeURIComponent('\U0001f3b5 ' + song.title)"""
new_tg = """encodeURIComponent('https://sigo-com-fe-api.onrender.com/api/music/share/' + song.id) + '&text=' + encodeURIComponent('\U0001f3b5 ' + song.title + (song.artist ? ' - ' + song.artist : '') + '\\n\U0001f64f Sigo com Fe - Rede Social Crista')"""
content = content.replace(old_tg, new_tg)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Actualizar tambem o meta tag description no backend
with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\music.js', 'r', encoding='utf-8') as f:
    backend = f.read()

backend = backend.replace(
    "Ouvi esta musica na Sigo com Fe!",
    "Ouvi esta musica na Sigo com Fe - Rede Social Crista! Junta-te a nos em sigo-com-fe.vercel.app"
)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\music.js', 'w', encoding='utf-8') as f:
    f.write(backend)

print('Feito!')
