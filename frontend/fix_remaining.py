with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    ">INFORMAÇÕES PESSOAIS<",
    ">{t('profile.sectionPersonal','INFORMACOES PESSOAIS')}<"
)
content = content.replace(
    ">FUNÇÃO NA IGREJA<",
    ">{t('profile.sectionRole','FUNCAO NA IGREJA')}<"
)

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
