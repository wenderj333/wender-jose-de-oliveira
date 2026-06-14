import json, os
base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'
translations = {
    "pt": { "viewPost": "Ver Publicacao", "sharedVia": "Partilhado via Sigo com Fe" },
    "es": { "viewPost": "Ver Publicacion", "sharedVia": "Compartido via Sigo con Fe" },
    "en": { "viewPost": "View Post", "sharedVia": "Shared via Sigo com Fe" },
    "de": { "viewPost": "Beitrag ansehen", "sharedVia": "Geteilt uber Sigo com Fe" },
    "fr": { "viewPost": "Voir Publication", "sharedVia": "Partage via Sigo com Fe" },
    "ro": { "viewPost": "Vezi Postarea", "sharedVia": "Distribuit prin Sigo com Fe" },
    "ru": { "viewPost": "Посмотреть пост", "sharedVia": "Поделено через Sigo com Fe" }
}
for lang, keys in translations.items():
    path = os.path.join(base, lang + ".json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "mural" not in data:
            data["mural"] = {}
        for k, v in keys.items():
            data["mural"][k] = v
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"OK: {lang}")
    except Exception as e:
        print(f"ERRO {lang}: {e}")
