import json
fixes = {
    "pt": {"posts": "publicacoes", "followers": "juntos na fe", "following": "sigo na fe"},
    "en": {"posts": "posts", "followers": "together in faith", "following": "following in faith"},
    "es": {"posts": "publicaciones", "followers": "juntos en la fe", "following": "sigo en la fe"},
    "de": {"posts": "Beitrage", "followers": "gemeinsam im Glauben", "following": "folge im Glauben"},
    "fr": {"posts": "publications", "followers": "ensemble dans la foi", "following": "suis dans la foi"},
    "ro": {"posts": "postari", "followers": "impreuna in credinta", "following": "urmaresc in credinta"},
    "ru": {"posts": "publikacii", "followers": "vmeste v vere", "following": "slezhу v vere"}
}
for lang, keys in fixes.items():
    fname = "src/i18n/" + lang + ".json"
    with open(fname, "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    if "profile" not in data or isinstance(data["profile"], str):
        data["profile"] = {}
    for k, v in keys.items():
        data["profile"][k] = v
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("OK: " + lang)
