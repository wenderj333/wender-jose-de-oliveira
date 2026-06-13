share_menu = """
function ShareMenu({ song, onPublish }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef();
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#9333ea', fontSize: 11, fontWeight: 600 }}>
        <Share2 size={12} /> Partilhar
      </button>
      {open && (
        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: '110%', left: 0, right: 0, background: 'var(--card,#fff)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: 140 }}>
          <button onClick={(e) => { e.stopPropagation(); onPublish(e); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#9333ea' }}>
            \U0001f4f0 Mural
          </button>
          <button onClick={(e) => { e.stopPropagation(); const txt = encodeURIComponent('\U0001f3b5 ' + song.title + (song.artist ? ' - ' + song.artist : '') + ' ' + song.url); window.open('https://wa.me/?text=' + txt, '_blank'); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#25D166' }}>
            \U0001f4f1 WhatsApp
          </button>
          <button onClick={(e) => { e.stopPropagation(); window.open('https://t.me/share/url?url=' + encodeURIComponent(song.url) + '&text=' + encodeURIComponent('\U0001f3b5 ' + song.title), '_blank'); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#0088cc' }}>
            \u2708\ufe0f Telegram
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(song.url); alert('\u2705 Link copiado!'); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#555' }}>
            \U0001f517 Copiar Link
          </button>
        </div>
      )}
    </div>
  );
}
"""

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Substituir os dois botoes por ShareMenu
old = """            <button onClick={handlePublishClick} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#9333ea', fontSize: 11, fontWeight: 600 }}>
              <Share2 size={12} /> Mural
            </button>
            <button onClick={(e) => { e.stopPropagation(); const txt = encodeURIComponent('\U0001f3b5 ' + song.title + (song.artist ? ' - ' + song.artist : '') + ' ' + song.url); window.open('https://wa.me/?text=' + txt, '_blank'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#25D166' }}>
              <Share2 size={12} />
            </button>"""

new = """            <ShareMenu song={song} onPublish={handlePublishClick} />"""

content = content.replace(old, new)

# Inserir ShareMenu antes do SongCard
marker = "// \u2500\u2500\u2500 Song Card"
content = content.replace(marker, share_menu + "\n" + marker)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('ShareMenu inserido: ' + ('OK' if 'ShareMenu' in content else 'FALHOU'))
print('Botoes substituidos: ' + ('OK' if 'ShareMenu song={song}' in content else 'FALHOU'))
