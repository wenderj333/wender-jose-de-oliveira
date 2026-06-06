with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "Coment" in line and ("Ã" in line or "\u00c3" in line):
        print(repr(line.strip()[:150]))
        break
