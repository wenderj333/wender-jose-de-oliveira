import json, os
base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'
translations = {
    "pt": { "loading": "A carregar...", "loadingPosts": "A carregar publicacoes...", "joinCommunity": "Entra na comunidade!" },
    "es": { "loading": "Cargando...", "loadingPosts": "Cargando publicaciones...", "joinCommunity": "Unete a la comunidad!" },
    "en": { "loading": "Loading...", "loadingPosts": "Loading posts...", "joinCommunity": "Join the community!" },
    "de": { "loading": "Laden...", "loadingPosts": "Beitrage laden...", "joinCommunity": "Tritt der Gemeinschaft bei!" },
    "fr": { "loading": "Chargement...", "loadingPosts": "Chargement des publications...", "joinCommunity": "Rejoins la communaute!" },
    "ro": { "loading": "Se incarca...", "loadingPosts": "Se incarca postarile...", "joinCommunity": "Alatura-te comunitatii!" },
    "ru": { "loading": "Загрузка...", "loadingPosts": "Загрузка публикаций...", "joinCommunity": "Присоединяйся к сообществу!" }
}
for lang, keys in translations.items():
    path = os.path.join(base, lang + ".json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "mural" not in data:
            data["mural"] = {}
        for k, v in keys.items():
            data["mural"][k] = v
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"OK: {lang}")
    except Exception as e:
        print(f"ERRO {lang}: {e}")
