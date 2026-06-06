with open("src/pages/Settings.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Funcoes da igreja
old_roles = '["Membro", "Novo Convertido", "Obreiro", "Di\u00c3\u00a1cono", "Presb\u00c3\u00adtero", "Evangelista", "Mission\u00c3\u00a1rio", "Pastor", "Bispo", "L\u00c3\u00adder de Jovens", "L\u00c3\u00adder de Louvor", "Professor da Escola B\u00c3\u00adblica", "Outro"]'
new_roles = '[t("role.member","Membro"), t("role.newConvert","Novo Convertido"), t("role.worker","Obreiro"), t("role.deacon","Diacono"), t("role.elder","Presbítero"), t("role.evangelist","Evangelista"), t("role.missionary","Missionario"), t("role.pastor","Pastor"), t("role.bishop","Bispo"), t("role.youthLeader","Lider de Jovens"), t("role.worshipLeader","Lider de Louvor"), t("role.teacher","Professor"), t("role.other","Outro")]'

if old_roles in content:
    content = content.replace(old_roles, new_roles)
    print("Roles corrigido!")
else:
    print("Roles NAO encontrado")

# Ministerios
old_min = '["Evangelismo", "Louvor", "Intercess\u00c3\u00a3o", "Ensino", "Miss\u00c3\u00b5es", "Crian\u00c3\u00a7as", "Jovens", "Casais", "A\u00c3\u00a7\u00c3\u00a3o Social", "Outro"]'
new_min = '[t("ministry.evangelism","Evangelismo"), t("ministry.worship","Louvor"), t("ministry.prayer","Intercessao"), t("ministry.teaching","Ensino"), t("ministry.missions","Missoes"), t("ministry.children","Criancas"), t("ministry.youth","Jovens"), t("ministry.couples","Casais"), t("ministry.social","Acao Social"), t("ministry.other","Outro")]'

if old_min in content:
    content = content.replace(old_min, new_min)
    print("Ministerios corrigido!")
else:
    print("Ministerios NAO encontrado")

with open("src/pages/Settings.jsx", "w", encoding="utf-8") as f:
    f.write(content)
