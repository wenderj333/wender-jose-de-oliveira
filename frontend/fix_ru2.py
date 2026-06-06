with open("src/components/LanguageSwitcher.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "\u0420\u00f3\u00f1\u00f1\u00ea\u00e8\u00e9",
    "Русский"
)

for line in content.split("\n"):
    if "ru" in line.lower() and "code" in line:
        broken = line[line.find("name")+8:line.find("}")-2]
        content = content.replace(broken, "Русский")
        break

with open("src/components/LanguageSwitcher.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
