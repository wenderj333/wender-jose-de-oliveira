with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '<button onClick={() => navigate("/settings")} style={{ background: "transparent", border: "1px solid #dbdbdb", borderRadius: "4px", padding: "5px 9px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Editar perfil</button>',
    '<button onClick={() => navigate("/settings")} style={{ background: "transparent", border: "1px solid #dbdbdb", borderRadius: "4px", padding: "5px 9px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Editar perfil</button>\n                <button onClick={() => navigate("/ver-perfil/" + user.id)} style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: "4px", padding: "5px 9px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Ver Perfil</button>'
)

with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
