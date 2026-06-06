import json

with open("src/i18n/pt.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)

data["mural"]["comment"] = "Comentario"
data["mural"]["comments"] = "Comentarios"

with open("src/i18n/pt.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Feito!")
