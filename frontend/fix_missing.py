import json

missing = {
    "pt": {"username": "Nome de Usuario", "birthdate": "Data de Nascimento", "gender": "Sexo", "state": "Estado"},
    "en": {"username": "Username", "birthdate": "Date of Birth", "gender": "Gender", "state": "State"},
    "es": {"username": "Nombre de usuario", "birthdate": "Fecha de nacimiento", "gender": "Sexo", "state": "Estado"},
    "de": {"username": "Benutzername", "birthdate": "Geburtsdatum", "gender": "Geschlecht", "state": "Bundesland"},
    "fr": {"username": "Nom d'utilisateur", "birthdate": "Date de naissance", "gender": "Sexe", "state": "Region"},
    "ro": {"username": "Nume utilizator", "birthdate": "Data nasterii", "gender": "Sex", "state": "Judet"},
    "ru": {"username": "Imya polzovatelya", "birthdate": "Data rozhdeniya", "gender": "Pol", "state": "Region"}
}

for lang, keys in missing.items():
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
