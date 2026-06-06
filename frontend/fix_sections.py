import json
fixes = {
    "pt": {"sectionPersonal": "INFORMACOES PESSOAIS", "sectionChurch": "VIDA CRISTA", "sectionRole": "FUNCAO NA IGREJA", "sectionMinistry": "MINISTERIO", "sectionPrefs": "PREFERENCIAS E TESTEMUNHO", "sectionFinish": "FINALIZANDO PERFIL", "username": "Nome de Usuario", "faithYears": "Ha quantos anos e cristao?", "testimony": "Testemunho", "aboutMe": "Sobre Mim", "saveProfile": "SALVAR PERFIL"},
    "en": {"sectionPersonal": "PERSONAL INFORMATION", "sectionChurch": "CHRISTIAN LIFE", "sectionRole": "CHURCH ROLE", "sectionMinistry": "MINISTRY", "sectionPrefs": "PREFERENCES AND TESTIMONY", "sectionFinish": "FINISHING PROFILE", "username": "Username", "faithYears": "How many years a Christian?", "testimony": "Testimony", "aboutMe": "About Me", "saveProfile": "SAVE PROFILE"},
    "es": {"sectionPersonal": "INFORMACION PERSONAL", "sectionChurch": "VIDA CRISTIANA", "sectionRole": "FUNCION EN LA IGLESIA", "sectionMinistry": "MINISTERIO", "sectionPrefs": "PREFERENCIAS Y TESTIMONIO", "sectionFinish": "FINALIZANDO PERFIL", "username": "Nombre de usuario", "faithYears": "Cuantos anos cristiano?", "testimony": "Testimonio", "aboutMe": "Sobre Mi", "saveProfile": "GUARDAR PERFIL"},
    "de": {"sectionPersonal": "PERSONLICHE INFORMATIONEN", "sectionChurch": "CHRISTLICHES LEBEN", "sectionRole": "KIRCHENROLLE", "sectionMinistry": "MINISTERIUM", "sectionPrefs": "PRAFERENZEN UND ZEUGNIS", "sectionFinish": "PROFIL FERTIGSTELLEN", "username": "Benutzername", "faithYears": "Wie viele Jahre Christ?", "testimony": "Zeugnis", "aboutMe": "Uber Mich", "saveProfile": "PROFIL SPEICHERN"},
    "fr": {"sectionPersonal": "INFORMATIONS PERSONNELLES", "sectionChurch": "VIE CHRETIENNE", "sectionRole": "ROLE A L EGLISE", "sectionMinistry": "MINISTERE", "sectionPrefs": "PREFERENCES ET TEMOIGNAGE", "sectionFinish": "FINALISER PROFIL", "username": "Nom utilisateur", "faithYears": "Depuis combien d annees chretien?", "testimony": "Temoignage", "aboutMe": "A Propos", "saveProfile": "SAUVEGARDER PROFIL"},
    "ro": {"sectionPersonal": "INFORMATII PERSONALE", "sectionChurch": "VIATA CRESTINA", "sectionRole": "ROL IN BISERICA", "sectionMinistry": "MINISTER", "sectionPrefs": "PREFERINTE SI MARTURIE", "sectionFinish": "FINALIZARE PROFIL", "username": "Nume utilizator", "faithYears": "Cati ani crestin?", "testimony": "Marturie", "aboutMe": "Despre Mine", "saveProfile": "SALVARE PROFIL"},
    "ru": {"sectionPersonal": "LICHNAYA INFORMACIYA", "sectionChurch": "HRISTIANSKAYA ZHIZN", "sectionRole": "ROL V CERKVI", "sectionMinistry": "SLUZHENIE", "sectionPrefs": "PREDPOCHTENIYA I SVIDETELSTVO", "sectionFinish": "ZAVERSHENIE PROFILYA", "username": "Imya polzovatelya", "faithYears": "Skolko let hristianin?", "testimony": "Svidetelstvo", "aboutMe": "Obo Mne", "saveProfile": "SOHRANIT PROFIL"}
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
