with open("src/App.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "width" in line and ("64" in line or "60" in line) and "background" in line:
        print(repr(line.strip()[:150]))
