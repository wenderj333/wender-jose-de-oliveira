import json, os
base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'
translations = {
    "pt": { "likePhoto": "Gostei", "unlikePhoto": "Ja gostei" },
    "es": { "likePhoto": "Me gusta", "unlikePhoto": "Ya me gusta" },
    "en": { "likePhoto": "Like", "unlikePhoto": "Liked" },
    "de": { "likePhoto": "Gefallt mir", "unlikePhoto": "Gefallt mir schon" },
    "fr": { "likePhoto": "Jaime", "unlikePhoto": "Deja aime" },
    "ro": { "likePhoto": "Imi place", "unlikePhoto": "Deja imi place" },
    "ru": { "likePhoto": "Нравится", "unlikePhoto": "Уже нравится" }
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
