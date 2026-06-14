import json, os
base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'
translations = {
    "pt": { "playMusic": "Tocar Musica", "listenNow": "Ouvir agora", "closePlayer": "Fechar" },
    "es": { "playMusic": "Reproducir Musica", "listenNow": "Escuchar ahora", "closePlayer": "Cerrar" },
    "en": { "playMusic": "Play Music", "listenNow": "Listen now", "closePlayer": "Close" },
    "de": { "playMusic": "Musik abspielen", "listenNow": "Jetzt horen", "closePlayer": "Schliessen" },
    "fr": { "playMusic": "Jouer Musique", "listenNow": "Ecouter maintenant", "closePlayer": "Fermer" },
    "ro": { "playMusic": "Reda Muzica", "listenNow": "Asculta acum", "closePlayer": "Inchide" },
    "ru": { "playMusic": "Играть музыку", "listenNow": "Слушать сейчас", "closePlayer": "Закрыть" }
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
