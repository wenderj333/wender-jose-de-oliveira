with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = "    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>"
new = """    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      {!soundActivated && (
        <div onClick={activateSound} style={{ background: 'linear-gradient(135deg,#6C3FA0,#4A2270)', borderRadius: 12, padding: '12px 20px', marginBottom: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, color: 'white' }}>
          <span style={{ fontSize: 24 }}>🔊</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Ativar som dos videos</p>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Clica aqui para ativar o som automatico</p>
          </div>
        </div>
      )}"""

content = content.replace(old, new)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
