with open("src/App.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "Jornadas" in line or "journeys" in line.lower():
        print(repr(line.strip()[:100]))
        break
