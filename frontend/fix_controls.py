with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remover controls do video para esconder barra nativa
content = content.replace(
    "            controls\n            playsInline\n            muted={true}",
    "            playsInline\n            muted={true}"
)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
