import json

covers = {
    "pt": {"changeCover": "Trocar capa", "clickToPlay": "Clica para tocar"},
    "en": {"changeCover": "Change cover", "clickToPlay": "Click to play"},
    "es": {"changeCover": "Cambiar portada", "clickToPlay": "Toca para reproducir"},
    "de": {"changeCover": "Cover ändern", "clickToPlay": "Zum Abspielen klicken"},
    "fr": {"changeCover": "Changer la pochette", "clickToPlay": "Cliquer pour jouer"},
    "ro": {"changeCover": "Schimba coperta", "clickToPlay": "Apasa pentru a reda"},
    "ru": {"changeCover": "Сменить обложку", "clickToPlay": "Нажмите для воспроизведения"},
}

for lang, vals in covers.items():
    fname = f"frontend/src/i18n/{lang}.json"
    try:
        with open(fname, "rb") as f:
            data = json.loads(f.read().decode("utf-8"))
        if "music" not in data:
            data["music"] = {}
        for k, v in vals.items():
            data["music"][k] = v
        with open(fname, "wb") as f:
            f.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))
        print(f"{lang} - OK")
    except Exception as e:
        print(f"{lang} - ERRO: {e}")
