code = open(r'src\pages\MuralGrid.jsx', encoding='utf-8', errors='ignore').read()
code = code.replace('bg_music_url: selectedSongUrl,', 'bg_music_url: audioUrl || null,')
open(r'src\pages\MuralGrid.jsx', 'w', encoding='utf-8').write(code)
print('Feito! Ocorrencias restantes:', code.count('selectedSongUrl'))
