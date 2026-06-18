with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    c = f.read()

old = 'window.open("https://duelo-biblico.vercel.app","_blank")'
new = 'window.location.href="/duelo-biblico"'

if old in c:
    c = c.replace(old, new)
    print("OK: botao corrigido")
else:
    print("ERRO: texto nao encontrado")

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(c)