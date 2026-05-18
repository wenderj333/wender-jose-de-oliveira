import json
translations = {
    "pt": {"none": "Nenhum directo agora", "be_first": "Se o primeiro a transmitir!", "start": "Iniciar Directo", "verse_title": "VERSICULO DO DIA"},
    "en": {"none": "No live now", "be_first": "Be the first to stream!", "start": "Start Live", "verse_title": "VERSE OF THE DAY"},
    "es": {"none": "Sin directo ahora", "be_first": "Se el primero en transmitir!", "start": "Iniciar Directo", "verse_title": "VERSICULO DEL DIA"},
    "de": {"none": "Kein Live jetzt", "be_first": "Sei der Erste!", "start": "Live starten", "verse_title": "TAGESVERS"},
    "fr": {"none": "Pas de direct maintenant", "be_first": "Soyez le premier!", "start": "Demarrer Live", "verse_title": "VERSET DU JOUR"},
    "ro": {"none": "Fara live acum", "be_first": "Fii primul!", "start": "Incepe Live", "verse_title": "VERSETUL ZILEI"},
    "ru": {"none": "Net efira", "be_first": "Budte pervym!", "start": "Nachat efir", "verse_title": "STIKH DNYA"},
}
for lang, vals in translations.items():
    fname = "frontend/src/i18n/" + lang + ".json"
    try:
        with open(fname, "rb") as f:
            data = json.loads(f.read().decode("utf-8"))
        if "live" not in data:
            data["live"] = {}
        data["live"]["none"] = vals["none"]
        data["live"]["be_first"] = vals["be_first"]
        data["live"]["start"] = vals["start"]
        if "sidebar" not in data:
            data["sidebar"] = {}
        data["sidebar"]["verse"] = vals["verse_title"]
        with open(fname, "wb") as f:
            f.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))
        print(lang + " - OK")
    except Exception as e:
        print(lang + " - ERRO: " + str(e))
