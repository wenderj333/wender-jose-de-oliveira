with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remover duplicados
content = content.replace(
    "  const [soundActivated, setSoundActivated] = useState(false);\n  const [soundActivated, setSoundActivated] = useState(false);",
    "  const [soundActivated, setSoundActivated] = useState(false);"
)

# Remover funcao duplicada - encontrar segunda ocorrencia
idx1 = content.find("const activateSound = () => {")
idx2 = content.find("const activateSound = () => {", idx1 + 1)
if idx2 > -1:
    end = content.find("};", idx2) + 2
    content = content[:idx2] + content[end:]
    print("Duplicado removido!")

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
