with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for line in content.split("\n"):
    if "Fazer amizades" in line and "map" in line:
        new_line = line.replace(
            line[line.find("["):line.rfind("]")+1],
            '[t("interests.makeFriends","Fazer amizades cristas"), t("interests.shareWord","Compartilhar a Palavra"), t("interests.prayerGroup","Grupo de oracao"), t("interests.biblicalStudiesGoal","Estudos biblicos"), t("interests.meetBrothers","Conhecer irmaos em Cristo"), t("interests.christianNetworking","Networking cristao"), t("interests.seriousRelationship","Relacionamento serio"), t("interests.spiritualSupport","Apoio espiritual")]'
        )
        content = content.replace(line, new_line)
        print("Objetivos OK!")
        break

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
