with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "Testemunho" in line or "Vers" in line or "Reflex" in line:
        print(repr(line.strip()[:100]))
        break
