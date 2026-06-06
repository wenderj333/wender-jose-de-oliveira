import json

langs = {
    "pt": {"reflexao": "Reflexao", "versiculo": "Versiculo"},
    "en": {"reflexao": "Reflection", "versiculo": "Verse"},
    "es": {"reflexao": "Reflexion", "versiculo": "Versiculo"},
    "de": {"reflexao": "Reflexion", "versiculo": "Bibelvers"},
    "fr": {"reflexao": "Reflexion", "versiculo": "Verset"},
    "ro": {"reflexao": "Reflectie", "versiculo": "Verset"},
    "ru": {"reflexao": "Razmyshleniye", "versiculo": "Stikh"}
}

for lang, fixes in langs.items():
    fname = "src/i18n/" + lang + ".json"
    with open(fname, "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    if "mural" in data and "categories" in data["mural"]:
        for k, v in fixes.items():
            data["mural"]["categories"][k] = v
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("OK: " + lang)
