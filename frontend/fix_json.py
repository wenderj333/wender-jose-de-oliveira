import json

translations = {
    "pt": {"full_name": "Nome Completo", "gender": "Sexo", "state": "Estado", "church": "Igreja", "denomination": "Denominacao", "pastor": "Pastor", "favoriteWorship": "Louvor Favorito", "favoriteBook": "Livro Favorito"},
    "en": {"full_name": "Full Name", "gender": "Gender", "state": "State", "church": "Church", "denomination": "Denomination", "pastor": "Pastor", "favoriteWorship": "Favourite Worship", "favoriteBook": "Favourite Book"},
    "es": {"full_name": "Nombre Completo", "gender": "Sexo", "state": "Estado", "church": "Iglesia", "denomination": "Denominacion", "pastor": "Pastor", "favoriteWorship": "Alabanza Favorita", "favoriteBook": "Libro Favorito"},
    "de": {"full_name": "Vollstandiger Name", "gender": "Geschlecht", "state": "Bundesland", "church": "Kirche", "denomination": "Konfession", "pastor": "Pastor", "favoriteWorship": "Lieblingslied", "favoriteBook": "Lieblingsbuch"},
    "fr": {"full_name": "Nom Complet", "gender": "Sexe", "state": "Region", "church": "Eglise", "denomination": "Denomination", "pastor": "Pasteur", "favoriteWorship": "Louange Favorite", "favoriteBook": "Livre Favori"},
    "ro": {"full_name": "Nume Complet", "gender": "Sex", "state": "Judet", "church": "Biserica", "denomination": "Denominatie", "pastor": "Pastor", "favoriteWorship": "Cantare Favorita", "favoriteBook": "Carte Favorita"},
    "ru": {"full_name": "Polnoe imya", "gender": "Pol", "state": "Region", "church": "Cerkov", "denomination": "Denominaciya", "pastor": "Pastor", "favoriteWorship": "Lyubimoe penie", "favoriteBook": "Lyubimaya kniga"}
}

for lang, keys in translations.items():
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
