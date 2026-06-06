import json
with open("src/i18n/pt.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)
print(data.get("common", {}).get("comment", "NAO ENCONTRADO"))
