with open('src/pages/Settings.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('t("profile.fullName","Nome Completo")', 't("profile.full_name","Nome Completo")')
content = content.replace('t("profile.username","Nome de Usuário")', 't("register.username","Nome de Usuário")')
content = content.replace('t("profile.birthdate","Data de Nascimento")', 't("profile.birthdate","Data de Nascimento")')
content = content.replace('t("profile.gender","Sexo")', 't("profile.gender","Sexo")')
content = content.replace('t("profile.state","Estado")', 't("profile.state","Estado")')
content = content.replace('t("profile.favoriteVerse","Versículo Favorito")', 't("profile.favoriteVerse","Versículo Favorito")')
content = content.replace('t("profile.testimony","Testemunho")', 't("profile.testimony","Testemunho")')
content = content.replace('t("profile.aboutMe","Sobre Mim")', 't("profile.aboutMe","Sobre Mim")')

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
