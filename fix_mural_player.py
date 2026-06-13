with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Adicionar cover e title ao MiniAudioPlayer
old_player = """    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.3)', borderRadius: 12, padding: '6px 10px', marginTop: 6 }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        preload="metadata"
      />
      <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7a9e7e,#c4b89a)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{t('mural.musicLabel')}</div>
        <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#7a9e7e,#c4b89a)', transition: 'width 0.1s' }} />
        </div>
      </div>
    </div>"""

new_player = """    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.3)', borderRadius: 12, padding: '8px 10px', marginTop: 6 }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        preload="metadata"
      />
      {cover ? (
        <img src={cover} alt="" onClick={toggle} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} />
      ) : (
        <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7a9e7e,#c4b89a)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
      )}
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{title}</div>}
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{t('mural.musicLabel')}</div>
        <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#7a9e7e,#c4b89a)', transition: 'width 0.1s' }} />
        </div>
      </div>
      {cover && (
        <button onClick={toggle} style={{ width: 32, height: 32, borderRadius: '50%', background: playing ? '#e11d48' : '#4a80d4', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
      )}
    </div>"""

content = content.replace(old_player, new_player)

# 2. Adicionar cover e title ao componente
old_func = "function MiniAudioPlayer({ src, isPlaying: propIsPlaying, onPlay: externalOnPlay, onPause: externalOnPause, onEnded: externalOnEnded }) {"
new_func = "function MiniAudioPlayer({ src, cover, title, isPlaying: propIsPlaying, onPlay: externalOnPlay, onPause: externalOnPause, onEnded: externalOnEnded }) {"
content = content.replace(old_func, new_func)

# 3. Passar cover e title quando e chamado
old_call = """(<MiniAudioPlayer src={musicUrl} onPlay={()=>setIsMusicPlaying(true)} onPause={()=>setIsMusicPlaying(false)} onEnded={()=>setIsMusicPlaying(false)} />)"""
new_call = """(<MiniAudioPlayer src={musicUrl} cover={post.cover_url} title={post.music_title || post.title} onPlay={()=>setIsMusicPlaying(true)} onPause={()=>setIsMusicPlaying(false)} onEnded={()=>setIsMusicPlaying(false)} />)"""
content = content.replace(old_call, new_call)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Cover no player: ' + ('OK' if 'cover ? (' in content else 'FALHOU'))
print('Title no player: ' + ('OK' if 'title &&' in content else 'FALHOU'))
print('Props passadas: ' + ('OK' if 'cover={post.cover_url}' in content else 'FALHOU'))
