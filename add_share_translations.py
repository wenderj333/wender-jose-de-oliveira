import json
langs = {
    "pt": {"shareWithMember": "Partilhar com membro", "sendPost": "Enviar post", "searchMember": "Procurar membro...", "postSent": "Post enviado!"},
    "en": {"shareWithMember": "Share with member", "sendPost": "Send post", "searchMember": "Search member...", "postSent": "Post sent!"},
    "es": {"shareWithMember": "Compartir con miembro", "sendPost": "Enviar post", "searchMember": "Buscar miembro...", "postSent": "Post enviado!"},
    "de": {"shareWithMember": "Mit Mitglied teilen", "sendPost": "Post senden", "searchMember": "Mitglied suchen...", "postSent": "Post gesendet!"},
    "fr": {"shareWithMember": "Partager avec membre", "sendPost": "Envoyer post", "searchMember": "Chercher membre...", "postSent": "Post envoye!"},
    "ro": {"shareWithMember": "Distribuie cu membru", "sendPost": "Trimite post", "searchMember": "Cauta membru...", "postSent": "Post trimis!"},
    "ru": {"shareWithMember": "?????????? ? ??????????", "sendPost": "????????? ????", "searchMember": "?????? ?????????...", "postSent": "???? ?????????!"},
}
for lang, vals in langs.items():
    fname = "frontend/src/i18n/" + lang + ".json"
    with open(fname, "rb") as f:
        data = json.loads(f.read().decode("utf-8"))
    if "share" not in data:
        data["share"] = {}
    for k, v in vals.items():
        data["share"][k] = v
    with open(fname, "wb") as f:
        f.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))
    print(lang + " - OK")
