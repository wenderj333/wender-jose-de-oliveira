with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Mudar threshold para 0.3 para funcionar melhor no mobile
content = content.replace(
    "{ threshold: 0.6 }",
    "{ threshold: 0.3 }"
)

# Adicionar play() com user gesture
content = content.replace(
    "if (entry.isIntersecting) {\n                    e.target.play().catch(() => {});",
    "if (entry.isIntersecting) {\n                    e.target.play().catch(() => { e.target.muted = true; e.target.play().catch(() => {}); });"
)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
