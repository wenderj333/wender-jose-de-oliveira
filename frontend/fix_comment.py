import json

with open("src/i18n/pt.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)

# Corrigir mural
data["mural"]["commentPlaceholder"] = "Escreva um comentario..."
data["mural"]["loginToComment"] = "Faca login para comentar!"
data["mural"]["comment"] = "Comentario"

with open("src/i18n/pt.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Feito!")
