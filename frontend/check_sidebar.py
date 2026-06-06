with open("src/components/RightSidebar.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "Ora" in line and ("nav.prayers" in line or "Petici" in line):
        print(repr(line.strip()[:150]))
        break
