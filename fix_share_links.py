with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Substituir o link do Facebook para usar a rota de partilha
old_fb = """window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(song.url), '_blank')"""
new_fb = """window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent('https://sigo-com-fe-api.onrender.com/api/music/share/' + song.id), '_blank')"""
content = content.replace(old_fb, new_fb)

# Substituir o link do WhatsApp para usar a rota de partilha
old_wa = """encodeURIComponent('\U0001f3b5 ' + song.title + (song.artist ? ' - ' + song.artist : '') + ' ' + song.url)"""
new_wa = """encodeURIComponent('\U0001f3b5 ' + song.title + (song.artist ? ' - ' + song.artist : '') + ' https://sigo-com-fe-api.onrender.com/api/music/share/' + song.id)"""
content = content.replace(old_wa, new_wa)

# Substituir o link do Telegram
old_tg = """encodeURIComponent(song.url) + '&text=' + encodeURIComponent('\U0001f3b5 ' + song.title)"""
new_tg = """encodeURIComponent('https://sigo-com-fe-api.onrender.com/api/music/share/' + song.id) + '&text=' + encodeURIComponent('\U0001f3b5 ' + song.title)"""
content = content.replace(old_tg, new_tg)

# Substituir o copiar link
old_copy = """navigator.clipboard.writeText(song.url); alert('\u2705 Link copiado!');"""
new_copy = """navigator.clipboard.writeText('https://sigo-com-fe-api.onrender.com/api/music/share/' + song.id); alert('\u2705 Link copiado!');"""
content = content.replace(old_copy, new_copy)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Facebook share: ' + ('OK' if 'music/share' in content else 'FALHOU'))
