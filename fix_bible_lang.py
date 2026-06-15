with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\BibleAI.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar mapa de traducoes por idioma
old_books = """const BOOKS_PT = """
new_books = """const LANG_TRANSLATION = {
  pt: 'almeida', es: 'rva', en: 'kjv', de: 'luther1912', fr: 'martin', ro: 'cornilescu', ru: 'synodal'
};

const LANG_BOOKS = {
  en: ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"],
  pt: ["Genesis","Exodo","Levitico","Numeros","Deuteronomio","Josue","Juizes","Rute","1 Samuel","2 Samuel","1 Reis","2 Reis","1 Cronicas","2 Cronicas","Esdras","Neemias","Ester","Jo","Salmos","Proverbios","Eclesiastes","Cantares","Isaias","Jeremias","Lamentacoes","Ezequiel","Daniel","Oseias","Joel","Amos","Obadias","Jonas","Miqueas","Naum","Habacuque","Sofonias","Ageu","Zacarias","Malaquias","Mateus","Marcos","Lucas","Joao","Atos","Romanos","1 Corintios","2 Corintios","Galatas","Efesios","Filipenses","Colossenses","1 Tessalonicenses","2 Tessalonicenses","1 Timoteo","2 Timoteo","Tito","Filemon","Hebreus","Tiago","1 Pedro","2 Pedro","1 Joao","2 Joao","3 Joao","Judas","Apocalipse"],
  es: ["Genesis","Exodo","Levitico","Numeros","Deuteronomio","Josue","Jueces","Rut","1 Samuel","2 Samuel","1 Reyes","2 Reyes","1 Cronicas","2 Cronicas","Esdras","Nehemias","Ester","Job","Salmos","Proverbios","Eclesiastes","Cantares","Isaias","Jeremias","Lamentaciones","Ezequiel","Daniel","Oseas","Joel","Amos","Abdias","Jonas","Miqueas","Nahum","Habacuc","Sofonias","Ageo","Zacarias","Malaquias","Mateo","Marcos","Lucas","Juan","Hechos","Romanos","1 Corintios","2 Corintios","Galatas","Efesios","Filipenses","Colosenses","1 Tesalonicenses","2 Tesalonicenses","1 Timoteo","2 Timoteo","Tito","Filemon","Hebreos","Santiago","1 Pedro","2 Pedro","1 Juan","2 Juan","3 Juan","Judas","Apocalipsis"],
  de: ["1 Mose","2 Mose","3 Mose","4 Mose","5 Mose","Josua","Richter","Ruth","1 Samuel","2 Samuel","1 Konige","2 Konige","1 Chronik","2 Chronik","Esra","Nehemia","Esther","Hiob","Psalmen","Spruche","Prediger","Hoheslied","Jesaja","Jeremia","Klagelieder","Hesekiel","Daniel","Hosea","Joel","Amos","Obadja","Jona","Micha","Nahum","Habakuk","Zefanja","Haggai","Sacharja","Maleachi","Matthaus","Markus","Lukas","Johannes","Apostelgeschichte","Romer","1 Korinther","2 Korinther","Galater","Epheser","Philipper","Kolosser","1 Thessalonicher","2 Thessalonicher","1 Timotheus","2 Timotheus","Titus","Philemon","Hebraer","Jakobus","1 Petrus","2 Petrus","1 Johannes","2 Johannes","3 Johannes","Judas","Offenbarung"],
  fr: ["Genese","Exode","Levitique","Nombres","Deuteronome","Josue","Juges","Ruth","1 Samuel","2 Samuel","1 Rois","2 Rois","1 Chroniques","2 Chroniques","Esdras","Nehemie","Esther","Job","Psaumes","Proverbes","Ecclesiaste","Cantique","Esaie","Jeremie","Lamentations","Ezechiel","Daniel","Osee","Joel","Amos","Abdias","Jonas","Michee","Nahum","Habacuc","Sophonie","Aggee","Zacharie","Malachie","Matthieu","Marc","Luc","Jean","Actes","Romains","1 Corinthiens","2 Corinthiens","Galates","Ephesiens","Philippiens","Colossiens","1 Thessaloniciens","2 Thessaloniciens","1 Timothee","2 Timothee","Tite","Philemon","Hebreux","Jacques","1 Pierre","2 Pierre","1 Jean","2 Jean","3 Jean","Jude","Apocalypse"],
  ro: ["Geneza","Exodul","Leviticul","Numeri","Deuteronomul","Iosua","Judecatori","Rut","1 Samuel","2 Samuel","1 Imparati","2 Imparati","1 Cronici","2 Cronici","Ezra","Neemia","Estera","Iov","Psalmii","Proverbele","Eclesiastul","Cantarea","Isaia","Ieremia","Plangerile","Ezechiel","Daniel","Osea","Ioel","Amos","Obadia","Iona","Mica","Naum","Habacuc","Tefania","Hagai","Zaharia","Maleahi","Matei","Marcu","Luca","Ioan","Faptele","Romani","1 Corinteni","2 Corinteni","Galateni","Efeseni","Filipeni","Coloseni","1 Tesaloniceni","2 Tesaloniceni","1 Timotei","2 Timotei","Tit","Filimon","Evrei","Iacov","1 Petru","2 Petru","1 Ioan","2 Ioan","3 Ioan","Iuda","Apocalipsa"],
  ru: ["Bytie","Iskhod","Levit","Chisla","Vtorozakonie","Iiisus Navin","Sudei","Ruf","1 Tsarstv","2 Tsarstv","3 Tsarstv","4 Tsarstv","1 Paralipomenon","2 Paralipomenon","Ezdry","Neemii","Esfire","Iov","Psaltir","Pritchi","Ekklesiast","Pesn Pesnei","Isaiya","Ieremiya","Plach Ieremii","Iezekiil","Daniil","Osiya","Ioil","Amos","Avdiy","Iona","Mikha","Naum","Avvakum","Sofoniya","Aggei","Zakhariya","Malakhiya","Matvei","Mark","Luka","Ioann","Deyaniya","Rimlyanam","1 Korinfyanam","2 Korinfyanam","Galatam","Efesyanam","Filipiystsam","Kolossyanam","1 Fessalonikiytsam","2 Fessalonikiytsam","1 Timofeiyu","2 Timofeiyu","Titu","Filimonu","Evreiyam","Iakova","1 Petra","2 Petra","1 Ioanna","2 Ioanna","3 Ioanna","Iudy","Otkrovenie"]
};

const BOOKS_PT = """

content = content.replace(old_books, new_books)

# Adicionar deteccao de idioma
old_state = """  const [tab, setTab] = useState("read");"""
new_state = """  const [tab, setTab] = useState("read");
  const userLang = (navigator.language || 'pt').split('-')[0];
  const translation = LANG_TRANSLATION[userLang] || 'almeida';
  const booksLocal = LANG_BOOKS[userLang] || LANG_BOOKS.pt;"""
content = content.replace(old_state, new_state)

# Usar booksLocal em vez de BOOKS_PT
content = content.replace('{BOOKS_PT.map((b, i) =>', '{booksLocal.map((b, i) =>')

# Usar translation na API
content = content.replace('?translation=almeida', '?translation="+translation+"')
content = content.replace('"?translation=almeida"', '"?translation="+translation')

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\BibleAI.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Traducoes: ' + ('OK' if 'LANG_TRANSLATION' in content else 'FALHOU'))
print('booksLocal: ' + ('OK' if 'booksLocal' in content else 'FALHOU'))
