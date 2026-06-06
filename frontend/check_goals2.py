with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "amizades" in line.lower() and "map" in line:
        print(repr(line.strip()[:250]))
        break
