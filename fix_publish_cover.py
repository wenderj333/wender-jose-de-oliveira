with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = """    fd.append('audio_url', song.url);"""
new = """    fd.append('audio_url', song.url);
    if (song.cover_url) fd.append('cover_url', song.cover_url);
    if (song.title) fd.append('music_title', song.title);"""

content = content.replace(old, new)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('cover_url: ' + ('OK' if 'cover_url' in content else 'FALHOU'))
