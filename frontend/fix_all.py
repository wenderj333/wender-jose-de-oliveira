import json
fixes = {
    "pt": {"title": "SOBRE MIM / MEU PERFIL", "sectionPersonal": "INFORMACOES PESSOAIS", "sectionRole": "FUNCAO NA IGREJA", "sectionInterests": "INTERESSES", "sectionObjectives": "OBJETIVOS NA PLATAFORMA", "faithYears": "Ha quantos anos e cristao?", "churchRole": "Funcao na igreja?", "prayerRequest": "Pedido de oracao", "finalMessage": "Mensagem final"},
    "en": {"title": "ABOUT ME / MY PROFILE", "sectionPersonal": "PERSONAL INFORMATION", "sectionRole": "CHURCH ROLE", "sectionInterests": "INTERESTS", "sectionObjectives": "PLATFORM GOALS", "faithYears": "How many years Christian?", "churchRole": "Church role?", "prayerRequest": "Prayer request", "finalMessage": "Final message"},
    "es": {"title": "SOBRE MI / MI PERFIL", "sectionPersonal": "INFORMACION PERSONAL", "sectionRole": "FUNCION EN LA IGLESIA", "sectionInterests": "INTERESES", "sectionObjectives": "OBJETIVOS", "faithYears": "Cuantos anos cristiano?", "churchRole": "Funcion en la iglesia?", "prayerRequest": "Peticion de oracion", "finalMessage": "Mensaje final"},
    "de": {"title": "UBER MICH / MEIN PROFIL", "sectionPersonal": "PERSONLICHE INFOS", "sectionRole": "KIRCHENROLLE", "sectionInterests": "INTERESSEN", "sectionObjectives": "PLATTFORMZIELE", "faithYears": "Wie viele Jahre Christ?", "churchRole": "Kirchenrolle?", "prayerRequest": "Gebetsanliegen", "finalMessage": "Abschlussnachricht"},
    "fr": {"title": "A PROPOS / MON PROFIL", "sectionPersonal": "INFORMATIONS PERSONNELLES", "sectionRole": "ROLE EGLISE", "sectionInterests": "INTERETS", "sectionObjectives": "OBJECTIFS", "faithYears": "Combien d annees?", "churchRole": "Role a l eglise?", "prayerRequest": "Demande de priere", "finalMessage": "Message final"},
    "ro": {"title": "DESPRE MINE / PROFILUL MEU", "sectionPersonal": "INFORMATII PERSONALE", "sectionRole": "ROL IN BISERICA", "sectionInterests": "INTERESE", "sectionObjectives": "OBIECTIVE", "faithYears": "Cati ani crestin?", "churchRole": "Rol in biserica?", "prayerRequest": "Cerere de rugaciune", "finalMessage": "Mesaj final"},
    "ru": {"title": "OBO MNE / MOY PROFIL", "sectionPersonal": "LICHNAYA INFO", "sectionRole": "ROL V CERKVI", "sectionInterests": "INTERESY", "sectionObjectives": "CELI", "faithYears": "Skolko let hristianin?", "churchRole": "Rol v cerkvi?", "prayerRequest": "Prosba o molitve", "finalMessage": "Zaklyuchitelnoye soobshcheniye"}
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
