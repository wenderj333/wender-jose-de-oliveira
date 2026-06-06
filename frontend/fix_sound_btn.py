with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Adicionar estado de som ativado
content = content.replace(
    "  const [posts, setPosts] = useState([]);",
    "  const [posts, setPosts] = useState([]);\n  const [soundActivated, setSoundActivated] = useState(false);"
)

# Adicionar botao de ativar som no topo
content = content.replace(
    "  return (\n    <div style={{",
    """  const activateSound = () => {
    setSoundActivated(true);
    document.querySelectorAll("video").forEach(v => { v.muted = false; v.play().catch(() => {}); });
  };

  return (
    <div style={{"""
)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
