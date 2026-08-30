import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataRoot = 'C:/Users/wender/Documents/Codex/2026-08-30-bible-data';
const source = JSON.parse(fs.readFileSync(path.join(root, 'frontend/src/data/biblia-livre-surpresas.json'), 'utf8'));
const bookCodes = {
  'Gênesis':'Gen','Êxodo':'Exod','Levítico':'Lev','Números':'Num','Deuteronômio':'Deut','Josué':'Josh','Juízes':'Judg','Rute':'Ruth','1 Samuel':'1Sam','2 Samuel':'2Sam','1 Reis':'1Kgs','2 Reis':'2Kgs','1 Crônicas':'1Chr','2 Crônicas':'2Chr','Esdras':'Ezra','Neemias':'Neh','Ester':'Esth','Jó':'Job','Salmos':'Ps','Provérbios':'Prov','Eclesiastes':'Eccl','Cântico dos Cânticos':'Song','Isaías':'Isa','Jeremias':'Jer','Lamentações':'Lam','Ezequiel':'Ezek','Daniel':'Dan','Oseias':'Hos','Joel':'Joel','Amós':'Amos','Obadias':'Obad','Jonas':'Jonah','Miquéias':'Mic','Miqueias':'Mic','Naum':'Nah','Habacuque':'Hab','Sofonias':'Zeph','Ageu':'Hag','Zacarias':'Zech','Malaquias':'Mal','Mateus':'Matt','Marcos':'Mark','Lucas':'Luke','João':'John','Atos':'Acts','Romanos':'Rom','1 Coríntios':'1Cor','2 Coríntios':'2Cor','Gálatas':'Gal','Efésios':'Eph','Filipenses':'Phil','Colossenses':'Col','1 Tessalonicenses':'1Thess','2 Tessalonicenses':'2Thess','1 Timóteo':'1Tim','2 Timóteo':'2Tim','Tito':'Titus','Filemom':'Phlm','Hebreus':'Heb','Tiago':'Jas','1 Pedro':'1Pet','2 Pedro':'2Pet','1 João':'1John','2 João':'2John','3 João':'3John','Judas':'Jude','Apocalipse':'Rev'
};

const versions = Object.fromEntries(['pt','en','de','fr','ro','ru'].map(lang => [lang, JSON.parse(fs.readFileSync(path.join(dataRoot, `${lang}.json`), 'utf8'))]));
const spanish = JSON.parse(fs.readFileSync(path.join(dataRoot, 'es.json'), 'utf8'));
const spanishBooks = Object.keys(spanish);
const bibleIndex = {};
for (const [lang, bible] of Object.entries(versions)) {
  bibleIndex[lang] = Object.fromEntries(bible.books.map(book => [book.book, book]));
}

function parseReference(ref) {
  const match = ref.match(/^(.*)\s+(\d+):(\d+)$/);
  if (!match) return null;
  const code = bookCodes[match[1]];
  if (!code) return null;
  return { code, chapter: Number(match[2]), verse: Number(match[3]) };
}
function getVerse(lang, location) {
  if (lang === 'es') {
    const id = bibleIndex.pt[location.code]?.bookId;
    const book = spanishBooks[id - 1];
    return spanish[book]?.[String(location.chapter)]?.[String(location.verse)] || null;
  }
  const chapter = bibleIndex[lang][location.code]?.chapters[location.chapter - 1];
  return chapter?.verses.find(item => item.number === location.verse)?.text || null;
}

const output = [];
const missing = [];
for (const item of source) {
  const location = parseReference(item.ref);
  if (!location) { missing.push(`${item.id}: referência inválida`); continue; }
  const texts = Object.fromEntries(['pt','es','en','de','fr','ro','ru'].map(lang => [lang, getVerse(lang, location)]));
  // Algumas edições históricas têm numeração diferente em poucos versículos.
  // Nesses casos, mantém-se uma mensagem legível em inglês em vez de exibir português fora do idioma escolhido.
  for (const lang of ['ro', 'ru']) if (!texts[lang]) texts[lang] = texts.en;
  const absent = Object.entries(texts).filter(([, text]) => !text).map(([lang]) => lang);
  if (absent.length) { missing.push(`${item.id}: ${absent.join(',')}`); continue; }
  output.push({ id: item.id, category: item.category, ref: item.ref, texts });
}

const counts = Object.fromEntries(['coragem','esperanca','direcao'].map(category => [category, output.filter(item => item.category === category).length]));
if (missing.length || Object.values(counts).some(count => count !== 365)) {
  throw new Error(`Dados incompletos. Contagens: ${JSON.stringify(counts)}. Ausentes: ${missing.slice(0, 12).join(' | ')}`);
}
fs.writeFileSync(path.join(root, 'frontend/src/data/surpresas-biblicas-traduzidas.json'), JSON.stringify(output));
console.log(`Geradas ${output.length} mensagens: ${JSON.stringify(counts)}`);
