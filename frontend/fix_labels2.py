with open('src/pages/Settings.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    ('>Nome Completo:<', '>{t("profile.fullName","Nome Completo")}:<'),
    ('>Nome de Usuário:<', '>{t("profile.username","Nome de Usuário")}:<'),
    ('>Data de Nascimento:<', '>{t("profile.birthdate","Data de Nascimento")}:<'),
    ('>Sexo:<', '>{t("profile.gender","Sexo")}:<'),
    ('>Cidade:<', '>{t("profile.city","Cidade")}:<'),
    ('>Estado:<', '>{t("profile.state","Estado")}:<'),
    ('>País:<', '>{t("profile.country","País")}:<'),
    ('>Profissão:<', '>{t("profile.profession","Profissão")}:<'),
    ('>Estado Civil:<', '>{t("profile.maritalStatus","Estado Civil")}:<'),
    ('>Nome da Igreja:<', '>{t("profile.church","Igreja")}:<'),
    ('>Denominação:<', '>{t("profile.denomination","Denominação")}:<'),
    ('>Pastor da Igreja:<', '>{t("profile.pastor","Pastor")}:<'),
    ('>Versículo Favorito:<', '>{t("profile.favoriteVerse","Versículo Favorito")}:<'),
    ('>Louvor Favorito:<', '>{t("profile.favoriteWorship","Louvor Favorito")}:<'),
    ('>Livro Cristão Favorito:<', '>{t("profile.favoriteBook","Livro Favorito")}:<'),
    ('>Conte um pouco do seu testemunho:<', '>{t("profile.testimony","Testemunho")}:<'),
    ('>Fale um pouco sobre você (Sobre Mim):<', '>{t("profile.aboutMe","Sobre Mim")}:<'),
]

for old, new in replacements:
    if old in content:
        print(f"Corrigido: {old[:30]}")
        content = content.replace(old, new)
    else:
        print(f"NAO encontrado: {old[:30]}")

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
