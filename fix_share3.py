with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = """          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(song.url); alert('\u2705 Link copiado!'); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#555' }}>
            \U0001f517 Copiar Link
          </button>"""

new = """          <button onClick={(e) => { e.stopPropagation(); window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(song.url), '_blank'); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#1877F2' }}>
            \U0001f1eb\U0001f1e7 Facebook
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(song.url); alert('\U0001f4f8 Link copiado! Cola no Instagram Stories ou Bio.'); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#E1306C' }}>
            \U0001f4f8 Instagram
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(song.url); alert('\u2705 Link copiado!'); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#555' }}>
            \U0001f517 Copiar Link
          </button>"""

content = content.replace(old, new)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Facebook: ' + ('OK' if 'facebook.com/sharer' in content else 'FALHOU'))
print('Instagram: ' + ('OK' if 'Instagram' in content else 'FALHOU'))
