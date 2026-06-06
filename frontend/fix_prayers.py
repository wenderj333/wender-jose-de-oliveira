import json

with open("src/i18n/pt.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)

data["nav"]["prayers"] = "Pedidos de Oracao"
data["nav"]["mural"] = "Mural"
data["nav"]["members"] = "Membros"

with open("src/i18n/pt.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Feito!")
