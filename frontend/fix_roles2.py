with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_roles = '["Membro", "Novo Convertido", "Obreiro", "Di\u00e1cono", "Presb\u00edtero", "Evangelista", "Mission\u00e1rio", "Pastor", "Bispo", "L\u00edder de Jovens", "L\u00edder de Louvor", "Professor da Escola B\u00edblica", "Outro"]'
new_roles = '[t("role.member","Membro"), t("role.newConvert","Novo Convertido"), t("role.worker","Obreiro"), t("role.deacon","Diacono"), t("role.elder","Presbitero"), t("role.evangelist","Evangelista"), t("role.missionary","Missionario"), t("role.pastor","Pastor"), t("role.bishop","Bispo"), t("role.youthLeader","Lider Jovens"), t("role.worshipLeader","Lider Louvor"), t("role.teacher","Professor"), t("role.other","Outro")]'

if old_roles in content:
    content = content.replace(old_roles, new_roles)
    print("Roles OK!")
else:
    print("NAO encontrado, tentando direto...")
    for line in content.split("\n"):
        if "Membro" in line and "Outro" in line and "map" in line:
            new_line = line.replace(line[line.find("["): line.rfind("]")+1], new_roles)
            content = content.replace(line, new_line)
            print("Corrigido via linha!")
            break

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
