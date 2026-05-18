import json

pix_translations = {
    "pt": {"pixKey": "Chave PIX (opcional)", "pixHelp": "Para receber doações directamente", "donate": "Fazer doação", "donateHelp": "Clica para copiar a chave PIX"},
    "en": {"pixKey": "PIX Key (optional)", "pixHelp": "To receive donations directly", "donate": "Donate", "donateHelp": "Click to copy PIX key"},
    "es": {"pixKey": "Clave PIX (opcional)", "pixHelp": "Para recibir donaciones directamente", "donate": "Donar", "donateHelp": "Toca para copiar clave PIX"},
    "de": {"pixKey": "PIX-Schlüssel (optional)", "pixHelp": "Um direkte Spenden zu erhalten", "donate": "Spenden", "donateHelp": "Klicken zum Kopieren"},
    "fr": {"pixKey": "Clé PIX (optionnel)", "pixHelp": "Pour recevoir des dons directement", "donate": "Faire un don", "donateHelp": "Cliquer pour copier"},
    "ro": {"pixKey": "Cheie PIX (optional)", "pixHelp": "Pentru a primi donatii direct", "donate": "Doneaza", "donateHelp": "Apasa pentru a copia"},
    "ru": {"pixKey": "PIX ключ (необязательно)", "pixHelp": "Для получения пожертвований", "donate": "Пожертвовать", "donateHelp": "Нажмите для копирования"},
}

for lang, vals in pix_translations.items():
    fname = f"frontend/src/i18n/{lang}.json"
    try:
        with open(fname, "rb") as f:
            data = json.loads(f.read().decode("utf-8"))
        if "ajuda" not in data:
            data["ajuda"] = {}
        for k, v in vals.items():
            data["ajuda"][k] = v
        with open(fname, "wb") as f:
            f.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))
        print(f"{lang} - OK")
    except Exception as e:
        print(f"{lang} - ERRO: {e}")
