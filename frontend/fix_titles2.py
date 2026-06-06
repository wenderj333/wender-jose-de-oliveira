with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(">SOBRE MIM / MEU PERFIL<", ">{t('profile.title','SOBRE MIM / MEU PERFIL')}<")
content = content.replace(">INFORMAÃ‡Ã•ES PESSOAIS<", ">{t('profile.sectionPersonal','INFORMACOES PESSOAIS')}<")
content = content.replace(">FUNCAO NA IGREJA<", ">{t('profile.sectionRole','FUNCAO NA IGREJA')}<")
content = content.replace(">INTERESSES (Gosto de)<", ">{t('profile.sectionInterests','INTERESSES')}<")
content = content.replace(">OBJETIVOS NA PLATAFORMA<", ">{t('profile.sectionObjectives','OBJETIVOS')}<")
content = content.replace(">FINALIZANDO PERFIL<", ">{t('profile.sectionFinish','FINALIZANDO PERFIL')}<")

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
