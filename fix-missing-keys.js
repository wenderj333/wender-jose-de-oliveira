const fs = require('fs');
const path = require('path');

const i18nDir = 'frontend/src/i18n';

// Keys missing from App.jsx sidebar/widgets
const missingKeys = {
  pt: {
    'nav.bible_ai': 'IA Bíblica',
    'nav.members': 'Membros',
    'nav.journeys': 'Jornadas de Fé',
    'nav.groups': 'Grupos',
    'nav.music': 'Música',
    'nav.mural': 'Mural',
    'nav.prayers': 'Pedidos de Oração',
    'nav.consecration': 'Consagração & Jejum',
    'nav.help_requests': 'Pedidos de Ajuda',
    'course.title': 'Bíblia & Estudo',
    'events.title': 'Próximos Eventos',
    'live.none': 'Nenhuma transmissão',
    'live.be_first': 'Seja o primeiro!',
    'live.start': 'Iniciar Directo',
    'mural.pray': 'Orar',
    'auth.logout': 'Sair',
    'common.user': 'Utilizador',
    'common.welcomeBack': 'Bem-vindo de volta',
    'profile.friends': 'Amigos',
    'landing.subtitle': 'A rede social cristã para crescer na fé, conectar com irmãos e viver o evangelho.',
    'landing.register': 'Criar conta gratuita',
    'landing.login': 'Entrar',
  },
  de: {
    'nav.bible_ai': 'Bibel KI',
    'nav.members': 'Mitglieder',
    'nav.journeys': 'Glaubensreisen',
    'nav.groups': 'Gruppen',
    'nav.music': 'Musik',
    'nav.mural': 'Pinnwand',
    'nav.prayers': 'Gebetsanliegen',
    'nav.consecration': 'Weihe & Fasten',
    'nav.help_requests': 'Hilfeanfragen',
    'course.title': 'Bibel & Studium',
    'events.title': 'Nächste Ereignisse',
    'live.none': 'Keine Übertragung',
    'live.be_first': 'Sei der Erste!',
    'live.start': 'Live starten',
    'mural.pray': 'Beten',
    'auth.logout': 'Abmelden',
    'common.user': 'Benutzer',
    'common.welcomeBack': 'Willkommen zurück',
    'profile.friends': 'Freunde',
    'landing.subtitle': 'Das christliche soziale Netzwerk zum Wachsen im Glauben.',
    'landing.register': 'Kostenloses Konto erstellen',
    'landing.login': 'Einloggen',
  },
  en: {
    'nav.bible_ai': 'Bible AI',
    'nav.members': 'Members',
    'nav.journeys': 'Faith Journeys',
    'nav.groups': 'Groups',
    'nav.music': 'Music',
    'nav.mural': 'Feed',
    'nav.prayers': 'Prayer Requests',
    'nav.consecration': 'Consecration & Fasting',
    'nav.help_requests': 'Help Requests',
    'course.title': 'Bible & Study',
    'events.title': 'Upcoming Events',
    'live.none': 'No broadcast',
    'live.be_first': 'Be the first!',
    'live.start': 'Start Live',
    'mural.pray': 'Pray',
    'auth.logout': 'Logout',
    'common.user': 'User',
    'common.welcomeBack': 'Welcome back',
    'profile.friends': 'Friends',
    'landing.subtitle': 'The Christian social network to grow in faith, connect with brothers and sisters.',
    'landing.register': 'Create free account',
    'landing.login': 'Login',
  },
  es: {
    'nav.bible_ai': 'IA Bíblica',
    'nav.members': 'Miembros',
    'nav.journeys': 'Jornadas de Fe',
    'nav.groups': 'Grupos',
    'nav.music': 'Música',
    'nav.mural': 'Mural',
    'nav.prayers': 'Peticiones de Oración',
    'nav.consecration': 'Consagración y Ayuno',
    'nav.help_requests': 'Solicitudes de Ayuda',
    'course.title': 'Biblia y Estudio',
    'events.title': 'Próximos Eventos',
    'live.none': 'Sin transmisión',
    'live.be_first': '¡Sé el primero!',
    'live.start': 'Iniciar Directo',
    'mural.pray': 'Orar',
    'auth.logout': 'Salir',
    'common.user': 'Usuario',
    'common.welcomeBack': 'Bienvenido de nuevo',
    'profile.friends': 'Amigos',
    'landing.subtitle': 'La red social cristiana para crecer en la fe.',
    'landing.register': 'Crear cuenta gratuita',
    'landing.login': 'Entrar',
  },
  fr: {
    'nav.bible_ai': 'IA Biblique',
    'nav.members': 'Membres',
    'nav.journeys': 'Parcours de Foi',
    'nav.groups': 'Groupes',
    'nav.music': 'Musique',
    'nav.mural': 'Fil d\'actualité',
    'nav.prayers': 'Demandes de Prière',
    'nav.consecration': 'Consécration & Jeûne',
    'nav.help_requests': 'Demandes d\'aide',
    'course.title': 'Bible & Étude',
    'events.title': 'Prochains Événements',
    'live.none': 'Aucune diffusion',
    'live.be_first': 'Soyez le premier !',
    'live.start': 'Démarrer en Direct',
    'mural.pray': 'Prier',
    'auth.logout': 'Déconnexion',
    'common.user': 'Utilisateur',
    'common.welcomeBack': 'Bon retour',
    'profile.friends': 'Amis',
    'landing.subtitle': 'Le réseau social chrétien pour grandir dans la foi.',
    'landing.register': 'Créer un compte gratuit',
    'landing.login': 'Se connecter',
  },
  ro: {
    'nav.bible_ai': 'IA Biblică',
    'nav.members': 'Membri',
    'nav.journeys': 'Călătorii de Credință',
    'nav.groups': 'Grupuri',
    'nav.music': 'Muzică',
    'nav.mural': 'Perete',
    'nav.prayers': 'Cereri de Rugăciune',
    'nav.consecration': 'Consacrare & Post',
    'nav.help_requests': 'Cereri de Ajutor',
    'course.title': 'Biblie & Studiu',
    'events.title': 'Evenimente Viitoare',
    'live.none': 'Nicio transmisie',
    'live.be_first': 'Fii primul!',
    'live.start': 'Pornește Live',
    'mural.pray': 'Roagă-te',
    'auth.logout': 'Deconectare',
    'common.user': 'Utilizator',
    'common.welcomeBack': 'Bun venit înapoi',
    'profile.friends': 'Prieteni',
    'landing.subtitle': 'Rețeaua socială creștină pentru a crește în credință.',
    'landing.register': 'Creează cont gratuit',
    'landing.login': 'Autentificare',
  },
  ru: {
    'nav.bible_ai': 'Библейский ИИ',
    'nav.members': 'Участники',
    'nav.journeys': 'Путешествия Веры',
    'nav.groups': 'Группы',
    'nav.music': 'Музыка',
    'nav.mural': 'Лента',
    'nav.prayers': 'Молитвенные просьбы',
    'nav.consecration': 'Посвящение и Пост',
    'nav.help_requests': 'Просьбы о помощи',
    'course.title': 'Библия и Учёба',
    'events.title': 'Предстоящие события',
    'live.none': 'Нет трансляции',
    'live.be_first': 'Будьте первым!',
    'live.start': 'Начать прямой эфир',
    'mural.pray': 'Молиться',
    'auth.logout': 'Выйти',
    'common.user': 'Пользователь',
    'common.welcomeBack': 'С возвращением',
    'profile.friends': 'Друзья',
    'landing.subtitle': 'Христианская социальная сеть для роста в вере.',
    'landing.register': 'Создать бесплатный аккаунт',
    'landing.login': 'Войти',
  },
};

const langs = ['pt', 'de', 'en', 'es', 'fr', 'ro', 'ru'];

for (const lang of langs) {
  const filePath = path.join(i18nDir, `${lang}.json`);
  if (!fs.existsSync(filePath)) { console.warn(`Missing: ${filePath}`); continue; }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const keys = missingKeys[lang];

  for (const [dotKey, val] of Object.entries(keys)) {
    const parts = dotKey.split('.');
    let obj = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]] || typeof obj[parts[i]] !== 'object') obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = val;
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ ${lang}.json`);
}

console.log('Done!');
