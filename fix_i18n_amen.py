import json, os
base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'
translations = {
    "pt": { "amen": "Amen", "amenGiven": "Amem dado" },
    "es": { "amen": "Amen", "amenGiven": "Amen dado" },
    "en": { "amen": "Amen", "amenGiven": "Amen given" },
    "de": { "amen": "Amen", "amenGiven": "Amen gegeben" },
    "fr": { "amen": "Amen", "amenGiven": "Amen donne" },
    "ro": { "amen": "Amin", "amenGiven": "Amin dat" },
    "ru": { "amen": "Аминь", "amenGiven": "Аминь дан" }
}
for lang, keys in translations.items():
    path = os.path.join(base, lang + ".json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "profile" not in data:
            data["profile"] = {}
        for k, v in keys.items():
            data["profile"][k] = v
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"OK: {lang}")
    except Exception as e:
        print(f"ERRO {lang}: {e}")
