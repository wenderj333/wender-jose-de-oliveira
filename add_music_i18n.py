
import json

keys_to_add = {
    "pt": {"next": "Próxima", "prev": "Anterior", "shuffle": "Aleatório", "repeat": "Repetir", "nowPlaying": "A tocar"},
    "en": {"next": "Next", "prev": "Previous", "shuffle": "Shuffle", "repeat": "Repeat", "nowPlaying": "Now Playing"},
    "es": {"next": "Siguiente", "prev": "Anterior", "shuffle": "Aleatorio", "repeat": "Repetir", "nowPlaying": "Reproduciendo"},
    "de": {"next": "Weiter", "prev": "Zurück", "shuffle": "Zufällig", "repeat": "Wiederholen", "nowPlaying": "Spielt jetzt"},
    "fr": {"next": "Suivant", "prev": "Précédent", "shuffle": "Aléatoire", "repeat": "Répéter", "nowPlaying": "En cours"},
    "ro": {"next": "Următor", "prev": "Anterior", "shuffle": "Aleatoriu", "repeat": "Repetă", "nowPlaying": "Se redă"},
    "ru": {"next": "Следующий", "prev": "Предыдущий", "shuffle": "Случайно", "repeat": "Повторить", "nowPlaying": "Сейчас играет"},
}

for lang, keys in keys_to_add.items():
    path = f"frontend/src/i18n/{lang}.json"
    with open(path, "rb") as f:
        data = json.loads(f.read().decode("utf-8"))
    if "music" in data:
        for k, v in keys.items():
            data["music"][k] = v
        with open(path, "wb") as f:
            f.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))
        print(f"{lang} OK")
    else:
        print(f"{lang} - music key not found")

