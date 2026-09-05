import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useTranslation } from 'react-i18next';
import './DueloBiblico.css';

const TOTAL_QUESTIONS = 10;
const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
];

function questionForLanguage(question, lang) {
  if (!question) return null;
  return {
    ...question,
    q: question[`${lang}_q`] || question.q,
    opts: question[`${lang}_opts`] || question.opts || [],
  };
}

export default function DueloBiblico() {
  const { user } = useAuth();
  const { send, on, off, isConnected } = useWebSocket();
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'pt').slice(0, 2);
  const [gameLanguage, setGameLanguage] = useState(lang);
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState('Encontre um irmão e comece uma partida justa.');
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
  const [invite, setInvite] = useState(null);

  const currentQuestion = useMemo(
    () => questionForLanguage(questions[questionIndex], gameLanguage),
    [questions, questionIndex, gameLanguage],
  );

  useEffect(() => setGameLanguage(lang), [lang]);

  useEffect(() => {
    const queued = () => { setStatus('waiting'); setMessage('À espera de outro jogador…'); };
    const matched = (data) => {
      setRoomId(data.roomId);
      setQuestions(data.perguntas || []);
      setOpponent(data.adversario || null);
      setQuestionIndex(0);
      setAnswer(null);
      setPlayers([]);
      setStatus('playing');
      setMessage('Partida iniciada. Cada pergunta vale 3 pontos.');
    };
    const score = (data) => setPlayers(data.jogadores || []);
    const next = (data) => {
      setQuestionIndex(data.idx || 0);
      setAnswer(null);
      setMessage('Próxima pergunta');
    };
    const finished = (data) => {
      setPlayers(data.jogadores || []);
      setResult(data.vencedor || null);
      setStatus('finished');
      setMessage('Partida terminada. Deus abençoe os dois jogadores!');
    };
    const error = (data) => { setStatus('ready'); setMessage(data.message || 'Não foi possível iniciar a partida. Tente novamente.'); };

    on('game_queued', queued);
    on('game_matched', matched);
    on('game_score', score);
    on('game_next_question', next);
    on('game_finished', finished);
    on('game_error', error);
    return () => {
      off('game_queued', queued);
      off('game_matched', matched);
      off('game_score', score);
      off('game_next_question', next);
      off('game_finished', finished);
      off('game_error', error);
    };
  }, [off, on]);

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
    const receiveChat = (data) => setChatMessages(current => [...current.slice(-49), data.message].filter(Boolean));
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
  }, [off, on]);

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

  const chooseAnswer = (choice) => {
    if (answer !== null || !currentQuestion || !roomId) return;
    const correct = choice === currentQuestion.r;
    setAnswer(choice);
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
    send({ type: 'game_lobby_chat', userId: user.id, text });
    setChatText('');
  };

  const playerName = user?.full_name || user?.name || 'Jogador';
  const playerAvatar = user?.profile_photo || user?.avatar_url || user?.photo_url || '';
  const visiblePlayers = lobbyPlayers.filter(player => player.userId !== user?.id);

  return (
    <main className="duel-page">
      <div className="duel-spark duel-spark-one">✦</div><div className="duel-spark duel-spark-two">✧</div><div className="duel-spark duel-spark-three">◆</div>
      <section className="duel-welcome">
        <div className="duel-welcome-copy"><img src="/duelo-biblico/bible-logo.webp" alt="Bíblia aberta" /><div><span className="duel-kicker">✦ DESAFIO BÍBLICO · 2 JOGADORES</span><h1>Duelo Bíblico</h1><p>{message}</p></div></div>
        <div className="duel-language-wrap"><span>Escolhe o teu idioma</span><div className="duel-languages">{LANGUAGES.map(language => <button key={language.code} onClick={() => setGameLanguage(language.code)} className={gameLanguage === language.code ? 'active' : ''} title={language.label}>{language.flag}<b>{language.code.toUpperCase()}</b></button>)}</div></div>
      </section>

      <div className="duel-board">
        <aside className="duel-panel duel-players-panel">
          <div className="duel-panel-title"><span>✦</span><div><h2>Jogadores online</h2><p><i /> {lobbyPlayers.length} na sala agora</p></div></div>
          <div className="duel-online-list">
            {visiblePlayers.length === 0 ? <div className="duel-empty"><span>👋</span><p>Ainda não há outro jogador. Usa a procura automática para começar.</p></div> : visiblePlayers.map(player => <div className="duel-player-card" key={player.userId}>
              {player.avatar ? <img src={player.avatar} alt="" /> : <span className="duel-initial">{player.userName?.charAt(0)?.toUpperCase()}</span>}
              <div><strong>{player.userName}</strong><small className={player.status}>{player.status === 'playing' ? 'Em partida' : player.status === 'waiting' ? 'A procurar' : 'Disponível'}</small></div>
              <button onClick={() => invitePlayer(player)} disabled={player.status === 'playing'}>{player.status === 'playing' ? 'Em jogo' : 'Desafiar'}</button>
            </div>)}
          </div>
          <div className="duel-golden-note">💎 Convide alguém ou entre na procura automática.</div>
        </aside>

        <section className="duel-stage">
          <div className="duel-profile-card">
            {playerAvatar ? <img src={playerAvatar} alt="" /> : <span className="duel-profile-initial">{playerName.charAt(0).toUpperCase()}</span>}
            <div><span>Bem-vindo ao Desafio</span><h2>{playerName}</h2></div><div className="duel-diamond">💎</div>
          </div>

          {status === 'ready' && <div className="duel-action-card">
            <div className="duel-trophy">🏆</div><span className="duel-action-kicker">PRONTO PARA UMA NOVA CONQUISTA?</span><h2>Mostra o que sabes da Bíblia</h2><p>Entra numa partida ao vivo e responde 10 perguntas para ganhar pontos, medalhas e diamantes.</p>
            <button className="duel-primary-button" onClick={startMatch}><span>⚡</span>{isConnected ? 'Procura automática' : 'A ligar…'}</button>
            <p className="duel-action-help">A partida começa quando encontrar um adversário real.</p>
          </div>}

          {status === 'waiting' && <div className="duel-action-card"><div className="duel-trophy">🔎</div><span className="duel-action-kicker">À PROCURA DE ADVERSÁRIO</span><h2>Estamos a encontrar alguém</h2><p>Podes ficar nesta sala. Assim que outro jogador entrar, a partida começa automaticamente.</p><button className="duel-secondary-button" onClick={leaveQueue}>Cancelar procura</button></div>}

          {status === 'playing' && !currentQuestion && <div className="duel-action-card"><div className="duel-trophy">✨</div><h2>A preparar o desafio</h2><p>As perguntas estão a chegar. Aguarda um instante.</p></div>}

          {status === 'playing' && currentQuestion && <div className="duel-question-card">
            <div className="duel-question-head"><span>Pergunta {questionIndex + 1} de {Math.max(questions.length, TOTAL_QUESTIONS)}</span><span>⚔️ {opponent?.userName || 'Adversário'}</span></div>
            <div className="duel-question-medal">✦</div><h2>{currentQuestion.q}</h2>
            <div className="duel-options">{currentQuestion.opts.map((option, index) => { const picked = answer === index; const correct = answer !== null && index === currentQuestion.r; return <button key={`${option}-${index}`} onClick={() => chooseAnswer(index)} disabled={answer !== null} className={`${picked ? 'picked' : ''} ${correct ? 'correct' : ''}`}><b>{String.fromCharCode(65 + index)}</b><span>{option}</span></button>; })}</div>
            {players.length > 0 && <div className="duel-scoreboard">{players.map(player => <span key={player.userId}>{player.userName}<b>{player.pontos} pts</b></span>)}</div>}
          </div>}

          {status === 'finished' && <div className="duel-action-card duel-finish"><div className="duel-trophy">🏆</div><span className="duel-action-kicker">PARTIDA CONCLUÍDA</span><h2>{result?.userName ? `${result.userName} venceu!` : 'Parabéns por jogar!'}</h2><div className="duel-final-score">{players.map(player => <span key={player.userId}>{player.userName}<b>{player.pontos} pontos</b></span>)}</div><button className="duel-primary-button" onClick={() => { setStatus('ready'); setQuestions([]); setPlayers([]); setRoomId(null); }}>Jogar novamente</button></div>}

          <div className="duel-rewards"><div><span>🏅</span><b>Vitórias</b><strong>{players.find(player => player.userId === user?.id)?.pontos ? 'Em jogo' : '0'}</strong></div><div><span>💎</span><b>Diamantes</b><strong>{status === 'finished' && result?.userId === user?.id ? '3' : '0'}</strong></div><div><span>🌟</span><b>Sequência</b><strong>1 dia</strong></div></div>
        </section>

        <aside className="duel-panel duel-chat-panel">
          <div className="duel-panel-title"><span>💬</span><div><h2>Chat da sala</h2><p>Conversa com os jogadores</p></div></div>
          <div className="duel-chat-messages">{chatMessages.length === 0 ? <div className="duel-empty"><span>✦</span><p>Escreve uma mensagem de boas-vindas para a sala.</p></div> : chatMessages.map(chat => <div key={chat.id} className={`duel-chat-message ${chat.userId === user?.id ? 'mine' : ''}`}><b>{chat.userName}</b><span>{chat.text}</span></div>)}</div>
          <form onSubmit={sendLobbyMessage} className="duel-chat-form"><input value={chatText} onChange={event => setChatText(event.target.value)} maxLength={300} placeholder="Escreve uma mensagem…" /><button type="submit" aria-label="Enviar mensagem">➤</button></form>
        </aside>
      </div>

      <section className="duel-ranking"><div><span>🏆</span><div><h2>Conquistas do Desafio</h2><p>Joga, aprende e coleciona recompensas.</p></div></div><div className="duel-badges"><span><img src="/duelo-biblico/medal-gold.webp" alt="" />Primeira vitória</span><span><img src="/duelo-biblico/medal-silver.webp" alt="" />5 respostas certas</span><span><img src="/duelo-biblico/medal-bronze.webp" alt="" />3 dias seguidos</span></div></section>

      {invite && <div className="duel-invite-overlay"><div className="duel-invite-modal"><div>⚔️</div><span>CONVITE PARA DUELO</span><h2>{invite.userName} quer desafiar-te</h2><p>Aceitas jogar uma partida de 10 perguntas bíblicas?</p><section><button onClick={() => answerInvite(false)}>Agora não</button><button onClick={() => answerInvite(true)}>Aceitar desafio</button></section></div></div>}
    </main>
  );
}
