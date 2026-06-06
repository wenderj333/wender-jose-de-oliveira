with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "comment_count" in line or ("Coment" in line and "button" in line.lower()):
        print(repr(line.strip()[:150]))
