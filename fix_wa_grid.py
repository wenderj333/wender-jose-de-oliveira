with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = """            <button onClick={handlePublishClick} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#9333ea', fontSize: 11, fontWeight: 600 }}>
              <Share2 size={12} /> Mural
            </button>
            {canDelete && ("""

new = """            <button onClick={handlePublishClick} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#9333ea', fontSize: 11, fontWeight: 600 }}>
              <Share2 size={12} /> Mural
            </button>
            <button onClick={(e) => { e.stopPropagation(); const txt = encodeURIComponent('\U0001f3b5 ' + song.title + (song.artist ? ' - ' + song.artist : '') + ' ' + song.url); window.open('https://wa.me/?text=' + txt, '_blank'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#25D166' }}>
              <Share2 size={12} />
            </button>
            {canDelete && ("""

content = content.replace(old, new)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('WhatsApp SongCard: ' + ('OK' if content.count('wa.me') >= 1 else 'FALHOU'))
