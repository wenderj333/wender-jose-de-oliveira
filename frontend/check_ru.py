with open("src/components/LanguageSwitcher.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "ru" in line.lower() and ("code" in line or "name" in line):
        print(repr(line.strip()[:100]))
