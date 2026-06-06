import json

fixes = {
    "pt": {"roleYears": "Anos nessa funcao", "ministry": "Participa de ministerio?", "favoriteVerse": "Versiculo Favorito"},
    "en": {"roleYears": "Years in this role", "ministry": "Ministry participation?", "favoriteVerse": "Favourite Verse"},
    "es": {"roleYears": "Anos en este rol", "ministry": "Participa en ministerio?", "favoriteVerse": "Versiculo Favorito"},
    "de": {"roleYears": "Jahre in dieser Rolle", "ministry": "Ministeriumsbeteiligung?", "favoriteVerse": "Lieblingsvers"},
    "fr": {"roleYears": "Annees dans ce role", "ministry": "Participation au ministere?", "favoriteVerse": "Verset Prefere"},
    "ro": {"roleYears": "Ani in acest rol", "ministry": "Participare minister?", "favoriteVerse": "Verset Favorit"},
    "ru": {"roleYears": "Let v etoy roli", "ministry": "Uchastiye v sluzhenii?", "favoriteVerse": "Lyubimyy Stikh"}
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
