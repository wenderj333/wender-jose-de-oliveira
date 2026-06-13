with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "aspectRatio: '1/1'" in line and 'onClick' not in line:
        # Linha anterior deve ser o inicio da div - adicionar onClick
        if i > 0 and '<div style={{' in lines[i-1]:
            lines[i-1] = lines[i-1].replace(
                '<div style={{',
                '<div onClick={(e) => { e.stopPropagation(); if (!isVideo) onPlay(song); }} style={{ cursor: isVideo ? "default" : "pointer", position: "relative",'
            )
            print(f"onClick adicionado na linha {i-1}")
        break

# Adicionar icone play sobreposto - depois da img
for i, line in enumerate(lines):
    if "objectFit: 'cover' }}" in line and 'pointerEvents' not in line and i > 540 and i < 570:
        lines[i] = lines[i].replace(
            "objectFit: 'cover' }}",
            "objectFit: 'cover', pointerEvents: 'none' }}"
        )
        # Inserir overlay depois da img
        overlay = """          {!isVideo && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isPlaying ? (
                <div style={{ display: 'flex', gap: 3 }}>
                  <div style={{ width: 4, height: 18, background: '#fff', borderRadius: 2, animation: 'eq-bar 0.6s ease-in-out infinite alternate' }} />
                  <div style={{ width: 4, height: 18, background: '#fff', borderRadius: 2, animation: 'eq-bar 0.7s ease-in-out infinite alternate' }} />
                  <div style={{ width: 4, height: 18, background: '#fff', borderRadius: 2, animation: 'eq-bar 0.8s ease-in-out infinite alternate' }} />
                </div>
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#4a80d4"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              )}
            </div>
          )}
"""
        lines.insert(i+1, overlay)
        print(f"Overlay adicionado depois da linha {i}")
        break

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MusicLibrary.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Feito!')
