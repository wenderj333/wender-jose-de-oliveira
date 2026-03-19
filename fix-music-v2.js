#!/usr/bin/env node
// fix-music-v2.js — adds music v2 and report i18n keys to all language files

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, 'frontend', 'src', 'i18n');

// Keys to add nested under "music" section and "report" section
const musicKeys = {
  pt: {
    tooLong: 'O vídeo/áudio não pode ter mais de 5 minutos',
    uploadPublic: 'Pública — todos podem ver',
    uploadPrivate: 'Privada — só eu',
    visibility: 'Visibilidade',
    video: 'Vídeo Musical',
    audio: 'Áudio',
    uploadHint: 'MP3, WAV, MP4, MOV · máx 5 min',
    uploadCover: 'Capa da música',
    uploadCoverHint: 'Clica para adicionar imagem de capa',
  },
  en: {
    tooLong: 'Video/audio cannot be longer than 5 minutes',
    uploadPublic: 'Public — everyone can see',
    uploadPrivate: 'Private — only me',
    visibility: 'Visibility',
    video: 'Music Video',
    audio: 'Audio',
    uploadHint: 'MP3, WAV, MP4, MOV · max 5 min',
    uploadCover: 'Song cover',
    uploadCoverHint: 'Click to add a cover image',
  },
  es: {
    tooLong: 'El vídeo/audio no puede durar más de 5 minutos',
    uploadPublic: 'Pública — todos pueden ver',
    uploadPrivate: 'Privada — solo yo',
    visibility: 'Visibilidad',
    video: 'Video Musical',
    audio: 'Audio',
    uploadHint: 'MP3, WAV, MP4, MOV · máx 5 min',
    uploadCover: 'Portada de la canción',
    uploadCoverHint: 'Haz clic para añadir imagen de portada',
  },
  fr: {
    tooLong: 'La vidéo/audio ne peut pas dépasser 5 minutes',
    uploadPublic: 'Publique — tout le monde peut voir',
    uploadPrivate: 'Privée — seulement moi',
    visibility: 'Visibilité',
    video: 'Clip Musical',
    audio: 'Audio',
    uploadHint: 'MP3, WAV, MP4, MOV · max 5 min',
    uploadCover: 'Pochette de la chanson',
    uploadCoverHint: "Cliquez pour ajouter une image de pochette",
  },
  de: {
    tooLong: 'Das Video/Audio darf nicht länger als 5 Minuten sein',
    uploadPublic: 'Öffentlich — alle können sehen',
    uploadPrivate: 'Privat — nur ich',
    visibility: 'Sichtbarkeit',
    video: 'Musikvideo',
    audio: 'Audio',
    uploadHint: 'MP3, WAV, MP4, MOV · max 5 Min',
    uploadCover: 'Song-Cover',
    uploadCoverHint: 'Klicken, um ein Cover-Bild hinzuzufügen',
  },
  ro: {
    tooLong: 'Video/audio nu poate depăși 5 minute',
    uploadPublic: 'Public — toți pot vedea',
    uploadPrivate: 'Privat — doar eu',
    visibility: 'Vizibilitate',
    video: 'Videoclip Muzical',
    audio: 'Audio',
    uploadHint: 'MP3, WAV, MP4, MOV · max 5 min',
    uploadCover: 'Coperta melodiei',
    uploadCoverHint: 'Click pentru a adăuga o imagine de copertă',
  },
  ru: {
    tooLong: 'Видео/аудио не может превышать 5 минут',
    uploadPublic: 'Публично — все могут видеть',
    uploadPrivate: 'Приватно — только я',
    visibility: 'Видимость',
    video: 'Музыкальное видео',
    audio: 'Аудио',
    uploadHint: 'MP3, WAV, MP4, MOV · макс 5 мин',
    uploadCover: 'Обложка песни',
    uploadCoverHint: 'Нажмите, чтобы добавить изображение обложки',
  },
};

const reportKeys = {
  pt: {
    title: 'Denunciar',
    subtitle: 'Ajuda-nos a manter a comunidade segura e respeitosa',
    inappropriate: 'Conteúdo impróprio',
    disrespectful: 'Insulto ou desrespeito',
    spam: 'Spam ou publicidade',
    harassment: 'Assédio ou ameaça',
    other: 'Outro motivo',
    descPlaceholder: 'Descreve o que aconteceu (opcional)...',
    send: 'Enviar Denúncia',
    sent: 'Denúncia enviada. Obrigado por ajudar a manter a comunidade segura!',
    cancel: 'Cancelar',
  },
  en: {
    title: 'Report',
    subtitle: 'Help us keep the community safe and respectful',
    inappropriate: 'Inappropriate content',
    disrespectful: 'Insult or disrespect',
    spam: 'Spam or advertising',
    harassment: 'Harassment or threat',
    other: 'Other reason',
    descPlaceholder: 'Describe what happened (optional)...',
    send: 'Send Report',
    sent: 'Report sent. Thank you for helping keep the community safe!',
    cancel: 'Cancel',
  },
  es: {
    title: 'Denunciar',
    subtitle: 'Ayúdanos a mantener la comunidad segura y respetuosa',
    inappropriate: 'Contenido inapropiado',
    disrespectful: 'Insulto o falta de respeto',
    spam: 'Spam o publicidad',
    harassment: 'Acoso o amenaza',
    other: 'Otro motivo',
    descPlaceholder: 'Describe lo que pasó (opcional)...',
    send: 'Enviar Denuncia',
    sent: '¡Denuncia enviada. Gracias por ayudar a mantener la comunidad segura!',
    cancel: 'Cancelar',
  },
  fr: {
    title: 'Signaler',
    subtitle: 'Aidez-nous à maintenir la communauté sûre et respectueuse',
    inappropriate: 'Contenu inapproprié',
    disrespectful: 'Insulte ou manque de respect',
    spam: 'Spam ou publicité',
    harassment: 'Harcèlement ou menace',
    other: 'Autre raison',
    descPlaceholder: 'Décrivez ce qui s\'est passé (facultatif)...',
    send: 'Envoyer le signalement',
    sent: 'Signalement envoyé. Merci d\'aider à maintenir la communauté en sécurité!',
    cancel: 'Annuler',
  },
  de: {
    title: 'Melden',
    subtitle: 'Hilf uns, die Gemeinschaft sicher und respektvoll zu halten',
    inappropriate: 'Unangemessener Inhalt',
    disrespectful: 'Beleidigung oder Respektlosigkeit',
    spam: 'Spam oder Werbung',
    harassment: 'Belästigung oder Bedrohung',
    other: 'Anderer Grund',
    descPlaceholder: 'Beschreibe, was passiert ist (optional)...',
    send: 'Meldung senden',
    sent: 'Meldung gesendet. Danke, dass du dazu beiträgst, die Gemeinschaft sicher zu halten!',
    cancel: 'Abbrechen',
  },
  ro: {
    title: 'Raportează',
    subtitle: 'Ajută-ne să menținem comunitatea sigură și respectuoasă',
    inappropriate: 'Conținut inadecvat',
    disrespectful: 'Insultă sau lipsă de respect',
    spam: 'Spam sau publicitate',
    harassment: 'Hărțuire sau amenințare',
    other: 'Alt motiv',
    descPlaceholder: 'Descrie ce s-a întâmplat (opțional)...',
    send: 'Trimite Raport',
    sent: 'Raport trimis. Mulțumim că ajuți la menținerea siguranței comunității!',
    cancel: 'Anulează',
  },
  ru: {
    title: 'Пожаловаться',
    subtitle: 'Помогите нам сохранить сообщество безопасным и уважительным',
    inappropriate: 'Неприемлемый контент',
    disrespectful: 'Оскорбление или неуважение',
    spam: 'Спам или реклама',
    harassment: 'Преследование или угроза',
    other: 'Другая причина',
    descPlaceholder: 'Опишите, что произошло (необязательно)...',
    send: 'Отправить жалобу',
    sent: 'Жалоба отправлена. Спасибо за помощь в обеспечении безопасности сообщества!',
    cancel: 'Отмена',
  },
};

// Map from filename to language key
const fileToLang = {
  'pt.json': 'pt',
  'pt_fixed.json': 'pt',
  'en.json': 'en',
  'es.json': 'es',
  'fr.json': 'fr',
  'de.json': 'de',
  'ro.json': 'ro',
  'ru.json': 'ru',
};

const files = fs.readdirSync(I18N_DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  const lang = fileToLang[file];
  if (!lang) { console.log(`Skipping ${file} (unknown lang)`); continue; }

  const filePath = path.join(I18N_DIR, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error reading ${file}:`, e.message);
    continue;
  }

  // Add music keys
  if (!data.music) data.music = {};
  const mk = musicKeys[lang] || musicKeys['en'];
  for (const [k, v] of Object.entries(mk)) {
    data.music[k] = v;
  }

  // Add report keys
  const rk = reportKeys[lang] || reportKeys['en'];
  data.report = { ...(data.report || {}), ...rk };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Updated ${file}`);
}

console.log('\n🎉 Done! All i18n files updated.');
