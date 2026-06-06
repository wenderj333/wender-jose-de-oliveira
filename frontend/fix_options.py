with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '["Masculino", "Feminino"]',
    '[t("profile.male","Masculino"), t("profile.female","Feminino")]'
)
content = content.replace(
    '["Solteiro(a)", "Namorando", "Noivo(a)", "Casado(a)", "Divorciado(a)", "Vi\u00faво(a)"]',
    '[t("profile.single","Solteiro(a)"), t("profile.dating","Namorando"), t("profile.engaged","Noivo(a)"), t("profile.married","Casado(a)"), t("profile.divorced","Divorciado(a)"), t("profile.widowed","Viuvo(a)")]'
)

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
