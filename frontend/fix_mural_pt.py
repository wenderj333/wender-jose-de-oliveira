import json

with open("src/i18n/pt.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)

data["mural"]["subtitle"] = "Compartilhe sua fe, testemunhos e louvores"
data["mural"]["newPost"] = "+ Nova Publicacao"
data["mural"]["amen"] = "Amem"
data["mural"]["noPostsFound"] = "Nenhuma publicacao encontrada."
data["mural"]["loginRequired"] = "Faca login para ver e publicar."
data["mural"]["uploadError"] = "Erro ao fazer upload."
data["mural"]["uploadConnectionError"] = "Erro de conexao ao fazer upload."
data["mural"]["musicLabel"] = "Musica"
data["mural"]["filters"]["verses"] = "Versiculos"
data["mural"]["filters"]["reflections"] = "Reflexoes"

with open("src/i18n/pt.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Feito!")
