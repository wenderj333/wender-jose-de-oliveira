with open('src/pages/Settings.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar useTranslation
content = content.replace(
    'import { useNavigate } from "react-router-dom";',
    'import { useNavigate } from "react-router-dom";\nimport { useTranslation } from "react-i18next";'
)

# Adicionar const { t } = useTranslation();
content = content.replace(
    'const { setUser } = useAuth();',
    'const { setUser } = useAuth();\n  const { t } = useTranslation();'
)

# Traduzir labels
replacements = [
    ('"Nome completo"', '{t("profile.full_name","Nome completo")}'),
    ('"Bio"', '{t("profile.bio","Bio")}'),
    ('"Cidade"', '{t("profile.city","Cidade")}'),
    ('"Pais"', '{t("profile.country","Pais")}'),
    ('"Profissao"', '{t("profile.profession","Profissao")}'),
    ('"Estado civil"', '{t("profile.maritalStatus","Estado civil")}'),
    ('"Igreja"', '{t("profile.church","Igreja")}'),
    ('"Denominacao"', '{t("profile.denomination","Denominacao")}'),
    ('"Anos de fe"', '{t("profile.faithYears","Anos de fe")}'),
    ('"Versiculo favorito"', '{t("profile.favoriteVerse","Versiculo favorito")}'),
    ('"Testemunho"', '{t("profile.testimony","Testemunho")}'),
    ('"Estado espiritual"', '{t("profile.spiritualState","Estado espiritual")}'),
    ('"Editar Perfil"', '{t("profile.editProfile","Editar Perfil")}'),
    ('"Guardar"', '{t("profile.save","Guardar")}'),
    ('"A guardar..."', '{t("profile.saving","A guardar...")}'),
    ('"Mudar foto"', '{t("profile.changeAvatar","Mudar foto")}'),
    ('"Sobre mim"', '{t("profile.aboutMe","Sobre mim")}'),
    ('"Solteiro"', '{t("profile.single","Solteiro")}'),
    ('"Casado"', '{t("profile.married","Casado")}'),
    ('"Divorciado"', '{t("profile.divorced","Divorciado")}'),
    ('"Viuvo"', '{t("profile.widowed","Viuvo")}'),
]

for old, new in replacements:
    content = content.replace(old, new)

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
