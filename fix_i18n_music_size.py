import json, os
base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'
translations = {
    "pt": { "fileTooLarge": "Ficheiro demasiado grande", "maxSize": "Tamanho maximo" },
    "es": { "fileTooLarge": "Archivo demasiado grande", "maxSize": "Tamano maximo" },
    "en": { "fileTooLarge": "File too large", "maxSize": "Maximum size" },
    "de": { "fileTooLarge": "Datei zu gross", "maxSize": "Maximale Grosse" },
    "fr": { "fileTooLarge": "Fichier trop grand", "maxSize": "Taille maximale" },
    "ro": { "fileTooLarge": "Fisier prea mare", "maxSize": "Marime maxima" },
    "ru": { "fileTooLarge": "Файл slishkom bolshoy", "maxSize": "Maksimalnyy razmer" }
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
