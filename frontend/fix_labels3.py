with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('>Você é cristão há quantos anos?<', '>{t("profile.faithYears","Anos de fe")}<')
content = content.replace('>Qual é sua função na igreja?<', '>{t("profile.churchRole","Funcao na igreja")}<')
content = content.replace('>Há quantos anos exerce essa função?<', '>{t("profile.roleYears","Anos nessa funcao")}<')
content = content.replace('>Você participa de algum ministério?<', '>{t("profile.ministry","Ministerio")}<')
content = content.replace('>Deseja compartilhar algum pedido de oração?<', '>{t("profile.prayerRequest","Pedido de oracao")}<')
content = content.replace('>Deixe uma mensagem para quem visitar seu perfil:<', '>{t("profile.finalMessage","Mensagem final")}<')

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
