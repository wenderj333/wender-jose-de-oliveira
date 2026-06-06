with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Adicionar estado de seguir
content = content.replace(
    "  const [showInfo, setShowInfo] = useState(false);",
    "  const [showInfo, setShowInfo] = useState(false);\n  const [following, setFollowing] = useState(false);\n  const [followCount, setFollowCount] = useState(0);"
)

# Adicionar botao seguir para outros perfis
content = content.replace(
    "{(!userId || userId === currentUser?.id) && (",
    "{userId && userId !== currentUser?.id && (\n              <button onClick={() => setFollowing(!following)} style={{ background: following ? \"#6C3FA0\" : \"transparent\", color: following ? \"white\" : \"#6C3FA0\", border: \"1px solid #6C3FA0\", borderRadius: \"4px\", padding: \"5px 16px\", fontWeight: \"600\", fontSize: \"14px\", cursor: \"pointer\" }}>{following ? t(\"profile.following\",\"irmaos\") : t(\"profile.followers\",\"segui um irmao\")}</button>\n            )}\n            {(!userId || userId === currentUser?.id) && ("
)

with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
