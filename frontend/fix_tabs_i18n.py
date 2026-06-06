import json
fixes = {
    "pt": {"photos": "Fotos", "videos": "Videos", "allPosts": "Todas"},
    "en": {"photos": "Photos", "videos": "Videos", "allPosts": "All"},
    "es": {"photos": "Fotos", "videos": "Videos", "allPosts": "Todas"},
    "de": {"photos": "Fotos", "videos": "Videos", "allPosts": "Alle"},
    "fr": {"photos": "Photos", "videos": "Videos", "allPosts": "Toutes"},
    "ro": {"photos": "Poze", "videos": "Videoclipuri", "allPosts": "Toate"},
    "ru": {"photos": "Foto", "videos": "Video", "allPosts": "Vse"}
}
for lang, keys in fixes.items():
    fname = "src/i18n/" + lang + ".json"
    with open(fname, "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    for k, v in keys.items():
        data["profile"][k] = v
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("OK: " + lang)
