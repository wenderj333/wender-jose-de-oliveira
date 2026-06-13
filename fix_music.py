with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Grid de 4 colunas em vez de 2
content = content.replace(
    "display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12",
    "display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8"
)

# 2. Adicionar botao de partilha WhatsApp no SongCard - depois do botao Mural
old_share = """            <button onClick={() => handlePublish(song).then(() => alert('\\u2705 Publicado no Mural!')).catch(() => alert('\\u274c Erro'))} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#9333ea', fontSize: 11, fontWeight: 600 }}>
                              <Share2 size={12} /> Mural
                            </button>"""

new_share = """            <button onClick={() => handlePublish(song).then(() => alert('\\u2705 Publicado no Mural!')).catch(() => alert('\\u274c Erro'))} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#9333ea', fontSize: 11, fontWeight: 600 }}>
                              <Share2 size={12} /> Mural
                            </button>
                            <button onClick={() => { const txt = encodeURIComponent('\\ud83cdfb5 ' + song.title + (song.artist ? ' - ' + song.artist : '') + '\\n' + song.url); window.open('https://wa.me/?text=' + txt, '_blank'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#25D166', fontSize: 11, fontWeight: 600 }}>
                              <Share2 size={12} /> WA
                            </button>"""

content = content.replace(old_share, new_share)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
