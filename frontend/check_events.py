import json

with open("src/i18n/pt.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)

if "events" in data:
    print(data["events"])
else:
    print("events nao encontrado")
