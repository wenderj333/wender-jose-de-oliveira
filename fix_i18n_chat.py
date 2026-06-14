import json, os
base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'
translations = {
    "pt": { "soundOn": "Som activado", "soundOff": "Som desactivado", "messageSent": "Mensagem enviada" },
    "es": { "soundOn": "Sonido activado", "soundOff": "Sonido desactivado", "messageSent": "Mensaje enviado" },
    "en": { "soundOn": "Sound on", "soundOff": "Sound off", "messageSent": "Message sent" },
    "de": { "soundOn": "Ton an", "soundOff": "Ton aus", "messageSent": "Nachricht gesendet" },
    "fr": { "soundOn": "Son active", "soundOff": "Son desactive", "messageSent": "Message envoye" },
    "ro": { "soundOn": "Sunet activat", "soundOff": "Sunet dezactivat", "messageSent": "Mesaj trimis" },
    "ru": { "soundOn": "Звук включен", "soundOff": "Звук выключен", "messageSent": "Сообщение отправлено" }
}
for lang, keys in translations.items():
    path = os.path.join(base, lang + ".json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "chat" not in data:
            data["chat"] = {}
        for k, v in keys.items():
            data["chat"][k] = v
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"OK: {lang}")
    except Exception as e:
        print(f"ERRO {lang}: {e}")
