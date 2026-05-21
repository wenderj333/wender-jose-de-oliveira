code = open(r'src\pages\MuralGrid.jsx', encoding='utf-8', errors='ignore').read()
code = code.replace('bg_music_url: selectedSongUrl, bg_music_start: startTime, bg_music_duration: duration, content: comment', 'content: comment')
open(r'src\pages\MuralGrid.jsx', 'w', encoding='utf-8').write(code)
print('Feito!')
