with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "            muted={isMuted}\n            autoPlay={false}",
    "            muted={true}\n            autoPlay={false}"
)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
