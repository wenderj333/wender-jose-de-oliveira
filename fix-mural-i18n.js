const fs = require('fs');
const path = require('path');
const i18nDir = 'frontend/src/i18n';

const muralKeys = {
  pt: {
    title: 'Mural da Comunidade',
    subtitle: 'Compartilhe sua fé, testemunhos e louvores',
    newPost: '+ Nova Publicação',
    cancel: 'Cancelar',
    publish: 'Publicar',
    publishing: 'Publicando...',
    messagePlaceholder: 'Compartilhe algo com a comunidade...',
    commentPlaceholder: 'Escreva um comentário...',
    amen: 'Amém',
    noPostsFound: 'Nenhuma publicação encontrada.',
    loginRequired: 'Faça login para ver e publicar.',
    confirmDelete: 'Tem certeza que deseja eliminar esta publicação?',
    uploadError: 'Erro ao fazer upload.',
    uploadConnectionError: 'Erro de conexão ao fazer upload.',
    musicLabel: 'Música',
    pray: 'Orar',
    'filters.all': 'Todas',
    'filters.testimonies': 'Testemunhos',
    'filters.worship': 'Louvor',
    'filters.verses': 'Versículos',
    'filters.reflections': 'Reflexões',
    'filters.photos': 'Fotos',
    'categories.testemunho': 'Testemunho',
    'categories.louvor': 'Louvor',
    'categories.reflexao': 'Reflexão',
    'categories.versiculo': 'Versículo',
    'categories.foto': 'Foto',
  },
  de: {
    title: 'Gemeinschafts-Pinnwand',
    subtitle: 'Teilen Sie Ihren Glauben, Zeugnisse und Lobpreisungen',
    newPost: '+ Neuer Beitrag',
    cancel: 'Abbrechen',
    publish: 'Veröffentlichen',
    publishing: 'Wird veröffentlicht...',
    messagePlaceholder: 'Teilen Sie etwas mit der Gemeinschaft...',
    commentPlaceholder: 'Kommentar schreiben...',
    amen: 'Amen',
    noPostsFound: 'Keine Beiträge gefunden.',
    loginRequired: 'Melde dich an, um Beiträge zu sehen und zu veröffentlichen.',
    confirmDelete: 'Möchten Sie diesen Beitrag wirklich löschen?',
    uploadError: 'Upload-Fehler.',
    uploadConnectionError: 'Verbindungsfehler beim Upload.',
    musicLabel: 'Musik',
    pray: 'Beten',
    'filters.all': 'Alle',
    'filters.testimonies': 'Zeugnisse',
    'filters.worship': 'Lobpreis',
    'filters.verses': 'Bibelverse',
    'filters.reflections': 'Besinnung',
    'filters.photos': 'Fotos',
    'categories.testemunho': 'Zeugnis',
    'categories.louvor': 'Lobpreis',
    'categories.reflexao': 'Besinnung',
    'categories.versiculo': 'Bibelvers',
    'categories.foto': 'Foto',
  },
  en: {
    title: 'Community Feed',
    subtitle: 'Share your faith, testimonies and worship',
    newPost: '+ New Post',
    cancel: 'Cancel',
    publish: 'Publish',
    publishing: 'Publishing...',
    messagePlaceholder: 'Share something with the community...',
    commentPlaceholder: 'Write a comment...',
    amen: 'Amen',
    noPostsFound: 'No posts found.',
    loginRequired: 'Log in to see and post.',
    confirmDelete: 'Are you sure you want to delete this post?',
    uploadError: 'Upload error.',
    uploadConnectionError: 'Connection error while uploading.',
    musicLabel: 'Music',
    pray: 'Pray',
    'filters.all': 'All',
    'filters.testimonies': 'Testimonies',
    'filters.worship': 'Worship',
    'filters.verses': 'Verses',
    'filters.reflections': 'Reflections',
    'filters.photos': 'Photos',
    'categories.testemunho': 'Testimony',
    'categories.louvor': 'Worship',
    'categories.reflexao': 'Reflection',
    'categories.versiculo': 'Verse',
    'categories.foto': 'Photo',
  },
  es: {
    title: 'Mural de la Comunidad',
    subtitle: 'Comparta su fe, testimonios y alabanzas',
    newPost: '+ Nueva Publicación',
    cancel: 'Cancelar',
    publish: 'Publicar',
    publishing: 'Publicando...',
    messagePlaceholder: 'Comparte algo con la comunidad...',
    commentPlaceholder: 'Escribir un comentario...',
    amen: 'Amén',
    noPostsFound: 'No se encontraron publicaciones.',
    loginRequired: 'Inicia sesión para ver y publicar.',
    confirmDelete: '¿Estás seguro de que deseas eliminar esta publicación?',
    uploadError: 'Error al subir.',
    uploadConnectionError: 'Error de conexión al subir.',
    musicLabel: 'Música',
    pray: 'Orar',
    'filters.all': 'Todas',
    'filters.testimonies': 'Testimonios',
    'filters.worship': 'Alabanza',
    'filters.verses': 'Versículos',
    'filters.reflections': 'Reflexiones',
    'filters.photos': 'Fotos',
    'categories.testemunho': 'Testimonio',
    'categories.louvor': 'Alabanza',
    'categories.reflexao': 'Reflexión',
    'categories.versiculo': 'Versículo',
    'categories.foto': 'Foto',
  },
  fr: {
    title: 'Fil de la Communauté',
    subtitle: 'Partagez votre foi, témoignages et louanges',
    newPost: '+ Nouvelle Publication',
    cancel: 'Annuler',
    publish: 'Publier',
    publishing: 'Publication...',
    messagePlaceholder: 'Partagez quelque chose avec la communauté...',
    commentPlaceholder: 'Écrire un commentaire...',
    amen: 'Amen',
    noPostsFound: 'Aucune publication trouvée.',
    loginRequired: 'Connectez-vous pour voir et publier.',
    confirmDelete: 'Voulez-vous vraiment supprimer cette publication?',
    uploadError: "Erreur d'upload.",
    uploadConnectionError: "Erreur de connexion lors de l'upload.",
    musicLabel: 'Musique',
    pray: 'Prier',
    'filters.all': 'Toutes',
    'filters.testimonies': 'Témoignages',
    'filters.worship': 'Louange',
    'filters.verses': 'Versets',
    'filters.reflections': 'Réflexions',
    'filters.photos': 'Photos',
    'categories.testemunho': 'Témoignage',
    'categories.louvor': 'Louange',
    'categories.reflexao': 'Réflexion',
    'categories.versiculo': 'Verset',
    'categories.foto': 'Photo',
  },
  ro: {
    title: 'Peretele Comunității',
    subtitle: 'Împărtășește-ți credința, mărturiile și laudele',
    newPost: '+ Postare Nouă',
    cancel: 'Anulează',
    publish: 'Publică',
    publishing: 'Se publică...',
    messagePlaceholder: 'Împărtășește ceva cu comunitatea...',
    commentPlaceholder: 'Scrie un comentariu...',
    amen: 'Amin',
    noPostsFound: 'Nu s-au găsit postări.',
    loginRequired: 'Autentifică-te pentru a vedea și a posta.',
    confirmDelete: 'Ești sigur că vrei să ștergi această postare?',
    uploadError: 'Eroare la încărcare.',
    uploadConnectionError: 'Eroare de conexiune la încărcare.',
    musicLabel: 'Muzică',
    pray: 'Roagă-te',
    'filters.all': 'Toate',
    'filters.testimonies': 'Mărturii',
    'filters.worship': 'Laudă',
    'filters.verses': 'Versete',
    'filters.reflections': 'Reflecții',
    'filters.photos': 'Fotografii',
    'categories.testemunho': 'Mărturie',
    'categories.louvor': 'Laudă',
    'categories.reflexao': 'Reflecție',
    'categories.versiculo': 'Verset',
    'categories.foto': 'Fotografie',
  },
  ru: {
    title: 'Лента Сообщества',
    subtitle: 'Делитесь верой, свидетельствами и хвалой',
    newPost: '+ Новая Публикация',
    cancel: 'Отмена',
    publish: 'Опубликовать',
    publishing: 'Публикация...',
    messagePlaceholder: 'Поделитесь чем-нибудь с сообществом...',
    commentPlaceholder: 'Написать комментарий...',
    amen: 'Аминь',
    noPostsFound: 'Публикации не найдены.',
    loginRequired: 'Войдите, чтобы видеть и публиковать.',
    confirmDelete: 'Вы уверены, что хотите удалить эту публикацию?',
    uploadError: 'Ошибка загрузки.',
    uploadConnectionError: 'Ошибка подключения при загрузке.',
    musicLabel: 'Музыка',
    pray: 'Молиться',
    'filters.all': 'Все',
    'filters.testimonies': 'Свидетельства',
    'filters.worship': 'Хвала',
    'filters.verses': 'Стихи',
    'filters.reflections': 'Размышления',
    'filters.photos': 'Фотографии',
    'categories.testemunho': 'Свидетельство',
    'categories.louvor': 'Хвала',
    'categories.reflexao': 'Размышление',
    'categories.versiculo': 'Стих',
    'categories.foto': 'Фото',
  },
};

// Also add common + media + time keys
const extraKeys = {
  pt: { 'common.comment': 'Comentário', 'common.share': 'Partilhar', 'common.send': 'Enviar', 'common.loading': 'A carregar...', 'media.photo': 'Foto', 'media.video': 'Vídeo', 'media.audio': 'Áudio', 'time.now': 'Agora', 'locale': 'pt-PT' },
  de: { 'common.comment': 'Kommentar', 'common.share': 'Teilen', 'common.send': 'Senden', 'common.loading': 'Wird geladen...', 'media.photo': 'Foto', 'media.video': 'Video', 'media.audio': 'Audio', 'time.now': 'Jetzt', 'locale': 'de-DE' },
  en: { 'common.comment': 'Comment', 'common.share': 'Share', 'common.send': 'Send', 'common.loading': 'Loading...', 'media.photo': 'Photo', 'media.video': 'Video', 'media.audio': 'Audio', 'time.now': 'Now', 'locale': 'en-GB' },
  es: { 'common.comment': 'Comentario', 'common.share': 'Compartir', 'common.send': 'Enviar', 'common.loading': 'Cargando...', 'media.photo': 'Foto', 'media.video': 'Video', 'media.audio': 'Audio', 'time.now': 'Ahora', 'locale': 'es-ES' },
  fr: { 'common.comment': 'Commentaire', 'common.share': 'Partager', 'common.send': 'Envoyer', 'common.loading': 'Chargement...', 'media.photo': 'Photo', 'media.video': 'Vidéo', 'media.audio': 'Audio', 'time.now': 'Maintenant', 'locale': 'fr-FR' },
  ro: { 'common.comment': 'Comentariu', 'common.share': 'Distribuie', 'common.send': 'Trimite', 'common.loading': 'Se încarcă...', 'media.photo': 'Fotografie', 'media.video': 'Video', 'media.audio': 'Audio', 'time.now': 'Acum', 'locale': 'ro-RO' },
  ru: { 'common.comment': 'Комментарий', 'common.share': 'Поделиться', 'common.send': 'Отправить', 'common.loading': 'Загрузка...', 'media.photo': 'Фото', 'media.video': 'Видео', 'media.audio': 'Аудио', 'time.now': 'Сейчас', 'locale': 'ru-RU' },
};

const langs = ['pt', 'de', 'en', 'es', 'fr', 'ro', 'ru'];

function setNestedKey(obj, dotKey, val) {
  const parts = dotKey.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = val;
}

for (const lang of langs) {
  const filePath = path.join(i18nDir, `${lang}.json`);
  if (!fs.existsSync(filePath)) { console.warn(`Missing: ${filePath}`); continue; }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Mural keys
  if (!data.mural) data.mural = {};
  for (const [k, v] of Object.entries(muralKeys[lang])) {
    setNestedKey(data.mural, k, v);
  }

  // Extra keys (common, media, time, locale)
  for (const [k, v] of Object.entries(extraKeys[lang])) {
    setNestedKey(data, k, v);
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ ${lang}.json`);
}
console.log('Done!');
