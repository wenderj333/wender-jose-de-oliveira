with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remover botao da posicao atual (acima do nome)
content = content.replace(
    "{userId && userId !== currentUser?.id && (\n              <button onClick={() => setFollowing(!following)} style={{ background: following ? \"#6C3FA0\" : \"transparent\", color: following ? \"white\" : \"#6C3FA0\", border: \"1px solid #6C3FA0\", borderRadius: \"4px\", padding: \"5px 16px\", fontWeight: \"600\", fontSize: \"14px\", cursor: \"pointer\" }}>{following ? t(\"profile.following\",\"irmaos\") : t(\"profile.followers\",\"segui um irmao\")}</button>\n            )}\n            {(!userId || userId === currentUser?.id) && (",
    "{(!userId || userId === currentUser?.id) && ("
)

# Adicionar botao junto aos contadores
content = content.replace(
    '<span><strong>0</strong> {t("profile.following","sigo na fe")}</span>',
    '<span><strong>0</strong> {t("profile.following","sigo na fe")}</span>\n            {userId && userId !== currentUser?.id && (\n              <button onClick={() => setFollowing(!following)} style={{ background: following ? "#6C3FA0" : "transparent", color: following ? "white" : "#6C3FA0", border: "1px solid #6C3FA0", borderRadius: "20px", padding: "4px 14px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>{following ? "✓ irmaos" : t("profile.followers","segui um irmao")}</button>\n            )}'
)

with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
