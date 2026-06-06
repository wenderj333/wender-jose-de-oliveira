import json
fixes = {
    "pt": {"followers": "segui um irmao", "following": "irmaos"},
    "en": {"followers": "follow a brother", "following": "brothers"},
    "es": {"followers": "seguir un hermano", "following": "hermanos"},
    "de": {"followers": "einem Bruder folgen", "following": "Bruder"},
    "fr": {"followers": "suivre un frere", "following": "freres"},
    "ro": {"followers": "urmareste un frate", "following": "frati"},
    "ru": {"followers": "sledovat bratu", "following": "bratya"}
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
