with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '{loading ? "Salvando Alteracoes..." : {t("profile.saveProfile","SALVAR PERFIL")}}',
    '{loading ? "Salvando..." : t("profile.saveProfile","SALVAR PERFIL")}'
)
content = content.replace(
    ': {t("profile.saveProfile","SALVAR PERFIL")}',
    ': t("profile.saveProfile","SALVAR PERFIL")'
)

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
