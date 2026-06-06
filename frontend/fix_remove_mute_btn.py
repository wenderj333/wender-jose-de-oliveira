with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remover botao de mute do canto superior direito
old = """          <button onClick={toggleMute} style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', cursor: 'pointer', zIndex: 10,
          }}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>"""

new = ""

content = content.replace(old, new)
with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
