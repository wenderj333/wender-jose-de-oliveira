import json, os
base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'
translations = {
    "pt": { "commentPhoto": "Comentar", "likePhoto": "Gostei", "viewPhoto": "Ver foto" },
    "es": { "commentPhoto": "Comentar", "likePhoto": "Me gusta", "viewPhoto": "Ver foto" },
    "en": { "commentPhoto": "Comment", "likePhoto": "Like", "viewPhoto": "View photo" },
    "de": { "commentPhoto": "Kommentieren", "likePhoto": "Gefallt mir", "viewPhoto": "Foto ansehen" },
    "fr": { "commentPhoto": "Commenter", "likePhoto": "Jaime", "viewPhoto": "Voir photo" },
    "ro": { "commentPhoto": "Comenteaza", "likePhoto": "Imi place", "viewPhoto": "Vezi poza" },
    "ru": { "commentPhoto": "Комментировать", "likePhoto": "Нравится", "viewPhoto": "Смотреть фото" }
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
