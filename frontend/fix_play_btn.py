with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Adicionar botao play personalizado depois do video
    if "onPause={handleInternalVideoPause}" in line and i > 360 and i < 410:
        new_lines.append(line)
        new_lines.append("""          {!isPlaying && (
            <div onClick={() => videoRef.current?.play()} style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              background: 'rgba(0,0,0,0.6)', borderRadius: '50%',
              width: 64, height: 64, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', zIndex: 20
            }}>
              <Play size={32} color="white" fill="white" />
            </div>
          )}\n""")
        continue
    new_lines.append(line)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("Feito!")
