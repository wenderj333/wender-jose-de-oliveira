with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '<span><strong>0</strong> publicacoes</span>',
    '<span><strong>0</strong> {t("profile.posts","publicacoes")}</span>'
)
content = content.replace(
    '<span><strong>0</strong> seguidores</span>',
    '<span><strong>0</strong> {t("profile.followers","juntos na fe")}</span>'
)
content = content.replace(
    '<span><strong>0</strong> seguindo</span>',
    '<span><strong>0</strong> {t("profile.following","sigo na fe")}</span>'
)

with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
