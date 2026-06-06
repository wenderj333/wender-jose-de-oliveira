with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_min = '["Evangelismo", "Louvor", "Intercess\u00e3o", "Ensino", "Miss\u00f5es", "Crian\u00e7as", "Jovens", "Casais", "A\u00e7\u00e3o Social", "Outro"]'
new_min = '[t("ministry.evangelism","Evangelismo"), t("ministry.worship","Louvor"), t("ministry.prayer","Intercessao"), t("ministry.teaching","Ensino"), t("ministry.missions","Missoes"), t("ministry.children","Criancas"), t("ministry.youth","Jovens"), t("ministry.couples","Casais"), t("ministry.social","Acao Social"), t("ministry.other","Outro")]'

if old_min in content:
    content = content.replace(old_min, new_min)
    print("Ministerios OK!")
else:
    for line in content.split("\n"):
        if "Evangelismo" in line and "Outro" in line and "map" in line:
            new_line = line.replace(line[line.find("["):line.rfind("]")+1], new_min)
            content = content.replace(line, new_line)
            print("Corrigido via linha!")
            break

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
