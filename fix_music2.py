with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Grid de 4 colunas
content = content.replace(
    "display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12",
    "display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8"
)

# 2. Botao WhatsApp
wa_btn = """
                            <button onClick={() => { const txt = encodeURIComponent('\U0001f3b5 ' + song.title + (song.artist ? ' - ' + song.artist : '') + '\\n' + song.url); window.open('https://wa.me/?text=' + txt, '_blank'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#25D166', fontSize: 11, fontWeight: 600 }}>
                              <Share2 size={12} /> WA
                            </button>"""

old = "Trash2 size={12} />"
new = "Trash2 size={12} />" + wa_btn.replace("\\n", "\\\\n")

if "WA" not in content:
    content = content.replace(
        "</button>\n                            {(song.user_id",
        wa_btn + "\n                            {(song.user_id"
    )

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Grid 4 colunas: ' + ('OK' if "repeat(4, 1fr)" in content else 'FALHOU'))
print('WhatsApp btn: ' + ('OK' if 'wa.me' in content else 'FALHOU'))
