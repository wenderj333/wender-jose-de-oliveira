with open("src/styles/ModernTheme.css", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    ".sidebar-left { padding-right: 10px; }",
    ".sidebar-left { padding-right: 10px; background: transparent; }"
)

with open("src/styles/ModernTheme.css", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
