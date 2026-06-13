import json, os

base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'

translations = {
    "pt": {
        "shareWhatsApp": "Partilhar WhatsApp",
        "shareSocial": "Partilhar",
        "changeCover": "Mudar Capa",
        "playMusic": "Tocar"
    },
    "es": {
        "shareWhatsApp": "Compartir WhatsApp",
        "shareSocial": "Compartir",
        "changeCover": "Cambiar Portada",
        "playMusic": "Reproducir"
    },
    "en": {
        "shareWhatsApp": "Share WhatsApp",
        "shareSocial": "Share",
        "changeCover": "Change Cover",
        "playMusic": "Play"
    },
    "de": {
        "shareWhatsApp": "WhatsApp teilen",
        "shareSocial": "Teilen",
        "changeCover": "Cover ändern",
        "playMusic": "Abspielen"
    },
    "fr": {
        "shareWhatsApp": "Partager WhatsApp",
        "shareSocial": "Partager",
        "changeCover": "Changer Couverture",
        "playMusic": "Jouer"
    },
    "ro": {
        "shareWhatsApp": "Distribuie WhatsApp",
        "shareSocial": "Distribuie",
        "changeCover": "Schimba Coperta",
        "playMusic": "Reda"
    },
    "ru": {
        "shareWhatsApp": "Поделиться WhatsApp",
        "shareSocial": "Поделиться",
        "changeCover": "Изменить обложку",
        "playMusic": "Играть"
    }
}

for lang, keys in translations.items():
    path = os.path.join(base, lang + ".json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "music" not in data:
            data["music"] = {}
        for k, v in keys.items():
            data["music"][k] = v
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"OK: {lang}")
    except Exception as e:
        print(f"ERRO {lang}: {e}")
