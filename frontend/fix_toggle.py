with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Adicionar estado para mostrar/esconder info
content = content.replace(
    "  const [amenDado, setAmenDado] = useState(false);",
    "  const [amenDado, setAmenDado] = useState(false);\n  const [showInfo, setShowInfo] = useState(false);"
)

# Mudar botao Ver Perfil para toggle
content = content.replace(
    'navigate("/ver-perfil/" + user.id)',
    'setShowInfo(!showInfo)'
)

# Mostrar info so quando showInfo=true
content = content.replace(
    '      {(user.city || user.country || user.church_name || user.testimony || user.favorite_verse) && (',
    '      {showInfo && (user.city || user.country || user.church_name || user.testimony || user.favorite_verse) && ('
)

with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
