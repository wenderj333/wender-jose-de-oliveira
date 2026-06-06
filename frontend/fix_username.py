with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    't("register.username","Nome de Usuário")',
    't("profile.username","Nome de Usuario")'
)

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
