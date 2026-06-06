import json
fixes = {
    'pt': {'gallery': 'Galeria', 'addPhoto': 'Adicionar Foto', 'noPhotos': 'Nenhuma foto ainda.', 'allPosts': 'Todas', 'noPosts': 'Nenhuma publicacao ainda.', 'viewProfile': 'Ver Perfil', 'editProfile': 'Editar Perfil', 'requestSent': 'Pedido enviado', 'uploading': 'A fazer upload...', 'choosePhoto': 'Escolher foto', 'photoCaption': 'Legenda', 'visPublic': 'Publico', 'visFriends': 'So irmaos', 'visPrivate': 'So eu'},
    'en': {'gallery': 'Gallery', 'addPhoto': 'Add Photo', 'noPhotos': 'No photos yet.', 'allPosts': 'All', 'noPosts': 'No posts yet.', 'viewProfile': 'View Profile', 'editProfile': 'Edit Profile', 'requestSent': 'Request sent', 'uploading': 'Uploading...', 'choosePhoto': 'Choose photo', 'photoCaption': 'Caption', 'visPublic': 'Public', 'visFriends': 'Friends only', 'visPrivate': 'Only me'},
    'es': {'gallery': 'Galeria', 'addPhoto': 'Agregar Foto', 'noPhotos': 'Sin fotos aun.', 'allPosts': 'Todas', 'noPosts': 'Sin publicaciones.', 'viewProfile': 'Ver Perfil', 'editProfile': 'Editar Perfil', 'requestSent': 'Solicitud enviada', 'uploading': 'Subiendo...', 'choosePhoto': 'Elegir foto', 'photoCaption': 'Leyenda', 'visPublic': 'Publico', 'visFriends': 'Solo amigos', 'visPrivate': 'Solo yo'},
    'de': {'gallery': 'Galerie', 'addPhoto': 'Foto hinzufugen', 'noPhotos': 'Noch keine Fotos.', 'allPosts': 'Alle', 'noPosts': 'Noch keine Beitrage.', 'viewProfile': 'Profil ansehen', 'editProfile': 'Profil bearbeiten', 'requestSent': 'Anfrage gesendet', 'uploading': 'Wird hochgeladen...', 'choosePhoto': 'Foto wahlen', 'photoCaption': 'Beschriftung', 'visPublic': 'Offentlich', 'visFriends': 'Nur Freunde', 'visPrivate': 'Nur ich'},
    'fr': {'gallery': 'Galerie', 'addPhoto': 'Ajouter Photo', 'noPhotos': 'Pas encore de photos.', 'allPosts': 'Toutes', 'noPosts': 'Pas encore de publications.', 'viewProfile': 'Voir Profil', 'editProfile': 'Modifier Profil', 'requestSent': 'Demande envoyee', 'uploading': 'Telechargement...', 'choosePhoto': 'Choisir photo', 'photoCaption': 'Legende', 'visPublic': 'Public', 'visFriends': 'Amis seulement', 'visPrivate': 'Moi seul'},
    'ro': {'gallery': 'Galerie', 'addPhoto': 'Adauga Poza', 'noPhotos': 'Nicio poza inca.', 'allPosts': 'Toate', 'noPosts': 'Nicio postare inca.', 'viewProfile': 'Vezi Profil', 'editProfile': 'Editeaza Profil', 'requestSent': 'Cerere trimisa', 'uploading': 'Se incarca...', 'choosePhoto': 'Alege poza', 'photoCaption': 'Legenda', 'visPublic': 'Public', 'visFriends': 'Doar prieteni', 'visPrivate': 'Doar eu'},
    'ru': {'gallery': 'Galereya', 'addPhoto': 'Dobavit foto', 'noPhotos': 'Foto poka net.', 'allPosts': 'Vse', 'noPosts': 'Postov poka net.', 'viewProfile': 'Smotret profil', 'editProfile': 'Redaktirovat profil', 'requestSent': 'Zapros otpravlen', 'uploading': 'Zagruzka...', 'choosePhoto': 'Vybrat foto', 'photoCaption': 'Podpis', 'visPublic': 'Publichno', 'visFriends': 'Tolko druzya', 'visPrivate': 'Tolko ya'}
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
