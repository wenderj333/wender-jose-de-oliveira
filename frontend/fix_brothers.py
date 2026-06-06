import json
fixes = {
    "pt": {"following": "irmaos"},
    "en": {"following": "brothers"},
    "es": {"following": "hermanos"},
    "de": {"following": "Bruder"},
    "fr": {"following": "freres"},
    "ro": {"following": "frati"},
    "ru": {"following": "bratya"}
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
