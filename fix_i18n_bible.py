import json, os
base = r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\i18n'
translations = {
    "pt": { "bibleStudy": "Biblia de Estudo", "searchVerse": "Buscar versiculo", "readBible": "Ler Biblia", "favorites": "Favoritos", "readingPlan": "Plano de Leitura", "books": "Livros", "chapter": "Capitulo", "verse": "Versiculo", "addFavorite": "Adicionar aos favoritos", "removeFavorite": "Remover dos favoritos" },
    "es": { "bibleStudy": "Biblia de Estudio", "searchVerse": "Buscar versiculo", "readBible": "Leer Biblia", "favorites": "Favoritos", "readingPlan": "Plan de Lectura", "books": "Libros", "chapter": "Capitulo", "verse": "Versiculo", "addFavorite": "Agregar a favoritos", "removeFavorite": "Quitar de favoritos" },
    "en": { "bibleStudy": "Bible Study", "searchVerse": "Search verse", "readBible": "Read Bible", "favorites": "Favorites", "readingPlan": "Reading Plan", "books": "Books", "chapter": "Chapter", "verse": "Verse", "addFavorite": "Add to favorites", "removeFavorite": "Remove from favorites" },
    "de": { "bibleStudy": "Bibelstudium", "searchVerse": "Vers suchen", "readBible": "Bibel lesen", "favorites": "Favoriten", "readingPlan": "Leseplan", "books": "Bucher", "chapter": "Kapitel", "verse": "Vers", "addFavorite": "Zu Favoriten hinzufugen", "removeFavorite": "Aus Favoriten entfernen" },
    "fr": { "bibleStudy": "Etude Biblique", "searchVerse": "Rechercher verset", "readBible": "Lire la Bible", "favorites": "Favoris", "readingPlan": "Plan de Lecture", "books": "Livres", "chapter": "Chapitre", "verse": "Verset", "addFavorite": "Ajouter aux favoris", "removeFavorite": "Retirer des favoris" },
    "ro": { "bibleStudy": "Studiu Biblic", "searchVerse": "Cauta verset", "readBible": "Citeste Biblia", "favorites": "Favorite", "readingPlan": "Plan de Citire", "books": "Carti", "chapter": "Capitol", "verse": "Verset", "addFavorite": "Adauga la favorite", "removeFavorite": "Sterge din favorite" },
    "ru": { "bibleStudy": "Изучение Библии", "searchVerse": "Поиск стиха", "readBible": "Читать Библию", "favorites": "Избранное", "readingPlan": "План чтения", "books": "Книги", "chapter": "Глава", "verse": "Стих", "addFavorite": "Добавить в избранное", "removeFavorite": "Удалить из избранного" }
}
for lang, keys in translations.items():
    path = os.path.join(base, lang + ".json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "bible" not in data:
            data["bible"] = {}
        for k, v in keys.items():
            data["bible"][k] = v
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"OK: {lang}")
    except Exception as e:
        print(f"ERRO {lang}: {e}")
