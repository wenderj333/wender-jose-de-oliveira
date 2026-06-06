import json
fixes = {
    'pt': {'likePhoto': 'Gostei', 'commentPhoto': 'Comentar', 'sharePhoto': 'Partilhar', 'noComments': 'Nenhum comentario ainda.', 'writeComment': 'Escreve um comentario...'},
    'en': {'likePhoto': 'Like', 'commentPhoto': 'Comment', 'sharePhoto': 'Share', 'noComments': 'No comments yet.', 'writeComment': 'Write a comment...'},
    'es': {'likePhoto': 'Me gusta', 'commentPhoto': 'Comentar', 'sharePhoto': 'Compartir', 'noComments': 'Sin comentarios aun.', 'writeComment': 'Escribe un comentario...'},
    'de': {'likePhoto': 'Gefalt mir', 'commentPhoto': 'Kommentieren', 'sharePhoto': 'Teilen', 'noComments': 'Noch keine Kommentare.', 'writeComment': 'Schreibe einen Kommentar...'},
    'fr': {'likePhoto': "J'aime", 'commentPhoto': 'Commenter', 'sharePhoto': 'Partager', 'noComments': 'Pas encore de commentaires.', 'writeComment': 'Ecris un commentaire...'},
    'ro': {'likePhoto': 'Imi place', 'commentPhoto': 'Comenteaza', 'sharePhoto': 'Distribuie', 'noComments': 'Niciun comentariu inca.', 'writeComment': 'Scrie un comentariu...'},
    'ru': {'likePhoto': 'Nravitsya', 'commentPhoto': 'Kommentirovat', 'sharePhoto': 'Podelit', 'noComments': 'Kommentariev poka net.', 'writeComment': 'Napishy kommentariy...'}
}
for lang, keys in fixes.items():
    fname = 'src/i18n/' + lang + '.json'
    with open(fname, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
    if 'photo' not in data:
        data['photo'] = {}
    for k, v in keys.items():
        data['photo'][k] = v
    with open(fname, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('OK: ' + lang)
