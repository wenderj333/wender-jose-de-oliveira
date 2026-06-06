with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "Mural" in line and ("Comunidade" in line or "fÃ" in line):
        print(repr(line.strip()[:150]))
        break
