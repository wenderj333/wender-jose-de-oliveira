import json
fixes = {
    'pt': {'gallery': 'Galeria', 'addPhoto': 'Adicionar Foto', 'noPhotos': 'Nenhuma foto ainda.', 'allPosts': 'Todas', 'noPosts': 'Nenhuma publicacao ainda.', 'visPublic': 'Publico', 'visFriends': 'So irmaos', 'visPrivate': 'So eu', 'photoCaption': 'Legenda', 'publishPhoto': 'Publicar Foto', 'uploading': 'A fazer upload...'},
    'en': {'gallery': 'Gallery', 'addPhoto': 'Add Photo', 'noPhotos': 'No photos yet.', 'allPosts': 'All', 'noPosts': 'No posts yet.', 'visPublic': 'Public', 'visFriends': 'Friends only', 'visPrivate': 'Only me', 'photoCaption': 'Caption', 'publishPhoto': 'Publish Photo', 'uploading': 'Uploading...'},
    'es': {'gallery': 'Galeria', 'addPhoto': 'Agregar Foto', 'noPhotos': 'Sin fotos aun.', 'allPosts': 'Todas', 'noPosts': 'Sin publicaciones.', 'visPublic': 'Publico', 'visFriends': 'Solo amigos', 'visPrivate': 'Solo yo', 'photoCaption': 'Leyenda', 'publishPhoto': 'Publicar Foto', 'uploading': 'Subiendo...'},
    'de': {'gallery': 'Galerie', 'addPhoto': 'Foto hinzufugen', 'noPhotos': 'Noch keine Fotos.', 'allPosts': 'Alle', 'noPosts': 'Noch keine Beitrage.', 'visPublic': 'Offentlich', 'visFriends': 'Nur Freunde', 'visPrivate': 'Nur ich', 'photoCaption': 'Beschriftung', 'publishPhoto': 'Foto veroffentlichen', 'uploading': 'Wird hochgeladen...'},
    'fr': {'gallery': 'Galerie', 'addPhoto': 'Ajouter Photo', 'noPhotos': 'Pas encore de photos.', 'allPosts': 'Toutes', 'noPosts': 'Pas encore de publications.', 'visPublic': 'Public', 'visFriends': 'Amis seulement', 'visPrivate': 'Moi seul', 'photoCaption': 'Legende', 'publishPhoto': 'Publier Photo', 'uploading': 'Telechargement...'},
    'ro': {'gallery': 'Galerie', 'addPhoto': 'Adauga Poza', 'noPhotos': 'Nicio poza inca.', 'allPosts': 'Toate', 'noPosts': 'Nicio postare inca.', 'visPublic': 'Public', 'visFriends': 'Doar prieteni', 'visPrivate': 'Doar eu', 'photoCaption': 'Legenda', 'publishPhoto': 'Publica Poza', 'uploading': 'Se incarca...'},
    'ru': {'gallery': 'Galereya', 'addPhoto': 'Dobavit foto', 'noPhotos': 'Foto poka net.', 'allPosts': 'Vse', 'noPosts': 'Postov poka net.', 'visPublic': 'Publichno', 'visFriends': 'Tolko druzya', 'visPrivate': 'Tolko ya', 'photoCaption': 'Podpis', 'publishPhoto': 'Opublikovat foto', 'uploading': 'Zagruzka...'}
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
