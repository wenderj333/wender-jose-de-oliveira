const fs = require('fs');
const i18nDir = 'frontend/src/i18n';

const keys = {
  pt: {
    headerVerse: '"Servi-vos uns aos outros, cada um conforme o dom que recebeu." — 1 Pedro 4:10',
    'category.spiritual.types': ['Pedido de oração urgente', 'Acompanhamento espiritual', 'Visita pastoral', 'Discipulado e mentoria'],
    'category.diaconia.types': ['Cesta básica e alimentos', 'Roupas e calçados', 'Medicamentos', 'Ajuda financeira emergencial'],
    'category.employment.types': ['Vagas de trabalho entre irmãos', 'Cursos e capacitação', 'Microempreendedorismo'],
    'category.emotional.types': ['Luto e perda', 'Restauração de casamento', 'Apoio a mães solo', 'Dependência química'],
    'category.health.types': ['Transporte para tratamento médico', 'Acompanhante hospitalar', 'Doação de sangue'],
  },
  de: {
    headerVerse: '"Dient einander, jeder mit der Gabe, die er empfangen hat." — 1. Petrus 4:10',
    'category.spiritual.types': ['Dringendes Gebetsanliegen', 'Geistliche Begleitung', 'Pastoralbesuch', 'Jüngerschaft & Mentoring'],
    'category.diaconia.types': ['Lebensmittelkorb & Nahrung', 'Kleidung & Schuhe', 'Medikamente', 'Finanzielle Notfallhilfe'],
    'category.employment.types': ['Jobangebote unter Geschwistern', 'Kurse & Ausbildung', 'Selbstständigkeit'],
    'category.emotional.types': ['Trauer & Verlust', 'Ehewiederherstellung', 'Unterstützung für Alleinerziehende', 'Suchtmittelabhängigkeit'],
    'category.health.types': ['Transport zur medizinischen Behandlung', 'Krankenhausbegleitung', 'Blutspende'],
  },
  en: {
    headerVerse: '"Each of you should use whatever gift you have received to serve others." — 1 Peter 4:10',
    'category.spiritual.types': ['Urgent prayer request', 'Spiritual accompaniment', 'Pastoral visit', 'Discipleship & mentoring'],
    'category.diaconia.types': ['Basic food basket', 'Clothes & shoes', 'Medications', 'Emergency financial aid'],
    'category.employment.types': ['Job opportunities among brothers', 'Courses & training', 'Micro-entrepreneurship'],
    'category.emotional.types': ['Grief & loss', 'Marriage restoration', 'Support for single mothers', 'Substance dependency'],
    'category.health.types': ['Transport to medical treatment', 'Hospital companion', 'Blood donation'],
  },
  es: {
    headerVerse: '"Sírvanse unos a otros con los dones que cada uno ha recibido." — 1 Pedro 4:10',
    'category.spiritual.types': ['Petición de oración urgente', 'Acompañamiento espiritual', 'Visita pastoral', 'Discipulado y mentoría'],
    'category.diaconia.types': ['Cesta básica y alimentos', 'Ropa y calzado', 'Medicamentos', 'Ayuda financiera de emergencia'],
    'category.employment.types': ['Vacantes de trabajo entre hermanos', 'Cursos y capacitación', 'Microemprendimiento'],
    'category.emotional.types': ['Duelo y pérdida', 'Restauración matrimonial', 'Apoyo a madres solteras', 'Dependencia química'],
    'category.health.types': ['Transporte para tratamiento médico', 'Acompañante hospitalario', 'Donación de sangre'],
  },
  fr: {
    headerVerse: '"Servez-vous les uns les autres, chacun selon le don qu\'il a reçu." — 1 Pierre 4:10',
    'category.spiritual.types': ['Demande de prière urgente', 'Accompagnement spirituel', 'Visite pastorale', 'Disciples & mentorat'],
    'category.diaconia.types': ['Panier alimentaire de base', 'Vêtements & chaussures', 'Médicaments', 'Aide financière d\'urgence'],
    'category.employment.types': ['Offres d\'emploi entre frères', 'Cours & formation', 'Micro-entrepreneuriat'],
    'category.emotional.types': ['Deuil & perte', 'Restauration du mariage', 'Soutien aux mères seules', 'Dépendance aux substances'],
    'category.health.types': ['Transport pour traitement médical', 'Accompagnateur à l\'hôpital', 'Don de sang'],
  },
  ro: {
    headerVerse: '"Slujiți-vă unii altora, fiecare după darul pe care l-a primit." — 1 Petru 4:10',
    'category.spiritual.types': ['Cerere urgentă de rugăciune', 'Însoțire spirituală', 'Vizită pastorală', 'Ucenicie & mentorat'],
    'category.diaconia.types': ['Coș alimentar de bază', 'Haine & încălțăminte', 'Medicamente', 'Ajutor financiar de urgență'],
    'category.employment.types': ['Locuri de muncă între frați', 'Cursuri & formare', 'Microîntreprinzătorism'],
    'category.emotional.types': ['Doliu & pierdere', 'Restaurarea căsătoriei', 'Sprijin pentru mame singure', 'Dependență de substanțe'],
    'category.health.types': ['Transport pentru tratament medical', 'Însoțitor la spital', 'Donare de sânge'],
  },
  ru: {
    headerVerse: '"Служите друг другу, каждый тем даром, какой получил." — 1 Петра 4:10',
    'category.spiritual.types': ['Срочная молитвенная просьба', 'Духовное сопровождение', 'Пасторский визит', 'Ученичество и наставничество'],
    'category.diaconia.types': ['Базовый продуктовый набор', 'Одежда и обувь', 'Медикаменты', 'Экстренная финансовая помощь'],
    'category.employment.types': ['Вакансии среди братьев', 'Курсы и обучение', 'Микропредпринимательство'],
    'category.emotional.types': ['Горе и потеря', 'Восстановление брака', 'Поддержка матерей-одиночек', 'Зависимость от веществ'],
    'category.health.types': ['Транспорт для медицинского лечения', 'Больничный сопровождающий', 'Донорство крови'],
  },
};

const langs = ['pt', 'de', 'en', 'es', 'fr', 'ro', 'ru'];

function setNested(obj, dotPath, val) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = val;
}

for (const lang of langs) {
  const filePath = `${i18nDir}/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!data.ajudaProximo) data.ajudaProximo = {};

  for (const [k, v] of Object.entries(keys[lang])) {
    setNested(data.ajudaProximo, k, v);
  }

  // Also add common.cancel key
  if (!data.common) data.common = {};
  const cancelMap = { pt:'Cancelar', de:'Abbrechen', en:'Cancel', es:'Cancelar', fr:'Annuler', ro:'Anulează', ru:'Отмена' };
  data.common.cancel = cancelMap[lang];

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ ${lang}.json`);
}
console.log('Done!');
