import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useTranslation } from 'react-i18next';
import './DueloBiblico.css';
import './DueloBiblicoOverrides.css';

const TOTAL_QUESTIONS = 10;
const DUEL_TIMER_SECONDS = 15;
const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
];

const DUEL_COPY = {
  pt: { subtitle:'Encontre um irmão e comece uma partida justa.', language:'Escolhe o teu idioma', online:'Jogadores online', inRoom:'na sala agora', empty:'Ainda não há outro jogador. Usa a procura automática para começar.', invite:'Convide alguém ou entre na procura automática.', welcome:'Bem-vindo ao Desafio', ready:'PRONTO PARA UMA NOVA CONQUISTA?', title:'Mostra o que sabes da Bíblia', intro:'Entra numa partida ao vivo e responde 10 perguntas para ganhar pontos, medalhas e diamantes.', search:'Procura automática', bot:'Jogar com o Bot Bíblico', botHelp:'Escolha uma pessoa real ou desafie o Bot Bíblico, um adversário experiente.', chat:'Chat da sala', chatInfo:'Conversa com os jogadores', chatEmpty:'Escreve uma mensagem de boas-vindas para a sala.', write:'Escreve uma mensagem…', ranking:'Top 10 do ranking', rankingInfo:'Os jogadores com mais pontos no Duelo Bíblico.', rankingEmpty:'Jogue uma partida para começar o ranking.', victories:'Vitórias', diamonds:'Diamantes', streak:'Sequência', day:'dia', question:'Pergunta', points:'pontos', available:'Disponível', playing:'Em jogo', searching:'A procurar', challenge:'Desafiar', cancel:'Cancelar procura', waiting:'À PROCURA DE ADVERSÁRIO', waitingTitle:'Estamos a encontrar alguém', waitingText:'Podes ficar nesta sala. Assim que outro jogador entrar, a partida começa automaticamente.', preparing:'A preparar o desafio', preparingText:'As perguntas estão a chegar. Aguarda um instante.', next:'Próxima pergunta', finished:'PARTIDA CONCLUÍDA', again:'Jogar novamente', login:'Entre na sua conta para jogar.', connecting:'A ligação está a preparar-se. Aguarde alguns segundos e tente novamente.', botError:'Não foi possível iniciar o Bot Bíblico. Tente novamente.' },
  es: { subtitle:'Encuentra a un hermano y comienza una partida justa.', language:'Elige tu idioma', online:'Jugadores en línea', inRoom:'en la sala ahora', empty:'Aún no hay otro jugador. Usa la búsqueda automática para comenzar.', invite:'Invita a alguien o entra en la búsqueda automática.', welcome:'Bienvenido al Desafío', ready:'¿LISTO PARA UNA NUEVA CONQUISTA?', title:'Demuestra lo que sabes de la Biblia', intro:'Entra en una partida en vivo y responde 10 preguntas para ganar puntos, medallas y diamantes.', search:'Búsqueda automática', bot:'Jugar con el Bot Bíblico', botHelp:'Elige una persona real o desafía al Bot Bíblico, un rival experimentado.', chat:'Chat de la sala', chatInfo:'Habla con los jugadores', chatEmpty:'Escribe un mensaje de bienvenida para la sala.', write:'Escribe un mensaje…', ranking:'Top 10 de la clasificación', rankingInfo:'Los jugadores con más puntos del Duelo Bíblico.', rankingEmpty:'Juega una partida para iniciar la clasificación.', victories:'Victorias', diamonds:'Diamantes', streak:'Racha', day:'día', question:'Pregunta', points:'puntos', available:'Disponible', playing:'En partida', searching:'Buscando', challenge:'Desafiar', cancel:'Cancelar búsqueda', waiting:'BUSCANDO RIVAL', waitingTitle:'Estamos encontrando a alguien', waitingText:'Puedes quedarte en esta sala. La partida comienza cuando entre otra persona.', preparing:'Preparando el desafío', preparingText:'Las preguntas están llegando. Espera un momento.', next:'Siguiente pregunta', finished:'PARTIDA TERMINADA', again:'Jugar de nuevo', login:'Inicia sesión para jugar.', connecting:'La conexión se está preparando. Espera unos segundos e inténtalo de nuevo.', botError:'No fue posible iniciar el Bot Bíblico. Inténtalo de nuevo.' },
  en: { subtitle:'Find a fellow believer and start a fair match.', language:'Choose your language', online:'Players online', inRoom:'in the room now', empty:'There is no other player yet. Use automatic search to begin.', invite:'Invite someone or use automatic search.', welcome:'Welcome to the Challenge', ready:'READY FOR A NEW ACHIEVEMENT?', title:'Show what you know about the Bible', intro:'Join a live match and answer 10 questions to earn points, medals and diamonds.', search:'Automatic search', bot:'Play with the Bible Bot', botHelp:'Choose a real person or challenge the experienced Bible Bot.', chat:'Room chat', chatInfo:'Talk with the players', chatEmpty:'Write a welcome message to the room.', write:'Write a message…', ranking:'Top 10 ranking', rankingInfo:'Players with the most points in Bible Duel.', rankingEmpty:'Play a match to start the ranking.', victories:'Victories', diamonds:'Diamonds', streak:'Streak', day:'day', question:'Question', points:'points', available:'Available', playing:'Playing', searching:'Searching', challenge:'Challenge', cancel:'Cancel search', waiting:'LOOKING FOR A RIVAL', waitingTitle:'We are finding someone', waitingText:'You can stay in this room. The match starts as soon as another person joins.', preparing:'Preparing the challenge', preparingText:'Questions are on the way. Please wait a moment.', next:'Next question', finished:'MATCH FINISHED', again:'Play again', login:'Sign in to play.', connecting:'The connection is preparing. Wait a few seconds and try again.', botError:'Could not start the Bible Bot. Try again.' },
  fr: { subtitle:'Trouve un frère et commence une partie équitable.', language:'Choisis ta langue', online:'Joueurs en ligne', inRoom:'dans la salle maintenant', empty:'Il n’y a pas encore d’autre joueur. Utilise la recherche automatique.', invite:'Invite quelqu’un ou utilise la recherche automatique.', welcome:'Bienvenue au Défi', ready:'PRÊT POUR UNE NOUVELLE VICTOIRE ?', title:'Montre ce que tu sais de la Bible', intro:'Entre dans une partie en direct et réponds à 10 questions.', search:'Recherche automatique', bot:'Jouer avec le Bot Biblique', botHelp:'Choisis une vraie personne ou défie le Bot Biblique.', chat:'Chat de la salle', chatInfo:'Discute avec les joueurs', chatEmpty:'Écris un message de bienvenue.', write:'Écris un message…', ranking:'Top 10 du classement', rankingInfo:'Les joueurs avec le plus de points.', rankingEmpty:'Joue une partie pour commencer.', victories:'Victoires', diamonds:'Diamants', streak:'Série', day:'jour', question:'Question', points:'points', available:'Disponible', playing:'En partie', searching:'Recherche', challenge:'Défier', cancel:'Annuler', waiting:'RECHERCHE D’UN ADVERSAIRE', waitingTitle:'Nous cherchons quelqu’un', waitingText:'La partie commence quand une personne rejoint la salle.', preparing:'Préparation du défi', preparingText:'Les questions arrivent. Patiente un instant.', next:'Question suivante', finished:'PARTIE TERMINÉE', again:'Rejouer', login:'Connecte-toi pour jouer.', connecting:'La connexion se prépare. Réessaie dans quelques secondes.', botError:'Impossible de démarrer le Bot Biblique.' },
  de: { subtitle:'Finde einen Glaubensbruder und beginne ein faires Spiel.', language:'Wähle deine Sprache', online:'Spieler online', inRoom:'jetzt im Raum', empty:'Noch ist kein anderer Spieler da. Nutze die automatische Suche.', invite:'Lade jemanden ein oder nutze die automatische Suche.', welcome:'Willkommen zur Herausforderung', ready:'BEREIT FÜR EINEN NEUEN ERFOLG?', title:'Zeige dein Bibelwissen', intro:'Nimm an einem Live-Spiel teil und beantworte 10 Fragen.', search:'Automatische Suche', bot:'Mit dem Bibel-Bot spielen', botHelp:'Wähle eine echte Person oder fordere den Bibel-Bot heraus.', chat:'Raum-Chat', chatInfo:'Sprich mit den Spielern', chatEmpty:'Schreibe eine Willkommensnachricht.', write:'Nachricht schreiben…', ranking:'Top 10 Rangliste', rankingInfo:'Spieler mit den meisten Punkten.', rankingEmpty:'Spiele eine Partie, um die Rangliste zu starten.', victories:'Siege', diamonds:'Diamanten', streak:'Serie', day:'Tag', question:'Frage', points:'Punkte', available:'Verfügbar', playing:'Im Spiel', searching:'Suche läuft', challenge:'Fordern', cancel:'Suche abbrechen', waiting:'GEGNER WIRD GESUCHT', waitingTitle:'Wir suchen jemanden', waitingText:'Das Spiel beginnt, sobald jemand den Raum betritt.', preparing:'Herausforderung wird vorbereitet', preparingText:'Die Fragen kommen gleich.', next:'Nächste Frage', finished:'PARTIE BEENDET', again:'Noch einmal spielen', login:'Melde dich zum Spielen an.', connecting:'Die Verbindung wird vorbereitet. Bitte erneut versuchen.', botError:'Der Bibel-Bot konnte nicht gestartet werden.' },
  it: { subtitle:'Trova un fratello e inizia una partita corretta.', language:'Scegli la tua lingua', online:'Giocatori online', inRoom:'nella sala ora', empty:'Non c’è ancora un altro giocatore. Usa la ricerca automatica.', invite:'Invita qualcuno o usa la ricerca automatica.', welcome:'Benvenuto alla Sfida', ready:'PRONTO PER UNA NUOVA CONQUISTA?', title:'Mostra ciò che sai della Bibbia', intro:'Entra in una partita dal vivo e rispondi a 10 domande.', search:'Ricerca automatica', bot:'Gioca con il Bot Biblico', botHelp:'Scegli una persona reale o sfida il Bot Biblico.', chat:'Chat della sala', chatInfo:'Parla con i giocatori', chatEmpty:'Scrivi un messaggio di benvenuto.', write:'Scrivi un messaggio…', ranking:'Top 10 classifica', rankingInfo:'I giocatori con più punti.', rankingEmpty:'Gioca una partita per iniziare.', victories:'Vittorie', diamonds:'Diamanti', streak:'Serie', day:'giorno', question:'Domanda', points:'punti', available:'Disponibile', playing:'In partita', searching:'Ricerca', challenge:'Sfida', cancel:'Annulla ricerca', waiting:'CERCA AVVERSARIO', waitingTitle:'Stiamo cercando qualcuno', waitingText:'La partita inizia quando entra un’altra persona.', preparing:'Preparazione della sfida', preparingText:'Le domande stanno arrivando.', next:'Prossima domanda', finished:'PARTITA FINITA', again:'Gioca di nuovo', login:'Accedi per giocare.', connecting:'La connessione si sta preparando.', botError:'Impossibile avviare il Bot Biblico.' },
  ro: { subtitle:'Găsește un frate și începe o partidă corectă.', language:'Alege limba', online:'Jucători online', inRoom:'în sală acum', empty:'Încă nu este alt jucător. Folosește căutarea automată.', invite:'Invită pe cineva sau folosește căutarea automată.', welcome:'Bun venit la Provocare', ready:'GATA PENTRU O NOUĂ REUȘITĂ?', title:'Arată ce știi din Biblie', intro:'Intră într-o partidă live și răspunde la 10 întrebări.', search:'Căutare automată', bot:'Joacă cu Botul Biblic', botHelp:'Alege o persoană reală sau provoacă Botul Biblic.', chat:'Chatul sălii', chatInfo:'Vorbește cu jucătorii', chatEmpty:'Scrie un mesaj de bun venit.', write:'Scrie un mesaj…', ranking:'Top 10 clasament', rankingInfo:'Jucătorii cu cele mai multe puncte.', rankingEmpty:'Joacă o partidă pentru a începe clasamentul.', victories:'Victorii', diamonds:'Diamante', streak:'Serie', day:'zi', question:'Întrebare', points:'puncte', available:'Disponibil', playing:'În joc', searching:'Caută', challenge:'Provoacă', cancel:'Anulează căutarea', waiting:'CAUTARE ADVERSAR', waitingTitle:'Căutăm pe cineva', waitingText:'Partida începe când intră o altă persoană.', preparing:'Pregătirea provocării', preparingText:'Întrebările sosesc.', next:'Următoarea întrebare', finished:'PARTIDĂ ÎNCHEIATĂ', again:'Joacă din nou', login:'Autentifică-te pentru a juca.', connecting:'Conexiunea se pregătește.', botError:'Botul Biblic nu a putut porni.' }
};
function questionForLanguage(question, lang) {
  if (!question) return null;
  return {
    ...question,
    q: question[`${lang}_q`] || question.q,
    opts: question[`${lang}_opts`] || question.opts || [],
  };
}

function playGameSound(file) {
  const sound = new Audio(`/duelo-biblico/${file}`);
  sound.volume = 0.45;
  sound.play().catch(() => {});
}

export default function DueloBiblico() {
  const { user } = useAuth();
  const { send, on, off, isConnected } = useWebSocket();
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'pt').slice(0, 2);
  const [gameLanguage, setGameLanguage] = useState(lang);
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState(DUEL_COPY[lang]?.subtitle || DUEL_COPY.pt.subtitle);
  const [roomId, setRoomId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [opponent, setOpponent] = useState(null);
  const [players, setPlayers] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatNotice, setChatNotice] = useState('');
  const [invite, setInvite] = useState(null);
  const [timeLeft, setTimeLeft] = useState(DUEL_TIMER_SECONDS);
  const [ranking, setRanking] = useState([]);
  const copy = DUEL_COPY[gameLanguage] || DUEL_COPY.pt;

  const currentQuestion = useMemo(
    () => questionForLanguage(questions[questionIndex], gameLanguage),
    [questions, questionIndex, gameLanguage],
  );

  useEffect(() => { setGameLanguage(lang); if (status === 'ready') setMessage((DUEL_COPY[lang] || DUEL_COPY.pt).subtitle); }, [lang]);

  useEffect(() => {
    const queued = () => { setStatus('waiting'); setMessage(copy.waitingTitle); };
    const matched = (data) => {
      setRoomId(data.roomId);
      setQuestions(data.perguntas || []);
      setOpponent(data.adversario || null);
      setQuestionIndex(0);
      setAnswer(null);
      setPlayers([]);
      setTimeLeft(DUEL_TIMER_SECONDS);
      setStatus('playing');
      setMessage(copy.preparingText);
      playGameSound('match-found-sound.mp3');
    };
    const score = (data) => setPlayers(data.jogadores || []);
    const next = (data) => {
      setQuestionIndex(data.idx || 0);
      setAnswer(null);
      setTimeLeft(DUEL_TIMER_SECONDS);
      setMessage(copy.next);
    };
    const finished = (data) => {
      setPlayers(data.jogadores || []);
      setResult(data.vencedor || null);
      setStatus('finished');
      setMessage('Partida terminada. Deus abençoe os dois jogadores!');
    };
    const error = (data) => { setStatus('ready'); setMessage(data.message || 'Não foi possível iniciar a partida. Tente novamente.'); };
    const timer = (data) => setTimeLeft(Math.max(0, Number(data.seconds) || 0));

    on('game_queued', queued);
    on('game_matched', matched);
    on('game_score', score);
    on('game_next_question', next);
    on('game_finished', finished);
    on('game_error', error);
    on('game_timer', timer);
    return () => {
      off('game_queued', queued);
      off('game_matched', matched);
      off('game_score', score);
      off('game_next_question', next);
      off('game_finished', finished);
      off('game_error', error);
      off('game_timer', timer);
    };
  }, [off, on]);

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL || '';
    fetch(`${api}/api/duelo/ranking`)
      .then(response => response.ok ? response.json() : { ranking: [] })
      .then(data => setRanking(Array.isArray(data.ranking) ? data.ranking.slice(0, 10) : []))
      .catch(() => setRanking([]));
  }, [status]);

  useEffect(() => {
    if (!isConnected || !user?.id) return undefined;
    const player = {
      type: 'game_lobby_join',
      userId: user.id,
      userName: user.full_name || user.name || 'Jogador',
      avatar: user.profile_photo || user.avatar_url || user.photo_url || '',
    };
    send(player);
    return () => send({ type: 'game_lobby_leave', userId: user.id });
  }, [isConnected, send, user]);

  useEffect(() => {
    const updatePlayers = (data) => setLobbyPlayers(data.players || []);
    const receiveChat = (data) => {
      const incoming = data.message;
      if (!incoming) return;
      setChatMessages(current => {
        const pendingIndex = current.findIndex(item => item.pending && item.userId === incoming.userId && item.text === incoming.text);
        if (pendingIndex >= 0) {
          const next = [...current];
          next[pendingIndex] = incoming;
          return next;
        }
        if (current.some(item => item.id === incoming.id)) return current;
        return [...current.slice(-49), incoming];
      });
      if (incoming.userId === user?.id) setChatNotice('Mensagem enviada.');
    };
    const receiveInvite = (data) => setInvite(data.from || null);
    const inviteSent = () => setMessage('Convite enviado. Aguarde a resposta do jogador.');
    const inviteDeclined = (data) => setMessage(`${data.userName || 'O jogador'} não pôde aceitar agora.`);
    on('game_lobby_players', updatePlayers);
    on('game_lobby_chat', receiveChat);
    on('game_invite_received', receiveInvite);
    on('game_invite_sent', inviteSent);
    on('game_invite_declined', inviteDeclined);
    return () => {
      off('game_lobby_players', updatePlayers);
      off('game_lobby_chat', receiveChat);
      off('game_invite_received', receiveInvite);
      off('game_invite_sent', inviteSent);
      off('game_invite_declined', inviteDeclined);
    };
  }, [off, on, user?.id]);

  const startMatch = () => {
    if (!user?.id) { setMessage('Entre na sua conta para jogar.'); return; }
    if (!isConnected) { setMessage('A ligação está a preparar-se. Aguarde alguns segundos e tente novamente.'); return; }
    setResult(null);
    const sent = send({
      type: 'game_queue',
      userId: user.id,
      userName: user.full_name || user.name || 'Jogador',
      avatar: user.profile_photo || user.avatar_url || user.photo_url || '',
      livro: 'Todos',
      nivel: 0,
    });
    if (!sent) setMessage('Não foi possível ligar ao Duelo. Tente novamente.');
  };

  const startBotMatch = () => {
    if (!user?.id) { setMessage('Entre na sua conta para jogar.'); return; }
    if (!isConnected) { setMessage('A ligação está a preparar-se. Aguarde alguns segundos e tente novamente.'); return; }
    setResult(null);
    const sent = send({
      type: 'game_bot_match',
      userId: user.id,
      userName: user.full_name || user.name || 'Jogador',
      avatar: user.profile_photo || user.avatar_url || user.photo_url || '',
    });
    if (!sent) setMessage('Não foi possível iniciar o Bot Bíblico. Tente novamente.');
  };
  const chooseAnswer = (choice) => {
    if (answer !== null || !currentQuestion || !roomId) return;
    const correct = choice === currentQuestion.r;
    setAnswer(choice);
    if (correct) playGameSound('correct-sound.mp3');
    setMessage(correct ? 'Resposta certa! A aguardar o outro jogador…' : 'Resposta registada. A aguardar o outro jogador…');
    send({ type: 'game_answer', roomId, choice, pontos: correct ? 3 : 0 });
  };

  const leaveQueue = () => {
    if (user?.id) send({ type: 'game_cancel_queue', userId: user.id });
    setStatus('ready');
    setMessage('Pode procurar uma nova partida quando quiser.');
  };

  const invitePlayer = (player) => {
    if (!user?.id || player.status === 'playing') return;
    send({ type: 'game_invite', userId: user.id, targetUserId: player.userId });
  };

  const answerInvite = (accepted) => {
    if (!invite || !user?.id) return;
    send({ type: accepted ? 'game_invite_accept' : 'game_invite_decline', userId: user.id, fromUserId: invite.userId });
    setInvite(null);
    if (accepted) setMessage('A preparar a partida…');
  };

  const sendLobbyMessage = (event) => {
    event.preventDefault();
    const text = chatText.trim();
    if (!text || !user?.id) return;
    if (!isConnected) {
      setChatNotice('O chat está a ligar. Aguarde alguns segundos e tente novamente.');
      return;
    }
    const sentAt = Date.now();
    const pendingMessage = { id: `pending-${sentAt}`, userId: user.id, userName: user.full_name || user.name || 'Jogador', text, pending: true };
    setChatMessages(current => [...current.slice(-49), pendingMessage]);
    setChatNotice('A enviar mensagem…');
    // Reconfirma a presença na sala antes de enviar, inclusive após uma reconexão.
    send({ type: 'game_lobby_join', userId: user.id, userName: user.full_name || user.name || 'Jogador', avatar: user.profile_photo || user.avatar_url || user.photo_url || '' });
    const didSend = send({ type: 'game_lobby_chat', userId: user.id, text });
    if (!didSend) {
      setChatMessages(current => current.filter(item => item.id !== pendingMessage.id));
      setChatNotice('Não foi possível enviar. Tente novamente.');
      return;
    }
    setChatText('');
    window.setTimeout(() => {
      setChatMessages(current => current.map(item => item.id === pendingMessage.id && item.pending ? { ...item, failed: true, pending: false } : item));
      setChatNotice(current => current === 'A enviar mensagem…' ? 'A mensagem não foi confirmada. Tente novamente.' : current);
    }, 6000);
  };

  const playerName = user?.full_name || user?.name || 'Jogador';
  const playerAvatar = user?.profile_photo || user?.avatar_url || user?.photo_url || '';
  const visiblePlayers = lobbyPlayers.filter(player => player.userId !== user?.id);

  return (
    <main className="duel-page">
      <div className="duel-spark duel-spark-one">✦</div><div className="duel-spark duel-spark-two">✧</div><div className="duel-spark duel-spark-three">◆</div>
      <section className="duel-welcome">
        <div className="duel-welcome-copy"><img src="/duelo-biblico/bible-logo.webp" alt="Bíblia aberta" /><div><span className="duel-kicker">✦ DESAFIO BÍBLICO · 2 JOGADORES</span><h1>Duelo Bíblico</h1><p>{message}</p></div></div>
        <div className="duel-language-wrap"><span>{copy.language}</span><div className="duel-languages">{LANGUAGES.map(language => <button key={language.code} onClick={() => { setGameLanguage(language.code); if (status === 'ready') setMessage((DUEL_COPY[language.code] || DUEL_COPY.pt).subtitle); }} className={gameLanguage === language.code ? 'active' : ''}>{language.flag}<b>{language.label}</b></button>)}</div></div>
      </section>

      <div className="duel-board">
        <aside className="duel-panel duel-players-panel">
          <div className="duel-panel-title"><span>✦</span><div><h2>{copy.online}</h2><p><i /> {lobbyPlayers.length} {copy.inRoom}</p></div></div>
          <div className="duel-online-list">
            {visiblePlayers.length === 0 ? <div className="duel-empty"><span>👋</span><p>{copy.empty}</p></div> : visiblePlayers.map(player => <div className="duel-player-card" key={player.userId}>
              {player.avatar ? <img src={player.avatar} alt="" /> : <span className="duel-initial">{player.userName?.charAt(0)?.toUpperCase()}</span>}
              <div><strong>{player.userName}</strong><small className={player.status}>{player.status === 'playing' ? 'Em partida' : player.status === 'waiting' ? 'A procurar' : 'Disponível'}</small></div>
              <button onClick={() => invitePlayer(player)} disabled={player.status === 'playing'}>{player.status === 'playing' ? 'Em jogo' : 'Desafiar'}</button>
            </div>)}
          </div>
          <div className="duel-golden-note">💎 {copy.invite}</div>
        </aside>

        <section className="duel-stage">
          <div className="duel-profile-card">
            {playerAvatar ? <img src={playerAvatar} alt="" /> : <span className="duel-profile-initial">{playerName.charAt(0).toUpperCase()}</span>}
            <div><span>{copy.welcome}</span><h2>{playerName}</h2></div><div className="duel-diamond">💎</div>
          </div>

          {status === 'ready' && <div className="duel-action-card">
            <div className="duel-trophy">🏆</div><span className="duel-action-kicker">{copy.ready}</span><h2>{copy.title}</h2><p>{copy.intro}</p>
            <div className="duel-action-buttons">
              <button className="duel-primary-button" onClick={startMatch}><span>⚡</span>{isConnected ? copy.search : '…'}</button>
              <button className="duel-bot-button" onClick={startBotMatch} disabled={!isConnected}><span>🤖</span> {copy.bot}</button>
            </div>
            <p className="duel-action-help">{copy.botHelp}</p>
          </div>}

          {status === 'waiting' && <div className="duel-action-card"><div className="duel-trophy">🔎</div><span className="duel-action-kicker">À PROCURA DE ADVERSÁRIO</span><h2>Estamos a encontrar alguém</h2><p>Podes ficar nesta sala. Assim que outro jogador entrar, a partida começa automaticamente.</p><button className="duel-secondary-button" onClick={leaveQueue}>Cancelar procura</button></div>}

          {status === 'playing' && !currentQuestion && <div className="duel-action-card"><div className="duel-trophy">✨</div><h2>A preparar o desafio</h2><p>As perguntas estão a chegar. Aguarda um instante.</p></div>}

          {status === 'playing' && currentQuestion && <div className="duel-question-card">
            <div className="duel-question-head"><span>Pergunta {questionIndex + 1} de {Math.max(questions.length, TOTAL_QUESTIONS)}</span><span className={`duel-timer ${timeLeft <= 5 ? 'urgent' : ''}`}>⏱ {timeLeft}s</span><span>⚔️ {opponent?.userName || 'Adversário'}</span></div>
            <div className="duel-question-medal">✦</div><h2>{currentQuestion.q}</h2>
            <div className="duel-options">{currentQuestion.opts.map((option, index) => { const picked = answer === index; const correct = answer !== null && index === currentQuestion.r; return <button key={`${option}-${index}`} onClick={() => chooseAnswer(index)} disabled={answer !== null} className={`${picked ? 'picked' : ''} ${correct ? 'correct' : ''}`}><b>{String.fromCharCode(65 + index)}</b><span>{option}</span></button>; })}</div>
            {players.length > 0 && <div className="duel-scoreboard">{players.map(player => <span key={player.userId}>{player.userName}<b>{player.pontos} pts</b></span>)}</div>}
          </div>}

          {status === 'finished' && <div className="duel-action-card duel-finish"><div className="duel-trophy">🏆</div><span className="duel-action-kicker">PARTIDA CONCLUÍDA</span><h2>{result?.userName ? `${result.userName} venceu!` : 'Parabéns por jogar!'}</h2><div className="duel-final-score">{players.map(player => <span key={player.userId}>{player.userName}<b>{player.pontos} pontos</b></span>)}</div><button className="duel-primary-button" onClick={() => { setStatus('ready'); setQuestions([]); setPlayers([]); setRoomId(null); }}>Jogar novamente</button></div>}

          <div className="duel-rewards"><div><span>🏅</span><b>Vitórias</b><strong>{players.find(player => player.userId === user?.id)?.pontos ? 'Em jogo' : '0'}</strong></div><div><span>💎</span><b>Diamantes</b><strong>{status === 'finished' && result?.userId === user?.id ? '3' : '0'}</strong></div><div><span>🌟</span><b>Sequência</b><strong>1 dia</strong></div></div>

        </section>

        <aside className="duel-panel duel-chat-panel">
          <div className="duel-panel-title"><span>💬</span><div><h2>{copy.chat}</h2><p>{copy.chatInfo}</p></div></div>
          <div className="duel-chat-messages">{chatMessages.length === 0 ? <div className="duel-empty"><span>✦</span><p>{copy.chatEmpty}</p></div> : chatMessages.map(chat => <div key={chat.id} className={`duel-chat-message ${chat.userId === user?.id ? 'mine' : ''} ${chat.failed ? 'failed' : ''}`}><b>{chat.userName}{chat.pending ? ' · a enviar…' : chat.failed ? ' · não enviada' : ''}</b><span>{chat.text}</span></div>)}</div>
          <form onSubmit={sendLobbyMessage} className="duel-chat-form"><input value={chatText} onChange={event => { setChatText(event.target.value); if (chatNotice) setChatNotice(''); }} maxLength={300} placeholder={copy.write} /><button type="submit" aria-label="Enviar mensagem">➤</button></form>
          {chatNotice && <p className="duel-chat-notice" role="status">{chatNotice}</p>}
        </aside>
      </div>

      <section className="duel-ranking"><div><span>🏆</span><div><h2>{copy.ranking}</h2><p>{copy.rankingInfo}</p></div></div><ol className="duel-top-ten">{ranking.length ? ranking.map((entry, index) => <li key={`${entry.nome}-${index}`}><b>{entry.posicao || index + 1}º</b><span>{entry.foto ? <img src={entry.foto} alt="" /> : '✦'} {entry.nome}</span><strong>{entry.pontos} pts</strong></li>) : <li className="duel-ranking-empty">{copy.rankingEmpty}</li>}</ol></section>

      {invite && <div className="duel-invite-overlay"><div className="duel-invite-modal"><div>⚔️</div><span>CONVITE PARA DUELO</span><h2>{invite.userName} quer desafiar-te</h2><p>Aceitas jogar uma partida de 10 perguntas bíblicas?</p><section><button onClick={() => answerInvite(false)}>Agora não</button><button onClick={() => answerInvite(true)}>Aceitar desafio</button></section></div></div>}
    </main>
  );
}
