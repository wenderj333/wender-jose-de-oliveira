import json, os
base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'
translations = {
    "pt": { "bible_study": "Biblia" },
    "es": { "bible_study": "Biblia" },
    "en": { "bible_study": "Bible" },
    "de": { "bible_study": "Bibel KI" },
    "fr": { "bible_study": "Bible" },
    "ro": { "bible_study": "Biblie" },
    "ru": { "bible_study": "Библия" }
}
for lang, keys in translations.items():
    path = os.path.join(base, lang + ".json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "nav" not in data:
            data["nav"] = {}
        for k, v in keys.items():
            data["nav"][k] = v
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"OK: {lang}")
    except Exception as e:
        print(f"ERRO {lang}: {e}")
