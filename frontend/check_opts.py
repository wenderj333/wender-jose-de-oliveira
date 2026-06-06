with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "Masculino" in line or "Solteiro" in line:
        print(repr(line.strip()[:120]))
