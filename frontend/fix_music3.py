with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Grid de 4 colunas
content = content.replace(
    "display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12",
    "display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8"
)

# 2. Botao WhatsApp - inserir ANTES do botao de apagar
old = """                            {(song.user_id === user.id || user.role === 'admin' || user.role === 'pastor') && (
                              <button onClick={() => { if (window.confirm(`Apagar "${song.title}"?`)) handleDelete(song.id); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#e11d48', fontSize: 11, fontWeight: 600 }}>
                                <Trash2 size={12} />
                              </button>
                            )}"""

new = """                            <button onClick={() => { const txt = encodeURIComponent('\U0001f3b5 ' + song.title + (song.artist ? ' - ' + song.artist : '') + ' ' + song.url); window.open('https://wa.me/?text=' + txt, '_blank'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#25D166', fontSize: 11, fontWeight: 600 }}>
                              <Share2 size={12} /> WA
                            </button>
                            {(song.user_id === user.id || user.role === 'admin' || user.role === 'pastor') && (
                              <button onClick={() => { if (window.confirm(`Apagar "${song.title}"?`)) handleDelete(song.id); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#e11d48', fontSize: 11, fontWeight: 600 }}>
                                <Trash2 size={12} />
                              </button>
                            )}"""

content = content.replace(old, new)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Grid 4: ' + ('OK' if "repeat(4, 1fr)" in content else 'FALHOU'))
print('WhatsApp: ' + ('OK' if 'wa.me' in content else 'FALHOU'))
