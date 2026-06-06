with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_interests = '["Estudos B\u00edblicos", "Ora\u00e7\u00e3o", "Evangelismo", "Miss\u00f5es", "M\u00fasica Gospel", "Leitura", "Fam\u00edlia", "Amizades Crist\u00e3s", "Eventos Crist\u00e3os", "Outro"]'
new_interests = '[t("interests.biblicalStudies","Estudos Biblicos"), t("interests.prayer","Oracao"), t("interests.evangelism","Evangelismo"), t("interests.missions","Missoes"), t("interests.gospelMusic","Musica Gospel"), t("interests.reading","Leitura"), t("interests.family","Familia"), t("interests.christianFriends","Amizades Cristas"), t("interests.christianEvents","Eventos Cristaos"), t("interests.other","Outro")]'

count = content.count('["Estudos B')
print(f"Encontrado {count} vezes")

for line in content.split("\n"):
    if "Estudos" in line and "Outro" in line and "map" in line:
        new_line = line.replace(line[line.find("["):line.rfind("]")+1], new_interests)
        content = content.replace(line, new_line, 1)
        print("Interesses OK!")
        break

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
