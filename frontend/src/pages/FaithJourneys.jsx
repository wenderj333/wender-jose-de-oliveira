import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, ArrowRight, Globe, Lock, Send } from 'lucide-react';

const journeysData = {
  'gratidao-e-oracao': {
    title: {
      pt: 'Jornada de Gratidão e Oração',
      es: 'Jornada de Gratitud y Oración',
      en: 'Journey of Gratitude and Prayer',
      de: 'Reise der Dankbarkeit und des Gebets',
      fr: 'Parcours de Gratitude et Prière',
      ro: 'Călătoria Recunoștinței și Rugăciunii',
      ru: 'Путешествие Благодарности и Молитвы',
    },
    description: {
      pt: '7 dias para cultivar um coração grato e se conectar mais profundamente com Deus.',
      es: '7 días para cultivar un corazón agradecido y conectarse más profundamente con Dios.',
      en: '7 days to cultivate a grateful heart and connect more deeply with God.',
      de: '7 Tage, um ein dankbares Herz zu kultivieren und sich tiefer mit Gott zu verbinden.',
      fr: '7 jours pour cultiver un cœur reconnaissant et se connecter plus profondément à Dieu.',
      ro: '7 zile pentru a cultiva o inimă recunoscătoare și a te conecta mai profund cu Dumnezeu.',
      ru: '7 дней для развития благодарного сердца и более глубокого соединения с Богом.',
    },
    days: [
      {
        theme: {
          pt: 'Dia 1: Reconhecendo as Bênçãos',
          es: 'Día 1: Reconociendo las Bendiciones',
          en: 'Day 1: Recognizing Blessings',
          de: 'Tag 1: Segen erkennen',
          fr: 'Jour 1 : Reconnaître les Bénédictions',
          ro: 'Ziua 1: Recunoașterea Binecuvântărilor',
          ru: 'День 1: Признание Благословений',
        },
        verse: 'Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu. Eclesiastes 3:1',
        reflection: {
          pt: 'Começamos nossa jornada refletindo sobre as inúmeras bênçãos em nossa vida. Pequenas ou grandes, cada uma é um presente de Deus. Tire um momento para pensar no que você é grato hoje.',
          es: 'Comenzamos nuestro viaje reflexionando sobre las innumerables bendiciones en nuestra vida. Pequeñas o grandes, cada una es un regalo de Dios. Tómate un momento para pensar en lo que estás agradecido hoy.',
          en: 'We begin our journey reflecting on the countless blessings in our lives. Small or large, each is a gift from God. Take a moment to think about what you are grateful for today.',
          de: 'Wir beginnen unsere Reise, indem wir über die unzähligen Segnungen in unserem Leben nachdenken. Klein oder groß, jeder ist ein Geschenk Gottes. Nehmen Sie sich einen Moment Zeit, um darüber nachzudenken, wofür Sie heute dankbar sind.',
          fr: 'Nous commençons notre voyage en réfléchissant aux innombrables bénédictions de notre vie. Petites ou grandes, chacune est un don de Dieu. Prenez un moment pour penser à ce pour quoi vous êtes reconnaissant aujourd’hui.',
          ro: 'Începem călătoria noastră reflectând la nenumăratele binecuvântări din viața noastră. Mici sau mari, fiecare este un dar de la Dumnezeu. Acordă un moment să te gândești pentru ce ești recunoscător astăzi.',
          ru: 'Мы начинаем наше путешествие с размышлений о бесчисленных благословениях в нашей жизни. Маленькие или большие, каждое из них — дар от Бога. Найдите минутку, чтобы подумать, за что вы благодарны сегодня.',
        },
        challenge: {
          pt: 'Desafio: Escreva 3 coisas pelas quais você é grato e agradeça a Deus por elas em oração.',
          es: 'Desafío: Escribe 3 cosas por las que estás agradecido y agradécele a Dios por ellas en oración.',
          en: 'Challenge: Write down 3 things you are grateful for and thank God for them in prayer.',
          de: 'Herausforderung: Schreiben Sie 3 Dinge auf, für die Sie dankbar sind, und danken Sie Gott dafür im Gebet.',
          fr: 'Défi : Écrivez 3 choses pour lesquelles vous êtes reconnaissant et remerciez Dieu pour elles dans la prière.',
          ro: 'Provocare: Notează 3 lucruri pentru care ești recunoscător și mulțumește-i lui Dumnezeu pentru ele în rugăciune.',
          ru: 'Задание: Запишите 3 вещи, за которые вы благодарны, и поблагодарите за них Бога в молитве.',
        },
      },
      {
        theme: {
          pt: 'Dia 2: Gratidão nas Pequenas Coisas',
          es: 'Día 2: Gratitud en las Pequeñas Cosas',
          en: 'Day 2: Gratitude in Small Things',
          de: 'Tag 2: Dankbarkeit in kleinen Dingen',
          fr: 'Jour 2 : La Gratitude dans les Petites Choses',
          ro: 'Ziua 2: Recunoștință în Lucrurile Mici',
          ru: 'День 2: Благодарность в Мелочах',
        },
        verse: 'Alegrem-se sempre no Senhor. Novamente direi: alegrem-se! Filipenses 4:4',
        reflection: {
          pt: 'A verdadeira gratidão muitas vezes se manifesta na capacidade de apreciar as pequenas coisas da vida: um raio de sol, o canto de um pássaro, um copo de água fresca. Que sua alegria venha das bênçãos diárias.',
          es: 'La verdadera gratitud a menudo se manifiesta en la capacidad de apreciar las pequeñas cosas de la vida: un rayo de sol, el canto de un pájaro, un vaso de agua fresca. Que tu alegría provenga de las bendiciones diarias.',
          en: 'True gratitude often manifests in the ability to appreciate the small things in life: a ray of sunshine, a bird’s song, a glass of fresh water. May your joy come from daily blessings.',
          de: 'Wahre Dankbarkeit zeigt sich oft in der Fähigkeit, die kleinen Dinge im Leben zu schätzen: einen Sonnenstrahl, das Lied eines Vogels, ein Glas frisches Wasser. Möge Ihre Freude aus den täglichen Segnungen kommen.',
          fr: 'La vraie gratitude se manifeste souvent par la capacité d’apprécier les petites choses de la vie : un rayon de soleil, le chant d’un oiseau, un verre d’eau fraîche. Que votre joie vienne des bénédictions quotidiennes.',
          ro: 'Adevărata recunoștință se manifestă adesea în capacitatea de a aprecia lucrurile mici din viață: o rază de soare, cântecul unei păsări, un pahar de apă proaspătă. Fie ca bucuria ta să vină din binecuvântările zilnice.',
          ru: 'Истинная благодарность часто проявляется в способности ценить мелочи жизни: луч солнца, пение птиц, стакан свежей воды. Пусть ваша радость исходит от ежедневных благословений.',
        },
        challenge: {
          pt: 'Desafio: Observe e anote 5 pequenas coisas no seu dia que te fizeram sorrir ou se sentir bem. Agradeça por elas.',
          es: 'Desafío: Observa y anota 5 pequeñas cosas en tu día que te hicieron sonreír o sentirte bien. Agradece por ellas.',
          en: 'Challenge: Observe and note 5 small things in your day that made you smile or feel good. Thank God for them.',
          de: 'Herausforderung: Beobachten und notieren Sie 5 kleine Dinge in Ihrem Tag, die Sie zum Lächeln gebracht oder sich gut gefühlt haben. Danken Sie dafür.',
          fr: 'Défi : Observez et notez 5 petites choses dans votre journée qui vous ont fait sourire ou vous sentir bien. Remerciez pour elles.',
          ro: 'Provocare: Observă și notează 5 lucruri mici din ziua ta care te-au făcut să zâmbești sau să te simți bine. Mulțumește pentru ele.',
          ru: 'Задание: Наблюдайте и запишите 5 мелочей в вашем дне, которые заставили вас улыбнуться или почувствовать себя хорошо. Поблагодарите за них.',
        },
      },
      {
        theme: {
          pt: 'Dia 3: A Graça em Tempos Difíceis',
          es: 'Día 3: La Gracia en Tiempos Difíciles',
          en: 'Day 3: Grace in Difficult Times',
          de: 'Tag 3: Gnade in schwierigen Zeiten',
          fr: 'Jour 3 : La Grâce dans les Moments Difficiles',
          ro: 'Ziua 3: Harul în Timpuri Dificile',
          ru: 'День 3: Благодать в Трудные Времена',
        },
        verse: 'Porque a minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza. 2 Coríntios 12:9',
        reflection: {
          pt: 'É fácil ser grato quando tudo vai bem. Mas a fé nos chama a encontrar a graça e aprender nas provações. Onde você pode encontrar uma lição ou um sinal da presença de Deus mesmo na dificuldade?',
          es: 'Es fácil estar agradecido cuando todo va bien. Pero la fe nos llama a encontrar la gracia y aprender en las pruebas. ¿Dónde puedes encontrar una lección o una señal de la presencia de Dios incluso en la dificultad?',
          en: 'It’s easy to be grateful when everything is going well. But faith calls us to find grace and learn in trials. Where can you find a lesson or a sign of God’s presence even in difficulty?',
          de: 'Es ist leicht, dankbar zu sein, wenn alles gut läuft. Aber der Glaube ruft uns auf, Gnade zu finden und in Prüfungen zu lernen. Wo können Sie selbst in Schwierigkeiten eine Lektion oder ein Zeichen der Gegenwart Gottes finden?',
          fr: 'Il est facile d’être reconnaissant quand tout va bien. Mais la foi nous appelle à trouver la grâce et à apprendre dans les épreuves. Où pouvez-vous trouver une leçon ou un signe de la présence de Dieu même dans la difficulté ?',
          ro: 'Este ușor să fii recunoscător când totul merge bine. Dar credința ne cheamă să găsim harul și să învățăm în încercări. Unde poți găsi o lecție sau un semn al prezenței lui Dumnezeu chiar și în dificultate?',
          ru: 'Легко быть благодарным, когда все идет хорошо. Но вера призывает нас находить благодать и учиться в испытаниях. Где вы можете найти урок или знак присутствия Бога даже в трудности?',
        },
        challenge: {
          pt: 'Desafio: Identifique uma dificuldade que você está enfrentando e peça a Deus por discernimento para ver a graça nela.',
          es: 'Desafío: Identifica una dificultad que estás enfrentando y pídele a Dios discernimiento para ver la gracia en ella.',
          en: 'Challenge: Identify a difficulty you are facing and ask God for discernment to see the grace in it.',
          de: 'Herausforderung: Identifizieren Sie eine Schwierigkeit, mit der Sie konfrontiert sind, und bitten Sie Gott um Unterscheidung, um die Gnade darin zu sehen.',
          fr: 'Défi : Identifiez une difficulté à laquelle vous êtes confronté et demandez à Dieu le discernement pour y voir la grâce.',
          ro: 'Provocare: Identifică o dificultate cu care te confrunți și cere-i lui Dumnezeu discernământ pentru a vedea harul în ea.',
          ru: 'Задание: Определите трудность, с которой вы сталкиваетесь, и попросите Бога о проницательности, чтобы увидеть в ней благодать.',
        },
      },
      {
        theme: {
          pt: 'Dia 4: Gratidão pelos Relacionamentos',
          es: 'Día 4: Gratitud por las Relaciones',
          en: 'Day 4: Gratitude for Relationships',
          de: 'Tag 4: Dankbarkeit für Beziehungen',
          fr: 'Jour 4 : Gratitude pour les Relations',
          ro: 'Ziua 4: Recunoștință pentru Relații',
          ru: 'День 4: Благодарность за Отношения',
        },
        verse: 'Acima de tudo, porém, revistam-se do amor, que é o vínculo da perfeição. Colossenses 3:14',
        reflection: {
          pt: 'Ninguém é uma ilha. Somos abençoados com família, amigos e irmãos na fé. Pense nas pessoas que Deus colocou em sua vida e como elas te enriquecem. Agradeça por cada uma delas.',
          es: 'Nadie es una isla. Somos bendecidos con familia, amigos y hermanos en la fe. Piensa en las personas que Dios ha puesto en tu vida y cómo te enriquecen. Agradécele por cada una de ellas.',
          en: 'No one is an island. We are blessed with family, friends, and brothers and sisters in faith. Think about the people God has placed in your life and how they enrich you. Thank God for each of them.',
          de: 'Niemand ist eine Insel. Wir sind mit Familie, Freunden und Brüdern und Schwestern im Glauben gesegnet. Denken Sie an die Menschen, die Gott in Ihr Leben gebracht hat und wie sie Sie bereichern. Danken Sie Gott für jeden von ihnen.',
          fr: 'Nul n’est une île. Nous sommes bénis par la famille, les amis et les frères et sœurs dans la foi. Pensez aux personnes que Dieu a placées dans votre vie et comment elles vous enrichissent. Remerciez pour chacune d’elles.',
          ro: 'Nimeni nu este o insulă. Suntem binecuvântați cu familie, prieteni și frați și surori în credință. Gândește-te la oamenii pe care Dumnezeu i-a așezat în viața ta și cum te îmbogățesc. Mulțumește-i lui Dumnezeu pentru fiecare dintre ei.',
          ru: 'Никто не остров. Мы благословлены семьей, друзьями и братьями и сестрами по вере. Подумайте о людях, которых Бог поместил в вашу жизнь, и как они обогащают вас. Поблагодарите Бога за каждого из них.',
        },
        challenge: {
          pt: 'Desafio: Envie uma mensagem de gratidão a uma pessoa importante em sua vida hoje.',
          es: 'Desafío: Envía un mensaje de gratitud a una persona importante en tu vida hoy.',
          en: 'Challenge: Send a message of gratitude to an important person in your life today.',
          de: 'Herausforderung: Senden Sie heute eine Dankesbotschaft an eine wichtige Person in Ihrem Leben.',
          fr: 'Défi : Envoyez un message de gratitude à une personne importante de votre vie aujourd’hui.',
          ro: 'Provocare: Trimite astăzi un mesaj de recunoștință unei persoane importante din viața ta.',
          ru: 'Задание: Отправьте сообщение благодарности важному человеку в вашей жизни сегодня.',
        },
      },
      {
        theme: {
          pt: 'Dia 5: Gratidão pela Provisão e Proteção',
          es: 'Día 5: Gratitud por la Provisión y Protección',
          en: 'Day 5: Gratitude for Provision and Protection',
          de: 'Tag 5: Dankbarkeit für Versorgung und Schutz',
          fr: 'Jour 5 : Gratitude pour la Providence et la Protection',
          ro: 'Ziua 5: Recunoștință pentru Providență și Protecție',
          ru: 'День 5: Благодарность за Провидение и Защиту',
        },
        verse: 'O Senhor é o meu pastor; nada me faltará. Salmos 23:1',
        reflection: {
          pt: 'Deus é fiel em nos prover e nos proteger. Olhe para trás e veja as vezes em que Ele supriu suas necessidades e te guardou do mal. Sua fidelidade é um motivo constante para a gratidão.',
          es: 'Dios es fiel en proveernos y protegernos. Mira hacia atrás y ve las veces que Él suplió tus necesidades y te guardó del mal. Su fidelidad es un motivo constante de gratitud.',
          en: 'God is faithful to provide for us and protect us. Look back and see the times He met your needs and kept you from harm. His faithfulness is a constant reason for gratitude.',
          de: 'Gott ist treu, uns zu versorgen und zu beschützen. Blicken Sie zurück und sehen Sie die Zeiten, in denen er Ihre Bedürfnisse erfüllte und Sie vor Schaden bewahrte. Seine Treue ist ein ständiger Grund zur Dankbarkeit.',
          fr: 'Dieu est fidèle à nous pourvoir et à nous protéger. Regardez en arrière et voyez les fois où Il a pourvu à vos besoins et vous a gardé du mal. Sa fidélité est une raison constante de gratitude.',
          ro: 'Dumnezeu este fidel în a ne proviziona și a ne proteja. Privește înapoi și vezi momentele în care El ți-a împlinit nevoile și te-a ferit de rău. Fidelitatea Lui este un motiv constant de recunoștință.',
          ru: 'Бог верен в обеспечении и защите нас. Вспомните, как Он удовлетворял ваши нужды и оберегал от зла. Его верность — постоянная причина для благодарности.',
        },
        challenge: {
          pt: 'Desafio: Faça uma lista de 5 momentos em que Deus te supriu ou protegeu de forma inesperada.',
          es: 'Desafío: Haz una lista de 5 momentos en que Dios te proveyó o protegió de forma inesperada.',
          en: 'Challenge: Make a list of 5 times God provided for or protected you unexpectedly.',
          de: 'Herausforderung: Erstellen Sie eine Liste mit 5 Momenten, in denen Gott Sie unerwartet versorgt oder beschützt hat.',
          fr: 'Défi : Faites une liste de 5 moments où Dieu vous a pourvu ou protégé de manière inattendue.',
          ro: 'Provocare: Fă o listă cu 5 momente în care Dumnezeu ți-a provăzut sau te-a protejat în mod neașteptat.',
          ru: 'Задание: Составьте список из 5 случаев, когда Бог неожиданно обеспечил вас или защитил.',
        },
      },
      {
        theme: {
          pt: 'Dia 6: Gratidão pelo Dom da Vida e o Propósito',
          es: 'Día 6: Gratitud por el Don de la Vida y el Propósito',
          en: 'Day 6: Gratitude for the Gift of Life and Purpose',
          de: 'Tag 6: Dankbarkeit für das Geschenk des Lebens und des Sinns',
          fr: 'Jour 6 : Gratitude pour le Don de la Vie et le But',
          ro: 'Ziua 6: Recunoștință pentru Darul Vieții și Scop',
          ru: 'День 6: Благодарность за Дар Жизни и Цели',
        },
        verse: 'Eu vim para que tenham vida, e a tenham em abundância. João 10:10b',
        reflection: {
          pt: 'Sua vida é um presente de Deus, com um propósito único. Reflita sobre seus talentos, suas paixões e como você pode usá-los para a glória Dele. Sua existência é uma razão para a gratidão abundante.',
          es: 'Tu vida es un regalo de Dios, con un propósito único. Reflexiona sobre tus talentos, tus pasiones y cómo puedes usarlos para Su gloria. Tu existencia es una razón para la gratitud abundante.',
          en: 'Your life is a gift from God, with a unique purpose. Reflect on your talents, your passions, and how you can use them for His glory. Your existence is a reason for abundant gratitude.',
          de: 'Ihr Leben ist ein Geschenk Gottes mit einem einzigartigen Zweck. Denken Sie über Ihre Talente und Leidenschaften nach und wie Sie sie zu seiner Ehre einsetzen können. Ihre Existenz ist ein Grund für überfließende Dankbarkeit.',
          fr: 'Votre vie est un don de Dieu, avec un but unique. Réfléchissez à vos talents, vos passions et comment vous pouvez les utiliser pour Sa gloire. Votre existence est une raison de gratitude abondante.',
          ro: 'Viața ta este un dar de la Dumnezeu, cu un scop unic. Reflectă asupra talentelor tale, a pasiunilor tale și cum le poți folosi spre slava Lui. Existența ta este un motiv de recunoștință abundentă.',
          ru: 'Ваша жизнь — это дар от Бога с уникальной целью. Подумайте о своих талантах, своих страстях и о том, как вы можете использовать их во славу Его. Ваше существование — причина для обильной благодарности.',
        },
        challenge: {
          pt: 'Desafio: Dedique um tempo para orar sobre seu propósito e como você pode servir a Deus com seus dons.',
          es: 'Desafío: Dedica un tiempo para orar sobre tu propósito y cómo puedes servir a Dios con tus dones.',
          en: 'Challenge: Dedicate time to pray about your purpose and how you can serve God with your gifts.',
          de: 'Herausforderung: Nehmen Sie sich Zeit, um über Ihren Zweck zu beten und wie Sie Gott mit Ihren Gaben dienen können.',
          fr: 'Défi : Consacrez du temps à prier sur votre but et comment vous pouvez servir Dieu avec vos dons.',
          ro: 'Provocare: Dedică timp rugăciunii pentru scopul tău și cum poți sluji lui Dumnezeu cu darurile tale.',
          ru: 'Задание: Посвятите время молитве о вашей цели и о том, как вы можете служить Богу своими дарами.',
        },
      },
      {
        theme: {
          pt: 'Dia 7: Um Coração Transformado e Sempre Grato',
          es: 'Día 7: Un Corazón Transformado y Siempre Agradecido',
          en: 'Day 7: A Transformed and Always Grateful Heart',
          de: 'Tag 7: Ein verwandeltes und stets dankbares Herz',
          fr: 'Jour 7 : Un Cœur Transformé et Toujours Reconnaissant',
          ro: 'Ziua 7: O Inimă Transformată și Mereu Recunoscătoare',
          ru: 'День 7: Преображенное и Всегда Благодарное Сердце',
        },
        verse: 'Portanto, se alguém está em Cristo, nova criatura é; as coisas velhas já passaram, eis que tudo se fez novo. 2 Coríntios 5:17',
        reflection: {
          pt: 'Ao final desta jornada, esperamos que seu coração esteja mais sensível à voz de Deus e mais transbordante de gratidão. Que a gratidão seja um estilo de vida, não apenas um sentimento passageiro.',
          es: 'Al final de este viaje, esperamos que tu corazón esté más sensible a la voz de Dios y más desbordante de gratitud. Que la gratitud sea un estilo de vida, no solo un sentimiento pasajero.',
          en: 'At the end of this journey, we hope your heart is more sensitive to God’s voice and more overflowing with gratitude. May gratitude be a lifestyle, not just a fleeting feeling.',
          de: 'Am Ende dieser Reise hoffen wir, dass Ihr Herz empfänglicher für Gottes Stimme und dankbarer ist. Möge Dankbarkeit ein Lebensstil sein, nicht nur ein flüchtiges Gefühl.',
          fr: 'À la fin de ce voyage, nous espérons que votre cœur sera plus sensible à la voix de Dieu et plus débordant de gratitude. Que la gratitude soit un mode de vie, et pas seulement un sentiment passager.',
          ro: 'La sfârșitul acestei călătorii, sperăm ca inima ta să fie mai sensibilă la vocea lui Dumnezeu și mai plină de recunoștință. Fie ca recunoștința să fie un stil de viață, nu doar o emoție trecătoare.',
          ru: 'В конце этого путешествия мы надеемся, что ваше сердце станет более чутким к голосу Бога и более переполненным благодарностью. Пусть благодарность станет образом жизни, а не просто мимолетным чувством.',
        },
        challenge: {
          pt: 'Desafio: Continue praticando a gratidão diariamente e compartilhe sua experiência com alguém.',
          es: 'Desafío: Continúa practicando la gratitud diariamente y comparte tu experiencia con alguien.',
          en: 'Challenge: Continue practicing gratitude daily and share your experience with someone.',
          de: 'Herausforderung: Üben Sie weiterhin täglich Dankbarkeit und teilen Sie Ihre Erfahrungen mit jemandem.',
          fr: 'Défi : Continuez à pratiquer la gratitude quotidiennement et partagez votre expérience avec quelqu’un.',
          ro: 'Provocare: Continuă să practici recunoștința zilnic și împărtășește-ți experiența cu cineva.',
          ru: 'Задание: Продолжайте ежедневно практиковать благодарность и поделитесь своим опытом с кем-нибудь.',
        },
      },
    ],
  },
};

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function FaithJourneys() {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState({});
  const [responseText, setResponseText] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myResponses, setMyResponses] = useState({});
  const [publicResponses, setPublicResponses] = useState([]);
  const journeyId = 'gratidao-e-oracao';

  // Load my responses
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/journeys/my?journeyId=${journeyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        const map = {};
        data.forEach(r => { map[r.day_index] = r; });
        setMyResponses(map);
      }
    }).catch(() => {});
  }, [token]);

  // Load public responses for current day
  useEffect(() => {
    fetch(`${API}/journeys/public?journeyId=${journeyId}&dayIndex=${currentDay}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPublicResponses(data); })
      .catch(() => setPublicResponses([]));
  }, [currentDay]);

  const handleSaveResponse = async () => {
    if (!token) return alert('Faça login para responder!');
    if (!responseText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/journeys/respond`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ journeyId, dayIndex: currentDay, responseText: responseText.trim(), isPublic }),
      });
      if (res.ok) {
        setMyResponses(prev => ({ ...prev, [currentDay]: { response_text: responseText.trim(), is_public: isPublic } }));
        setResponseText('');
        // Refresh public
        if (isPublic) {
          fetch(`${API}/journeys/public?journeyId=${journeyId}&dayIndex=${currentDay}`)
            .then(r => r.json()).then(data => { if (Array.isArray(data)) setPublicResponses(data); });
        }
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const journey = journeysData[journeyId];
  if (!journey) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>{t('common.loading', 'Carregando jornada...')}</div>;
  }

  const handleCompleteDay = (dayIndex) => {
    setCompletedDays(prev => ({
      ...prev,
      [journeyId]: {
        ...(prev[journeyId] || {}),
        [`day${dayIndex}`]: true,
      },
    }));
    // Optionally move to next day automatically
    if (currentDay < journey.days.length) {
      setCurrentDay(prev => prev + 1);
    }
  };

  const getTranslatedText = (obj) => {
    return obj[i18n.language] || obj.pt; // Fallback to Portuguese
  };

  const currentDayData = journey.days[currentDay - 1];
  const isDayCompleted = completedDays[journeyId]?.[`day${currentDay}`];
  const totalCompletedDays = Object.values(completedDays[journeyId] || {}).filter(Boolean).length;

  return (
    <div style={{
      maxWidth: 700, margin: '2rem auto', padding: '1.5rem',
      background: 'linear-gradient(135deg, #f0f4f8, #e6e9ef)', borderRadius: 20,
      boxShadow: '0 8px 30px rgba(0,0,0,0.1)', fontFamily: 'system-ui',
    }}>
      <h1 style={{
        fontSize: '1.8rem', color: '#1a0a3e', textAlign: 'center', marginBottom: '1rem',
      }}>
        ✨ {getTranslatedText(journey.title)}
      </h1>
      <p style={{
        fontSize: '0.95rem', color: '#555', textAlign: 'center', marginBottom: '2rem',
        maxWidth: 500, margin: '0 auto 2rem', lineHeight: 1.6,
      }}>
        {getTranslatedText(journey.description)}
      </p>

      {/* Progress Indicator */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '2rem', padding: '0.8rem 1rem', background: '#fff',
        borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}>
        <span style={{ fontSize: '0.9rem', color: '#444', fontWeight: 600 }}>
          Progresso: {totalCompletedDays} de {journey.days.length} dias
        </span>
        <div style={{
          height: 8, background: '#e0e0e0', borderRadius: 4, flexGrow: 1, margin: '0 1rem',
        }}>
          <div style={{
            width: `${(totalCompletedDays / journey.days.length) * 100}%`,
            height: '100%', background: 'linear-gradient(90deg, #daa520, #f4c542)',
            borderRadius: 4, transition: 'width 0.5s ease-in-out',
          }} />
        </div>
        <span style={{ fontSize: '1.2rem' }}>
          {totalCompletedDays === journey.days.length ? '✅' : '⏳'}
        </span>
      </div>

      {/* Current Day Content */}
      {currentDayData && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{
            fontSize: '1.5rem', color: '#7c5cbf', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7c5cbf, #5b8def)',
              color: '#fff', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{currentDay}</span>
            {getTranslatedText(currentDayData.theme)}
          </h2>
          <p style={{
            fontSize: '0.9rem', color: '#666', marginBottom: '1.2rem', fontStyle: 'italic',
          }}>
            "{currentDayData.verse}"
          </p>
          <p style={{
            fontSize: '1rem', color: '#333', marginBottom: '1.5rem', lineHeight: 1.7,
          }}>
            {getTranslatedText(currentDayData.reflection)}
          </p>
          <div style={{
            background: 'linear-gradient(135deg, rgba(218,165,32,0.1), rgba(244,197,66,0.1))',
            border: '1px solid rgba(218,165,32,0.3)', borderRadius: 10, padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <h3 style={{ fontSize: '1.1rem', color: '#daa520', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              💡 Desafio do Dia:
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: 1.6 }}>
              {getTranslatedText(currentDayData.challenge)}
            </p>
          </div>

          {/* ===== RESPONSE AREA ===== */}
          <div style={{
            background: '#fff', border: '1px solid #e0e0e0', borderRadius: 14,
            padding: '1rem', marginBottom: '1.5rem',
          }}>
            <h3 style={{ fontSize: '0.95rem', color: '#1a0a3e', margin: '0 0 0.6rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              ✍️ Sua Resposta ao Desafio:
            </h3>

            {myResponses[currentDay] ? (
              <div style={{
                background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.3)',
                borderRadius: 10, padding: '0.8rem',
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', whiteSpace: 'pre-wrap' }}>
                  {myResponses[currentDay].response_text}
                </p>
                <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {myResponses[currentDay].is_public ? <><Globe size={12} /> Público</> : <><Lock size={12} /> Privado</>}
                  {' — '}✅ Resposta salva!
                </div>
              </div>
            ) : (
              <>
                <textarea
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Escreva aqui sua resposta ao desafio do dia..."
                  rows={3}
                  style={{
                    width: '100%', padding: '0.7rem', borderRadius: 10,
                    border: '1px solid #ddd', fontSize: '0.88rem', resize: 'vertical',
                    boxSizing: 'border-box', marginBottom: '0.5rem',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  {/* Public/Private toggle */}
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '0.5rem 0.8rem', borderRadius: 20,
                      border: isPublic ? '2px solid #27ae60' : '2px solid #999',
                      background: isPublic ? 'rgba(46,204,113,0.1)' : '#f5f5f5',
                      color: isPublic ? '#27ae60' : '#666',
                      fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                    }}
                  >
                    {isPublic ? <><Globe size={14} /> Público — todos veem</> : <><Lock size={14} /> Privado — só você vê</>}
                  </button>
                  {/* Save button */}
                  <button
                    onClick={handleSaveResponse}
                    disabled={saving || !responseText.trim()}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: 20, border: 'none',
                      background: 'linear-gradient(135deg, #daa520, #f4c542)',
                      color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                      opacity: saving || !responseText.trim() ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    <Send size={14} /> {saving ? 'Salvando...' : 'Enviar'}
                  </button>
                </div>
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.72rem', color: '#999' }}>
                  💡 Escolha "Público" para inspirar outros na comunidade, ou "Privado" para manter só para você.
                </p>
              </>
            )}
          </div>

          {/* ===== PUBLIC RESPONSES ===== */}
          {publicResponses.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#1a0a3e', margin: '0 0 0.6rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                🌍 Respostas da Comunidade ({publicResponses.length}):
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {publicResponses.map((r, idx) => (
                  <div key={idx} style={{
                    background: '#fafafa', borderRadius: 10, padding: '0.7rem',
                    border: '1px solid #eee',
                  }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#333', whiteSpace: 'pre-wrap' }}>
                      {r.response_text}
                    </p>
                    <div style={{ marginTop: 4, fontSize: '0.7rem', color: '#aaa' }}>
                      — {r.user_name || 'Anônimo'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => setCurrentDay(prev => Math.max(1, prev - 1))}
              disabled={currentDay === 1}
              style={{
                padding: '0.6rem 1.2rem', borderRadius: 20, border: 'none',
                background: currentDay === 1 ? '#e0e0e0' : 'linear-gradient(135deg, #7c5cbf, #5b8def)',
                color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                opacity: currentDay === 1 ? 0.6 : 1, transition: 'opacity 0.2s',
              }}
            >
              ← Dia Anterior
            </button>

            {isDayCompleted ? (
              <span style={{ color: '#27ae60', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                ✅ Dia Concluído!
              </span>
            ) : (
              <button
                onClick={() => handleCompleteDay(currentDay)}
                style={{
                  padding: '0.7rem 1.5rem', borderRadius: 25, border: 'none',
                  background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(46,204,113,0.3)',
                }}
              >
                Concluir Dia <CheckCircle size={18} style={{ marginLeft: 5 }} />
              </button>
            )}

            <button
              onClick={() => setCurrentDay(prev => Math.min(journey.days.length, prev + 1))}
              disabled={currentDay === journey.days.length}
              style={{
                padding: '0.6rem 1.2rem', borderRadius: 20, border: 'none',
                background: currentDay === journey.days.length ? '#e0e0e0' : 'linear-gradient(135deg, #7c5cbf, #5b8def)',
                color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                opacity: currentDay === journey.days.length ? 0.6 : 1, transition: 'opacity 0.2s',
              }}
            >
              Próximo Dia →
            </button>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {totalCompletedDays === journey.days.length && (
        <div style={{
          textAlign: 'center', background: '#e8f5e9', border: '1px solid #c8e6c9',
          borderRadius: 16, padding: '1.5rem', marginTop: '2rem',
          color: '#2e7d32', fontWeight: 600, fontSize: '1.1rem',
        }}>
          Parabéns! Você completou a jornada "Jornada de Gratidão e Oração"! 🎉
          <p style={{ fontSize: '0.9rem', color: '#4CAF50', marginTop: '0.5rem' }}>
            Continue crescendo na fé e compartilhando sua gratidão.
          </p>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/" style={{
          color: '#7c5cbf', textDecoration: 'none', fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          Voltar para a Home <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
