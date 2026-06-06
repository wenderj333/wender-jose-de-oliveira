import json
fixes = {
    'pt': {'gallery': 'Galeria', 'addPhoto': 'Adicionar Foto', 'photoCaption': 'Legenda', 'visPublic': 'Publico', 'visFriends': 'So irmaos', 'visPrivate': 'So eu', 'noPhotos': 'Nenhuma foto ainda.'},
    'en': {'gallery': 'Gallery', 'addPhoto': 'Add Photo', 'photoCaption': 'Caption', 'visPublic': 'Public', 'visFriends': 'Friends only', 'visPrivate': 'Only me', 'noPhotos': 'No photos yet.'},
    'es': {'gallery': 'Galeria', 'addPhoto': 'Agregar Foto', 'photoCaption': 'Leyenda', 'visPublic': 'Publico', 'visFriends': 'Solo amigos', 'visPrivate': 'Solo yo', 'noPhotos': 'Sin fotos aun.'},
    'de': {'gallery': 'Galerie', 'addPhoto': 'Foto hinzufugen', 'photoCaption': 'Beschriftung', 'visPublic': 'Offentlich', 'visFriends': 'Nur Freunde', 'visPrivate': 'Nur ich', 'noPhotos': 'Noch keine Fotos.'},
    'fr': {'gallery': 'Galerie', 'addPhoto': 'Ajouter Photo', 'photoCaption': 'Legende', 'visPublic': 'Public', 'visFriends': 'Amis seulement', 'visPrivate': 'Moi seul', 'noPhotos': 'Pas encore de photos.'},
    'ro': {'gallery': 'Galerie', 'addPhoto': 'Adauga Poza', 'photoCaption': 'Legenda', 'visPublic': 'Public', 'visFriends': 'Doar prieteni', 'visPrivate': 'Doar eu', 'noPhotos': 'Nicio poza inca.'},
    'ru': {'gallery': 'Galereya', 'addPhoto': 'Dobavit foto', 'photoCaption': 'Podpis', 'visPublic': 'Publichno', 'visFriends': 'Tolko druzya', 'visPrivate': 'Tolko ya', 'noPhotos': 'Foto poka net.'}
}
for lang, keys in fixes.items():
    fname = 'src/i18n/' + lang + '.json'
    with open(fname, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
    for k, v in keys.items():
        data['profile'][k] = v
    with open(fname, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('OK: ' + lang)
