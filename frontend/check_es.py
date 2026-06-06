import json
with open("src/i18n/es.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)
print(data.get("profile", {}).get("addPhoto", "NAO ENCONTRADO"))
print(data.get("profile", {}).get("gallery", "NAO ENCONTRADO"))
print(data.get("profile", {}).get("photos", "NAO ENCONTRADO"))
