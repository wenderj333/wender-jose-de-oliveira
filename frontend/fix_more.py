import json
fixes = {
    "pt": {"username": "Nome de Usuario", "city": "Cidade", "country": "Pais", "profession": "Profissao", "maritalStatus": "Estado Civil"},
    "en": {"username": "Username", "city": "City", "country": "Country", "profession": "Profession", "maritalStatus": "Marital Status"},
    "es": {"username": "Nombre de usuario", "city": "Ciudad", "country": "Pais", "profession": "Profesion", "maritalStatus": "Estado Civil"},
    "de": {"username": "Benutzername", "city": "Stadt", "country": "Land", "profession": "Beruf", "maritalStatus": "Familienstand"},
    "fr": {"username": "Nom utilisateur", "city": "Ville", "country": "Pays", "profession": "Profession", "maritalStatus": "Statut marital"},
    "ro": {"username": "Nume utilizator", "city": "Oras", "country": "Tara", "profession": "Profesie", "maritalStatus": "Stare civila"},
    "ru": {"username": "Polzovatel", "city": "Gorod", "country": "Strana", "profession": "Professiya", "maritalStatus": "Status"}
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
