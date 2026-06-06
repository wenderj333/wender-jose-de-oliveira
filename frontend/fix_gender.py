import json

fixes = {
    "pt": {"male": "Masculino", "female": "Feminino", "dating": "Namorando", "engaged": "Noivo(a)", "single": "Solteiro(a)", "married": "Casado(a)", "divorced": "Divorciado(a)", "widowed": "Viuvo(a)"},
    "en": {"male": "Male", "female": "Female", "dating": "Dating", "engaged": "Engaged", "single": "Single", "married": "Married", "divorced": "Divorced", "widowed": "Widowed"},
    "es": {"male": "Masculino", "female": "Femenino", "dating": "Noviando", "engaged": "Comprometido(a)", "single": "Soltero(a)", "married": "Casado(a)", "divorced": "Divorciado(a)", "widowed": "Viudo(a)"},
    "de": {"male": "Mannlich", "female": "Weiblich", "dating": "Beziehung", "engaged": "Verlobt", "single": "Ledig", "married": "Verheiratet", "divorced": "Geschieden", "widowed": "Verwitwet"},
    "fr": {"male": "Homme", "female": "Femme", "dating": "En couple", "engaged": "Fiance(e)", "single": "Celibataire", "married": "Marie(e)", "divorced": "Divorce(e)", "widowed": "Veuf(ve)"},
    "ro": {"male": "Masculin", "female": "Feminin", "dating": "In relatie", "engaged": "Logodit(a)", "single": "Necasatorit(a)", "married": "Casatorit(a)", "divorced": "Divortat(a)", "widowed": "Vaduv(a)"},
    "ru": {"male": "Muzhskoy", "female": "Zhenskiy", "dating": "Vstrechayu", "engaged": "Pomolvlen", "single": "Kholost", "married": "Zhenatyy", "divorced": "Razveden", "widowed": "Vdovets"}
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
