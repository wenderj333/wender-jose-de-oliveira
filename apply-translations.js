const fs = require('fs');
const path = require('path');

const i18nDir = 'frontend/src/i18n';

const navKeys = {
  pt: { reflection: 'Reflexão com Deus', help_life: 'Ajude o Próximo', pastoral_chat: 'Fale com o Pastor', spiritual_life: 'Vida Espiritual' },
  de: { reflection: 'Reflexion mit Gott', help_life: 'Hilf deinem Nächsten', pastoral_chat: 'Seelsorge-Chat', spiritual_life: 'Geistliches Leben' },
  en: { reflection: 'Reflection with God', help_life: 'Help Your Neighbor', pastoral_chat: 'Pastoral Chat', spiritual_life: 'Spiritual Life' },
  es: { reflection: 'Reflexión con Dios', help_life: 'Ayuda al Prójimo', pastoral_chat: 'Chat Pastoral', spiritual_life: 'Vida Espiritual' },
  fr: { reflection: 'Réflexion avec Dieu', help_life: 'Aidez votre Prochain', pastoral_chat: 'Chat Pastoral', spiritual_life: 'Vie Spirituelle' },
  ro: { reflection: 'Reflecție cu Dumnezeu', help_life: 'Ajută un Aproapele', pastoral_chat: 'Chat Pastoral', spiritual_life: 'Viață Spirituală' },
  ru: { reflection: 'Размышление с Богом', help_life: 'Помоги Ближнему', pastoral_chat: 'Пасторский Чат', spiritual_life: 'Духовная Жизнь' },
};

const reflectionKeys = {
  pt: {
    title: 'Reflexão com Deus',
    subtitle: 'Dedica alguns minutos para refletir profundamente',
    q1: 'Se hoje fosse o seu último dia, o que diria a Deus?',
    q1verse: 'Porque Deus amou o mundo de tal maneira - João 3:16',
    q2: 'O que impede você de entregar completamente a sua vida a Cristo?',
    q2verse: 'Vinde a mim todos os cansados - Mateus 11:28',
    q3: 'Como você quer ser lembrado na eternidade?',
    q3verse: 'Eu sou a ressurreição e a vida - João 11:25',
    placeholder: 'Escreve a tua reflexão aqui...',
    save: 'Guardar Reflexão',
    saved: 'Reflexão guardada!',
  },
  de: {
    title: 'Besinnung mit Gott',
    subtitle: 'Nimm dir Minuten zum Nachdenken',
    q1: 'Was würdest du Gott sagen, wenn heute dein letzter Tag wäre?',
    q1verse: 'Denn so hat Gott die Welt geliebt - Johannes 3:16',
    q2: 'Was hindert dich, dein Leben Christus zu übergeben?',
    q2verse: 'Kommt her zu mir alle Mühseligen - Matthäus 11:28',
    q3: 'Wie möchtest du in der Ewigkeit erinnert werden?',
    q3verse: 'Ich bin die Auferstehung und das Leben - Johannes 11:25',
    placeholder: 'Schreibe deine Besinnung hier...',
    save: 'Besinnung speichern',
    saved: 'Besinnung gespeichert!',
  },
  en: {
    title: 'Reflection with God',
    subtitle: 'Take a few minutes to reflect deeply',
    q1: 'If today were your last day, what would you say to God?',
    q1verse: 'For God so loved the world - John 3:16',
    q2: 'What prevents you from surrendering your life to Christ?',
    q2verse: 'Come to me all who are weary - Matthew 11:28',
    q3: 'How do you want to be remembered in eternity?',
    q3verse: 'I am the resurrection and the life - John 11:25',
    placeholder: 'Write your reflection here...',
    save: 'Save Reflection',
    saved: 'Reflection saved!',
  },
  es: {
    title: 'Reflexión con Dios',
    subtitle: 'Dedica unos minutos para reflexionar profundamente',
    q1: 'Si hoy fuera tu último día, ¿qué le dirías a Dios?',
    q1verse: 'Porque de tal manera amó Dios al mundo - Juan 3:16',
    q2: '¿Qué te impide entregar completamente tu vida a Cristo?',
    q2verse: 'Venid a mí todos los que estáis cansados - Mateo 11:28',
    q3: '¿Cómo quieres ser recordado en la eternidad?',
    q3verse: 'Yo soy la resurrección y la vida - Juan 11:25',
    placeholder: 'Escribe tu reflexión aquí...',
    save: 'Guardar Reflexión',
    saved: '¡Reflexión guardada!',
  },
  fr: {
    title: 'Réflexion avec Dieu',
    subtitle: 'Prenez quelques minutes pour réfléchir profondément',
    q1: "Si aujourd'hui était votre dernier jour, que diriez-vous à Dieu?",
    q1verse: "Car Dieu a tant aimé le monde - Jean 3:16",
    q2: "Qu'est-ce qui vous empêche de livrer votre vie au Christ?",
    q2verse: 'Venez à moi, vous tous qui êtes fatigués - Matthieu 11:28',
    q3: "Comment voulez-vous être rappelé dans l'éternité?",
    q3verse: "Je suis la résurrection et la vie - Jean 11:25",
    placeholder: 'Écrivez votre réflexion ici...',
    save: 'Enregistrer la Réflexion',
    saved: 'Réflexion enregistrée !',
  },
  ro: {
    title: 'Reflecție cu Dumnezeu',
    subtitle: 'Alocă câteva minute pentru a reflecta profund',
    q1: 'Dacă astăzi ar fi ultima ta zi, ce i-ai spune lui Dumnezeu?',
    q1verse: 'Fiindcă Dumnezeu a iubit lumea atât de mult - Ioan 3:16',
    q2: 'Ce te împiedică să-ți predai viața lui Hristos?',
    q2verse: 'Veniți la Mine, toți cei trudiți - Matei 11:28',
    q3: 'Cum vrei să fii amintit în eternitate?',
    q3verse: 'Eu sunt învierea și viața - Ioan 11:25',
    placeholder: 'Scrie-ți reflecția aici...',
    save: 'Salvează Reflecția',
    saved: 'Reflecție salvată!',
  },
  ru: {
    title: 'Размышление с Богом',
    subtitle: 'Уделите несколько минут для глубокого размышления',
    q1: 'Если бы сегодня был ваш последний день, что бы вы сказали Богу?',
    q1verse: 'Ибо так возлюбил Бог мир - Иоанна 3:16',
    q2: 'Что мешает вам полностью отдать свою жизнь Христу?',
    q2verse: 'Придите ко Мне все труждающиеся - Матфея 11:28',
    q3: 'Каким вы хотите быть запомненным в вечности?',
    q3verse: 'Я есмь воскресение и жизнь - Иоанна 11:25',
    placeholder: 'Напишите здесь своё размышление...',
    save: 'Сохранить размышление',
    saved: 'Размышление сохранено!',
  },
};

const langs = ['pt', 'de', 'en', 'es', 'fr', 'ro', 'ru'];

for (const lang of langs) {
  const filePath = path.join(i18nDir, `${lang}.json`);
  if (!fs.existsSync(filePath)) { console.warn(`Missing: ${filePath}`); continue; }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Task 1: nav keys
  if (!data.nav) data.nav = {};
  Object.assign(data.nav, navKeys[lang]);

  // Task 2: reflection keys
  data.reflection = { ...(data.reflection || {}), ...reflectionKeys[lang] };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ Updated ${lang}.json`);
}

console.log('All done!');
