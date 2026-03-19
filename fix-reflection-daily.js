const fs = require('fs');
const i18nDir = 'frontend/src/i18n';

// 7 conjuntos de perguntas — um por dia da semana (0=Dom, 1=Seg, ... 6=Sáb)
const days = {
  pt: [
    { // Dom
      q1: 'Se hoje fosse seu último dia, o que diria a Deus?',
      q1verse: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito — João 3:16',
      q2: 'O que te impede de entregar completamente sua vida a Cristo?',
      q2verse: 'Vinde a mim todos os que estais cansados e sobrecarregados — Mateus 11:28',
      q3: 'Como você tem vivido o amor ao próximo esta semana?',
      q3verse: 'Amai-vos uns aos outros como eu vos amei — João 13:34',
    },
    { // Seg
      q1: 'Pelo que você é verdadeiramente grato hoje?',
      q1verse: 'Em tudo dai graças, porque esta é a vontade de Deus — 1 Tessalonicenses 5:18',
      q2: 'Onde você sente a presença de Deus na sua vida agora?',
      q2verse: 'Onde dois ou três estiverem reunidos em meu nome, ali estou — Mateus 18:20',
      q3: 'Qual pecado você precisa deixar nas mãos de Deus hoje?',
      q3verse: 'Se confessarmos os nossos pecados, ele é fiel e justo — 1 João 1:9',
    },
    { // Ter
      q1: 'Como você pode ser luz hoje no seu ambiente?',
      q1verse: 'Vós sois a luz do mundo. Não se pode esconder uma cidade... — Mateus 5:14',
      q2: 'O que a Bíblia tem falado ao seu coração ultimamente?',
      q2verse: 'A tua palavra é lâmpada que ilumina os meus passos — Salmos 119:105',
      q3: 'Há alguém que você precisa perdoar hoje?',
      q3verse: 'Perdoai-vos uns aos outros, como Deus em Cristo vos perdoou — Efésios 4:32',
    },
    { // Qua
      q1: 'Qual promessa de Deus você precisa lembrar hoje?',
      q1verse: 'Porque eu sei os planos que tenho para vocês, diz o Senhor — Jeremias 29:11',
      q2: 'O que Deus tem te chamado a fazer e você ainda não agiu?',
      q2verse: 'Tudo posso naquele que me fortalece — Filipenses 4:13',
      q3: 'Como está seu tempo a sós com Deus esta semana?',
      q3verse: 'Mas tu, quando orares, entra no teu quarto e fecha a porta — Mateus 6:6',
    },
    { // Qui
      q1: 'O que você precisa soltar e confiar a Deus?',
      q1verse: 'Entrega o teu caminho ao Senhor, confia nele — Salmos 37:5',
      q2: 'Como sua fé tem crescido no último mês?',
      q2verse: 'A fé é o firme fundamento das coisas que se esperam — Hebreus 11:1',
      q3: 'Você está usando seus dons para servir aos outros?',
      q3verse: 'Cada um coloque ao serviço dos outros o dom que recebeu — 1 Pedro 4:10',
    },
    { // Sex
      q1: 'O que roubou sua paz esta semana? Como Deus pode restaurá-la?',
      q1verse: 'A paz de Deus, que excede todo entendimento, guardará — Filipenses 4:7',
      q2: 'Como você tem testemunhado Cristo para as pessoas ao redor?',
      q2verse: 'Ide por todo o mundo e pregai o evangelho — Marcos 16:15',
      q3: 'Qual área da sua vida ainda precisa de transformação?',
      q3verse: 'Não vos conformeis com este século, mas transformai-vos — Romanos 12:2',
    },
    { // Sáb
      q1: 'O que Deus revelou sobre Si mesmo para você esta semana?',
      q1verse: 'Conhecereis a verdade, e a verdade vos libertará — João 8:32',
      q2: 'Como você pode fortalecer sua família na fé?',
      q2verse: 'Quanto a mim e à minha casa, serviremos ao Senhor — Josué 24:15',
      q3: 'Em que área você mais precisa da graça de Deus?',
      q3verse: 'Basta-te a minha graça, porque o meu poder se aperfeiçoa — 2 Coríntios 12:9',
    },
  ],
  de: [
    { q1:'Wenn heute dein letzter Tag wäre, was würdest du Gott sagen?', q1verse:'Denn also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab — Johannes 3:16', q2:'Was hindert dich daran, dein Leben vollständig Christus zu übergeben?', q2verse:'Kommt her zu mir alle, die ihr mühselig und beladen seid — Matthäus 11:28', q3:'Wie hast du diese Woche die Nächstenliebe gelebt?', q3verse:'Liebet einander, wie ich euch geliebt habe — Johannes 13:34' },
    { q1:'Wofür bist du heute wirklich dankbar?', q1verse:'Seid dankbar in allen Dingen, denn das ist Gottes Wille — 1. Thessalonicher 5:18', q2:'Wo spürst du gerade Gottes Gegenwart in deinem Leben?', q2verse:'Wo zwei oder drei in meinem Namen versammelt sind — Matthäus 18:20', q3:'Welche Sünde musst du heute in Gottes Hände legen?', q3verse:'Wenn wir unsere Sünden bekennen, ist er treu und gerecht — 1. Johannes 1:9' },
    { q1:'Wie kannst du heute in deinem Umfeld ein Licht sein?', q1verse:'Ihr seid das Licht der Welt — Matthäus 5:14', q2:'Was hat die Bibel zuletzt zu deinem Herzen gesprochen?', q2verse:'Dein Wort ist meines Fußes Leuchte — Psalm 119:105', q3:'Gibt es jemanden, dem du heute vergeben musst?', q3verse:'Vergebt einander, wie Gott euch in Christus vergeben hat — Epheser 4:32' },
    { q1:'Welches Versprechen Gottes brauchst du heute?', q1verse:'Ich weiß, was für Gedanken ich über euch habe, spricht der Herr — Jeremia 29:11', q2:'Wozu ruft Gott dich und du hast noch nicht gehandelt?', q2verse:'Ich vermag alles durch den, der mich stark macht — Philipper 4:13', q3:'Wie ist deine stille Zeit mit Gott diese Woche?', q3verse:'Wenn du betest, geh in dein Kämmerlein — Matthäus 6:6' },
    { q1:'Was musst du loslassen und Gott anvertrauen?', q1verse:'Befiehl dem HERRN deinen Weg und vertraue auf ihn — Psalm 37:5', q2:'Wie ist dein Glaube im letzten Monat gewachsen?', q2verse:'Der Glaube ist die Grundlage der Dinge, die man hofft — Hebräer 11:1', q3:'Setzt du deine Gaben ein, um anderen zu dienen?', q3verse:'Dienet einander, jeder mit der Gabe, die er empfangen hat — 1. Petrus 4:10' },
    { q1:'Was hat deinen Frieden gestohlen? Wie kann Gott ihn wiederherstellen?', q1verse:'Der Friede Gottes, der allen Verstand übersteigt — Philipper 4:7', q2:'Wie hast du Christus den Menschen um dich herum bezeugt?', q2verse:'Geht hin in alle Welt und predigt das Evangelium — Markus 16:15', q3:'In welchem Bereich deines Lebens brauchst du noch Veränderung?', q3verse:'Stellt euch nicht dieser Welt gleich, sondern verwandelt euch — Römer 12:2' },
    { q1:'Was hat Gott dir diese Woche über sich selbst offenbart?', q1verse:'Ihr werdet die Wahrheit erkennen, und die Wahrheit wird euch frei machen — Johannes 8:32', q2:'Wie kannst du deine Familie im Glauben stärken?', q2verse:'Ich und mein Haus wollen dem HERRN dienen — Josua 24:15', q3:'In welchem Bereich brauchst du Gottes Gnade am meisten?', q3verse:'Meine Gnade genügt dir, denn meine Kraft wird in Schwachheit vollkommen — 2. Korinther 12:9' },
  ],
  en: [
    { q1:'If today were your last day, what would you say to God?', q1verse:'For God so loved the world that he gave his one and only Son — John 3:16', q2:'What is keeping you from fully surrendering your life to Christ?', q2verse:'Come to me, all you who are weary and burdened — Matthew 11:28', q3:'How have you shown love to others this week?', q3verse:'Love one another as I have loved you — John 13:34' },
    { q1:'What are you truly grateful for today?', q1verse:'Give thanks in all circumstances, for this is God\'s will — 1 Thessalonians 5:18', q2:'Where do you feel God\'s presence in your life right now?', q2verse:'Where two or three gather in my name, there am I — Matthew 18:20', q3:'What sin do you need to place in God\'s hands today?', q3verse:'If we confess our sins, he is faithful and just — 1 John 1:9' },
    { q1:'How can you be a light today in your environment?', q1verse:'You are the light of the world — Matthew 5:14', q2:'What has the Bible been speaking to your heart lately?', q2verse:'Your word is a lamp for my feet, a light on my path — Psalm 119:105', q3:'Is there someone you need to forgive today?', q3verse:'Forgive one another, just as in Christ God forgave you — Ephesians 4:32' },
    { q1:'Which promise of God do you need to hold onto today?', q1verse:'I know the plans I have for you, declares the Lord — Jeremiah 29:11', q2:'What is God calling you to do that you haven\'t done yet?', q2verse:'I can do all this through him who gives me strength — Philippians 4:13', q3:'How is your quiet time with God going this week?', q3verse:'But when you pray, go into your room, close the door — Matthew 6:6' },
    { q1:'What do you need to let go and trust to God?', q1verse:'Commit your way to the Lord; trust in him — Psalm 37:5', q2:'How has your faith grown in the past month?', q2verse:'Faith is confidence in what we hope for — Hebrews 11:1', q3:'Are you using your gifts to serve others?', q3verse:'Each of you should use whatever gift you have received to serve others — 1 Peter 4:10' },
    { q1:'What stole your peace this week? How can God restore it?', q1verse:'And the peace of God, which transcends all understanding — Philippians 4:7', q2:'How have you witnessed Christ to people around you?', q2verse:'Go into all the world and preach the gospel — Mark 16:15', q3:'In what area of your life do you still need transformation?', q3verse:'Do not conform to the pattern of this world, but be transformed — Romans 12:2' },
    { q1:'What has God revealed about himself to you this week?', q1verse:'Then you will know the truth, and the truth will set you free — John 8:32', q2:'How can you strengthen your family in faith?', q2verse:'As for me and my household, we will serve the Lord — Joshua 24:15', q3:'In what area do you need God\'s grace the most?', q3verse:'My grace is sufficient for you, for my power is made perfect in weakness — 2 Corinthians 12:9' },
  ],
  es: [
    { q1:'Si hoy fuera tu último día, ¿qué le dirías a Dios?', q1verse:'Porque de tal manera amó Dios al mundo que dio a su Hijo unigénito — Juan 3:16', q2:'¿Qué te impide entregar completamente tu vida a Cristo?', q2verse:'Venid a mí todos los que estáis trabajados y cargados — Mateo 11:28', q3:'¿Cómo has vivido el amor al prójimo esta semana?', q3verse:'Amaos los unos a los otros como yo os he amado — Juan 13:34' },
    { q1:'¿Por qué estás verdaderamente agradecido hoy?', q1verse:'En todo dad gracias, porque esta es la voluntad de Dios — 1 Tesalonicenses 5:18', q2:'¿Dónde sientes la presencia de Dios en tu vida ahora?', q2verse:'Donde dos o tres estén reunidos en mi nombre, allí estoy — Mateo 18:20', q3:'¿Qué pecado necesitas dejar en manos de Dios hoy?', q3verse:'Si confesamos nuestros pecados, él es fiel y justo — 1 Juan 1:9' },
    { q1:'¿Cómo puedes ser luz hoy en tu entorno?', q1verse:'Vosotros sois la luz del mundo — Mateo 5:14', q2:'¿Qué te ha estado hablando la Biblia últimamente?', q2verse:'Lámpara es a mis pies tu palabra — Salmo 119:105', q3:'¿Hay alguien a quien necesitas perdonar hoy?', q3verse:'Perdonaos los unos a los otros, como Dios os perdonó en Cristo — Efesios 4:32' },
    { q1:'¿Qué promesa de Dios necesitas recordar hoy?', q1verse:'Porque yo sé los pensamientos que tengo acerca de vosotros, dice el Señor — Jeremías 29:11', q2:'¿A qué te llama Dios y aún no has actuado?', q2verse:'Todo lo puedo en Cristo que me fortalece — Filipenses 4:13', q3:'¿Cómo está tu tiempo a solas con Dios esta semana?', q3verse:'Pero tú, cuando ores, entra en tu aposento — Mateo 6:6' },
    { q1:'¿Qué necesitas soltar y confiar a Dios?', q1verse:'Encomienda al Señor tu camino y confía en él — Salmo 37:5', q2:'¿Cómo ha crecido tu fe en el último mes?', q2verse:'La fe es la certeza de lo que se espera — Hebreos 11:1', q3:'¿Estás usando tus dones para servir a los demás?', q3verse:'Cada uno según el don que ha recibido, minístrelo a los otros — 1 Pedro 4:10' },
    { q1:'¿Qué robó tu paz esta semana? ¿Cómo puede Dios restaurarla?', q1verse:'Y la paz de Dios, que sobrepasa todo entendimiento — Filipenses 4:7', q2:'¿Cómo has testificado de Cristo a las personas a tu alrededor?', q2verse:'Id por todo el mundo y predicad el evangelio — Marcos 16:15', q3:'¿En qué área de tu vida aún necesitas transformación?', q3verse:'No os conforméis a este siglo, sino transformaos — Romanos 12:2' },
    { q1:'¿Qué te ha revelado Dios acerca de sí mismo esta semana?', q1verse:'Y conoceréis la verdad, y la verdad os hará libres — Juan 8:32', q2:'¿Cómo puedes fortalecer a tu familia en la fe?', q2verse:'Yo y mi casa serviremos al Señor — Josué 24:15', q3:'¿En qué área necesitas más la gracia de Dios?', q3verse:'Bástate mi gracia, porque mi poder se perfecciona en la debilidad — 2 Corintios 12:9' },
  ],
  fr: [
    { q1:"Si aujourd'hui était votre dernier jour, que diriez-vous à Dieu?", q1verse:"Car Dieu a tant aimé le monde qu'il a donné son Fils unique — Jean 3:16", q2:"Qu'est-ce qui vous empêche de remettre entièrement votre vie à Christ?", q2verse:"Venez à moi, vous tous qui êtes fatigués et chargés — Matthieu 11:28", q3:"Comment avez-vous vécu l'amour du prochain cette semaine?", q3verse:"Aimez-vous les uns les autres comme je vous ai aimés — Jean 13:34" },
    { q1:"Pour quoi êtes-vous vraiment reconnaissant aujourd'hui?", q1verse:"Rendez grâces en toutes choses, car c'est la volonté de Dieu — 1 Thessaloniciens 5:18", q2:"Où sentez-vous la présence de Dieu dans votre vie en ce moment?", q2verse:"Car là où deux ou trois sont réunis en mon nom — Matthieu 18:20", q3:"Quel péché devez-vous remettre entre les mains de Dieu aujourd'hui?", q3verse:"Si nous confessons nos péchés, il est fidèle et juste — 1 Jean 1:9" },
    { q1:"Comment pouvez-vous être une lumière aujourd'hui dans votre environnement?", q1verse:"Vous êtes la lumière du monde — Matthieu 5:14", q2:"Qu'est-ce que la Bible vous a dit dernièrement?", q2verse:"Ta parole est une lampe à mes pieds — Psaume 119:105", q3:"Y a-t-il quelqu'un que vous devez pardonner aujourd'hui?", q3verse:"Pardonnez-vous les uns aux autres, comme Dieu vous a pardonnés en Christ — Éphésiens 4:32" },
    { q1:"Quelle promesse de Dieu avez-vous besoin de vous rappeler aujourd'hui?", q1verse:"Car je connais les projets que j'ai sur vous, dit l'Éternel — Jérémie 29:11", q2:"À quoi Dieu vous appelle-t-il et vous n'avez pas encore agi?", q2verse:"Je puis tout par celui qui me fortifie — Philippiens 4:13", q3:"Comment se passe votre temps seul avec Dieu cette semaine?", q3verse:"Mais toi, quand tu pries, entre dans ta chambre — Matthieu 6:6" },
    { q1:"Que devez-vous lâcher et confier à Dieu?", q1verse:"Recommande ton sort à l'Éternel, mets en lui ta confiance — Psaume 37:5", q2:"Comment votre foi a-t-elle grandi le mois dernier?", q2verse:"La foi est la ferme assurance des choses qu'on espère — Hébreux 11:1", q3:"Utilisez-vous vos dons pour servir les autres?", q3verse:"Servez-vous les uns les autres, chacun selon le don qu'il a reçu — 1 Pierre 4:10" },
    { q1:"Qu'est-ce qui a volé votre paix cette semaine? Comment Dieu peut-il la restaurer?", q1verse:"Et la paix de Dieu, qui surpasse toute intelligence — Philippiens 4:7", q2:"Comment avez-vous témoigné de Christ aux personnes autour de vous?", q2verse:"Allez dans le monde entier et prêchez la bonne nouvelle — Marc 16:15", q3:"Dans quel domaine de votre vie avez-vous encore besoin de transformation?", q3verse:"Ne vous conformez pas au siècle présent, mais soyez transformés — Romains 12:2" },
    { q1:"Qu'est-ce que Dieu vous a révélé sur lui-même cette semaine?", q1verse:"Vous connaîtrez la vérité, et la vérité vous affranchira — Jean 8:32", q2:"Comment pouvez-vous fortifier votre famille dans la foi?", q2verse:"Moi et ma maison, nous servirons l'Éternel — Josué 24:15", q3:"Dans quel domaine avez-vous le plus besoin de la grâce de Dieu?", q3verse:"Ma grâce te suffit, car ma puissance s'accomplit dans la faiblesse — 2 Corinthiens 12:9" },
  ],
  ro: [
    { q1:'Dacă astăzi ar fi ultima ta zi, ce i-ai spune lui Dumnezeu?', q1verse:'Fiindcă atât de mult a iubit Dumnezeu lumea, că a dat pe singurul Lui Fiu — Ioan 3:16', q2:'Ce te împiedică să-ți predai complet viața lui Cristos?', q2verse:'Veniți la Mine toți cei trudiți și împovărați — Matei 11:28', q3:'Cum ai trăit dragostea față de aproapele tău în această săptămână?', q3verse:'Iubiți-vă unii pe alții cum v-am iubit Eu — Ioan 13:34' },
    { q1:'Pentru ce ești cu adevărat recunoscător astăzi?', q1verse:'Mulțumiți lui Dumnezeu pentru toate lucrurile — 1 Tesaloniceni 5:18', q2:'Unde simți prezența lui Dumnezeu în viața ta acum?', q2verse:'Căci acolo unde sunt doi sau trei adunați în Numele Meu — Matei 18:20', q3:'Ce păcat trebuie să lași în mâinile lui Dumnezeu astăzi?', q3verse:'Dacă ne mărturisim păcatele, El este credincios și drept — 1 Ioan 1:9' },
    { q1:'Cum poți fi o lumină astăzi în mediul tău?', q1verse:'Voi sunteți lumina lumii — Matei 5:14', q2:'Ce ți-a vorbit Biblia la inimă recent?', q2verse:'Cuvântul Tău este o candelă pentru picioarele mele — Psalm 119:105', q3:'Există cineva pe care trebuie să-l ierți astăzi?', q3verse:'Iertați-vă unii pe alții, cum v-a iertat și Dumnezeu în Cristos — Efeseni 4:32' },
    { q1:'Ce promisiune a lui Dumnezeu ai nevoie să-ți amintești astăzi?', q1verse:'Eu știu gândurile pe care le am cu privire la voi, zice Domnul — Ieremia 29:11', q2:'La ce te cheamă Dumnezeu și tu nu ai acționat încă?', q2verse:'Pot totul prin Cristos care mă întărește — Filipeni 4:13', q3:'Cum este timpul tău singur cu Dumnezeu în această săptămână?', q3verse:'Dar tu, când te rogi, intră în odăița ta — Matei 6:6' },
    { q1:'Ce trebuie să eliberezi și să încredințezi lui Dumnezeu?', q1verse:'Încredințează-ți soarta Domnului și ai încredere în El — Psalm 37:5', q2:'Cum a crescut credința ta în ultima lună?', q2verse:'Credința este o încredere neclintită în lucrurile nădăjduite — Evrei 11:1', q3:'Folosești darurile tale pentru a-i sluji pe alții?', q3verse:'Fiecare să pună în slujba altora darul pe care l-a primit — 1 Petru 4:10' },
    { q1:'Ce ți-a furat pacea această săptămână? Cum o poate restaura Dumnezeu?', q1verse:'Și pacea lui Dumnezeu, care întrece orice pricepere — Filipeni 4:7', q2:'Cum ai mărturisit despre Cristos oamenilor din jurul tău?', q2verse:'Duceți-vă în toată lumea și predicați Evanghelia — Marcu 16:15', q3:'În ce domeniu al vieții tale mai ai nevoie de transformare?', q3verse:'Nu vă potriviți chipului veacului acestuia, ci să vă transformați — Romani 12:2' },
    { q1:'Ce ți-a revelat Dumnezeu despre Sine în această săptămână?', q1verse:'Veți cunoaște adevărul, și adevărul vă va face liberi — Ioan 8:32', q2:'Cum poți să-ți întărești familia în credință?', q2verse:'Cât despre mine și casa mea, vom sluji Domnului — Iosua 24:15', q3:'În ce domeniu ai cel mai mult nevoie de harul lui Dumnezeu?', q3verse:'Harul Meu îți este de ajuns, pentru că puterea Mea se desăvârșește în slăbiciune — 2 Corinteni 12:9' },
  ],
  ru: [
    { q1:'Если бы сегодня был твой последний день, что бы ты сказал Богу?', q1verse:'Ибо так возлюбил Бог мир, что отдал Сына Своего единородного — Иоанна 3:16', q2:'Что мешает тебе полностью посвятить свою жизнь Христу?', q2verse:'Придите ко Мне все труждающиеся и обременённые — Матфея 11:28', q3:'Как ты проявлял любовь к ближнему на этой неделе?', q3verse:'Любите друг друга, как Я возлюбил вас — Иоанна 13:34' },
    { q1:'За что ты по-настоящему благодарен сегодня?', q1verse:'За всё благодарите Бога, ибо такова воля Его — 1 Фессалоникийцам 5:18', q2:'Где ты чувствуешь присутствие Бога в своей жизни прямо сейчас?', q2verse:'Ибо где двое или трое собраны во имя Моё — Матфея 18:20', q3:'Какой грех тебе нужно сегодня отдать в руки Бога?', q3verse:'Если исповедуем грехи наши, то Он, будучи верен и праведен — 1 Иоанна 1:9' },
    { q1:'Как ты можешь быть светом сегодня в своём окружении?', q1verse:'Вы — свет мира — Матфея 5:14', q2:'Что Библия говорила твоему сердцу в последнее время?', q2verse:'Слово Твоё — светильник ноге моей — Псалом 118:105', q3:'Есть ли кто-то, кого тебе нужно простить сегодня?', q3verse:'Прощайте друг друга, как и Бог во Христе простил вас — Ефесянам 4:32' },
    { q1:'Какое обещание Бога тебе нужно вспомнить сегодня?', q1verse:'Ибо только Я знаю намерения, какие имею о вас, говорит Господь — Иеремии 29:11', q2:'К чему Бог призывает тебя, а ты ещё не действовал?', q2verse:'Всё могу в укрепляющем меня Христе — Филиппийцам 4:13', q3:'Как проходит твоё время наедине с Богом на этой неделе?', q3verse:'Но ты, когда молишься, войди в комнату твою — Матфея 6:6' },
    { q1:'Что тебе нужно отпустить и доверить Богу?', q1verse:'Предай Господу путь твой и уповай на Него — Псалом 36:5', q2:'Как выросла твоя вера за последний месяц?', q2verse:'Вера же есть осуществление ожидаемого — Евреям 11:1', q3:'Используешь ли ты свои дары для служения другим?', q3verse:'Служите друг другу, каждый тем даром, какой получил — 1 Петра 4:10' },
    { q1:'Что украло твой покой на этой неделе? Как Бог может его восстановить?', q1verse:'И мир Божий, который превыше всякого ума — Филиппийцам 4:7', q2:'Как ты свидетельствовал о Христе окружающим людям?', q2verse:'Идите по всему миру и проповедуйте Евангелие — Марка 16:15', q3:'В какой области твоей жизни ещё нужно преобразование?', q3verse:'Не сообразуйтесь с веком сим, но преобразуйтесь — Римлянам 12:2' },
    { q1:'Что Бог открыл тебе о Себе на этой неделе?', q1verse:'И познаете истину, и истина сделает вас свободными — Иоанна 8:32', q2:'Как ты можешь укрепить свою семью в вере?', q2verse:'Я и дом мой будем служить Господу — Иисус Навин 24:15', q3:'В какой области тебе больше всего нужна благодать Бога?', q3verse:'Довольно для тебя благодати Моей, ибо сила Моя совершается в немощи — 2 Коринфянам 12:9' },
  ],
};

const langs = ['pt', 'de', 'en', 'es', 'fr', 'ro', 'ru'];

for (const lang of langs) {
  const filePath = `${i18nDir}/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!data.reflection) data.reflection = {};
  data.reflection.days = days[lang];
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ ${lang}.json — 7 sets added`);
}
console.log('Done!');
