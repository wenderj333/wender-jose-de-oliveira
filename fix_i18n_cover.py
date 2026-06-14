import json, os
base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'
translations = {
    "pt": { "adjustPhoto": "Ajustar foto", "centerTop": "Topo", "centerMiddle": "Centro", "centerBottom": "Base" },
    "es": { "adjustPhoto": "Ajustar foto", "centerTop": "Arriba", "centerMiddle": "Centro", "centerBottom": "Abajo" },
    "en": { "adjustPhoto": "Adjust photo", "centerTop": "Top", "centerMiddle": "Center", "centerBottom": "Bottom" },
    "de": { "adjustPhoto": "Foto anpassen", "centerTop": "Oben", "centerMiddle": "Mitte", "centerBottom": "Unten" },
    "fr": { "adjustPhoto": "Ajuster photo", "centerTop": "Haut", "centerMiddle": "Centre", "centerBottom": "Bas" },
    "ro": { "adjustPhoto": "Ajustare poza", "centerTop": "Sus", "centerMiddle": "Centru", "centerBottom": "Jos" },
    "ru": { "adjustPhoto": "Настроить фото", "centerTop": "Верх", "centerMiddle": "Центр", "centerBottom": "Низ" }
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
