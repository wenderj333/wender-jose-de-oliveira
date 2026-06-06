with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("SOBRE MIM / MEU PERFIL", "{t('profile.title','SOBRE MIM / MEU PERFIL')}")
content = content.replace("INFORMAÃ‡Ã•ES PESSOAIS", "{t('profile.sectionPersonal','INFORMACOES PESSOAIS')}")
content = content.replace("VIDA CRISTÃ", "{t('profile.sectionChurch','VIDA CRISTA')}")
content = content.replace("FUNÃ‡ÃƒO NA IGREJA", "{t('profile.sectionRole','FUNCAO NA IGREJA')}")
content = content.replace("MINISTÉRIO", "{t('profile.sectionMinistry','MINISTERIO')}")
content = content.replace("PREFERÊNCIAS E TESTEMUNHO", "{t('profile.sectionPrefs','PREFERENCIAS E TESTEMUNHO')}")
content = content.replace("FINALIZANDO PERFIL", "{t('profile.sectionFinish','FINALIZANDO PERFIL')}")
content = content.replace("SALVAR PERFIL", "{t('profile.saveProfile','SALVAR PERFIL')}")

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
