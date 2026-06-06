with open("src/App.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "position" in line and ("fixed" in line or "sticky" in line) and "left" in line:
        print(repr(line.strip()[:150]))
