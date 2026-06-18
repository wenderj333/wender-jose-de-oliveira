with open("src/App.jsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1. Adicionar import DueloBiblico
old1 = 'import DesafioBiblico from "./pages/DesafioBiblico";'
new1 = 'import DesafioBiblico from "./pages/DesafioBiblico";\nimport DueloBiblico from "./pages/DueloBiblico";'
if old1 in c:
    c = c.replace(old1, new1)
    print("OK: import adicionado")
else:
    print("ERRO: import nao encontrado")

# 2. Adicionar rota
old2 = '<Route path="/desafio-biblico" element={<DesafioBiblico />} /><Route path="/ajuda-uma-vida" element={<AjudaUmaVida />} />'
new2 = '<Route path="/desafio-biblico" element={<DesafioBiblico />} />\n            <Route path="/duelo-biblico" element={<DueloBiblico />} />\n            <Route path="/ajuda-uma-vida" element={<AjudaUmaVida />} />'
if old2 in c:
    c = c.replace(old2, new2)
    print("OK: rota adicionada")
else:
    print("ERRO: rota nao encontrada")

with open("src/App.jsx", "w", encoding="utf-8") as f:
    f.write(c)
print("Concluido!")