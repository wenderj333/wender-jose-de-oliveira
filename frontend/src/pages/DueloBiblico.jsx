import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useTranslation } from 'react-i18next';

const TOTAL_QUESTIONS = 10;

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
    () => questionForLanguage(questions[questionIndex], lang),
    [questions, questionIndex, lang],
  );

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
  const visiblePlayers = lobbyPlayers.filter(player => player.userId !== user?.id);

  return (
    <main className="duel-lobby-layout" style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 16px 48px', display: 'grid', gridTemplateColumns: '250px minmax(0,1fr) 280px', gap: 18, alignItems: 'start' }}>
      <aside className="duel-side" style={{ background: '#171025', borderRadius: 20, padding: 18, color: 'white', boxShadow: '0 8px 28px rgba(32,25,70,.16)' }}>
        <p style={{ margin: 0, color: '#f4c53d', fontSize: 12, fontWeight: 900, letterSpacing: '.09em' }}>JOGADORES ONLINE</p>
        <p style={{ margin: '8px 0 16px', color: '#c9c0de', fontSize: 13 }}>{lobbyPlayers.length} {lobbyPlayers.length === 1 ? 'pessoa na sala' : 'pessoas na sala'}</p>
        {visiblePlayers.length === 0 ? <p style={{ margin: 0, color: '#aaa0bd', lineHeight: 1.5, fontSize: 14 }}>Ainda não há outro jogador nesta sala. Podes usar a procura automática.</p> : <div style={{ display: 'grid', gap: 10 }}>
          {visiblePlayers.map(player => <div key={player.userId} style={{ display: 'flex', gap: 9, alignItems: 'center', padding: 9, borderRadius: 12, background: '#2a1c43' }}>
            {player.avatar ? <img src={player.avatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} /> : <span style={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#8055c6', fontWeight: 800 }}>{player.userName?.charAt(0)?.toUpperCase()}</span>}
            <div style={{ minWidth: 0, flex: 1 }}><strong style={{ display: 'block', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.userName}</strong><span style={{ fontSize: 11, color: player.status === 'playing' ? '#d5af6b' : '#6fe09b' }}>{player.status === 'playing' ? 'Em partida' : player.status === 'waiting' ? 'A procurar' : 'Disponível'}</span></div>
            <button onClick={() => invitePlayer(player)} disabled={player.status === 'playing'} style={{ border: 0, borderRadius: 8, padding: '7px 8px', background: player.status === 'playing' ? '#54466a' : '#f4bd25', color: '#261337', fontSize: 11, fontWeight: 900, cursor: player.status === 'playing' ? 'default' : 'pointer' }}>{player.status === 'playing' ? 'Joga' : 'Convidar'}</button>
          </div>)}
        </div>}
      </aside>

      <div>
      <section style={{ borderRadius: 24, padding: '30px 24px', color: 'white', background: 'linear-gradient(135deg,#43217d,#7850bd)', boxShadow: '0 18px 38px rgba(67,33,125,.22)' }}>
        <p style={{ margin: 0, opacity: .82, fontWeight: 700, letterSpacing: '.08em', fontSize: 12 }}>DESAFIO BÍBLICO · 2 JOGADORES</p>
        <h1 style={{ margin: '8px 0', fontSize: 'clamp(28px,5vw,42px)' }}>Duelo Bíblico</h1>
        <p style={{ margin: 0, lineHeight: 1.6 }}>{message}</p>
      </section>

      <section style={{ background: 'white', marginTop: 18, borderRadius: 20, padding: 22, boxShadow: '0 8px 28px rgba(32,25,70,.08)' }}>
        {status === 'ready' && <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 50 }}>⚔️</div>
          <h2 style={{ color: '#33205f' }}>Jogar com outra pessoa</h2>
          <p style={{ color: '#687087', lineHeight: 1.6 }}>Quando os dois jogadores clicarem para jogar, a partida começa automaticamente.</p>
          <button onClick={startMatch} style={{ border: 0, borderRadius: 14, padding: '14px 22px', background: '#f4bd25', color: '#27134a', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>{isConnected ? 'Encontrar jogador' : 'A ligar…'}</button>
        </div>}

        {status === 'waiting' && <div style={{ textAlign: 'center', padding: 22 }}>
          <div style={{ fontSize: 44 }}>🙏</div>
          <h2 style={{ color: '#33205f' }}>À espera de adversário</h2>
          <p style={{ color: '#687087' }}>A partida começará automaticamente assim que outra pessoa entrar.</p>
          <button onClick={leaveQueue} style={{ border: '1px solid #7850bd', borderRadius: 12, padding: '10px 16px', background: 'white', color: '#59369a', fontWeight: 700, cursor: 'pointer' }}>Cancelar procura</button>
        </div>}

        {status === 'playing' && !currentQuestion && <div style={{ textAlign: 'center', padding: 24, color: '#59369a' }}>A preparar as perguntas para a partida…</div>}
        {status === 'playing' && currentQuestion && <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 20, color: '#5d3a9f', fontWeight: 800 }}>
            <span>Pergunta {questionIndex + 1} de {Math.max(questions.length, TOTAL_QUESTIONS)}</span>
            <span>{opponent?.userName || 'Adversário'}</span>
          </div>
          <h2 style={{ color: '#27213e', lineHeight: 1.35, fontSize: 22 }}>{currentQuestion.q}</h2>
          <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
            {currentQuestion.opts.map((option, index) => {
              const picked = answer === index;
              const correct = answer !== null && index === currentQuestion.r;
              return <button key={`${option}-${index}`} onClick={() => chooseAnswer(index)} disabled={answer !== null} style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 13, cursor: answer === null ? 'pointer' : 'default', border: `2px solid ${correct ? '#3d9565' : picked ? '#d86a59' : '#e5e3ed'}`, background: correct ? '#ecf8f0' : picked ? '#fff0ed' : 'white', color: '#2d2940', fontSize: 16 }}>{String.fromCharCode(65 + index)}. {option}</button>;
            })}
          </div>
          {players.length > 0 && <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #eceaf3', display: 'flex', gap: 12, flexWrap: 'wrap' }}>{players.map(player => <span key={player.userId} style={{ background: '#f4f0fb', padding: '8px 11px', borderRadius: 999, color: '#43217d', fontWeight: 700 }}>{player.userName}: {player.pontos} pts</span>)}</div>}
        </div>}

        {status === 'finished' && <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 54 }}>🏆</div>
          <h2 style={{ color: '#33205f' }}>{result?.userName ? `${result.userName} venceu!` : 'Partida concluída!'}</h2>
          {players.map(player => <p key={player.userId} style={{ margin: '7px 0', color: '#555' }}>{player.userName}: <strong>{player.pontos} pontos</strong></p>)}
          <button onClick={() => { setStatus('ready'); setQuestions([]); setPlayers([]); setRoomId(null); }} style={{ marginTop: 16, border: 0, borderRadius: 12, padding: '12px 18px', background: '#7850bd', color: 'white', fontWeight: 800, cursor: 'pointer' }}>Jogar novamente</button>
        </div>}
      </section>
      </div>

      <aside className="duel-side" style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 28px rgba(32,25,70,.10)' }}>
        <div style={{ padding: '16px 16px 12px', background: '#f4f0fb', color: '#43217d' }}><strong>💬 Chat da sala</strong><p style={{ margin: '5px 0 0', fontSize: 12, color: '#786b91' }}>Conversa com quem está no Desafio.</p></div>
        <div style={{ height: 310, overflowY: 'auto', padding: 12, display: 'grid', alignContent: 'start', gap: 9 }}>
          {chatMessages.length === 0 ? <p style={{ color: '#8b829c', fontSize: 13, lineHeight: 1.5, margin: 0 }}>Diz olá, {playerName}. As mensagens aparecem para todos os jogadores desta sala.</p> : chatMessages.map(message => <div key={message.id} style={{ padding: '8px 10px', background: message.userId === user?.id ? '#eee7fb' : '#f6f6f8', borderRadius: 11 }}><strong style={{ display: 'block', fontSize: 12, color: '#53378e' }}>{message.userName}</strong><span style={{ color: '#403b4e', fontSize: 13, wordBreak: 'break-word' }}>{message.text}</span></div>)}
        </div>
        <form onSubmit={sendLobbyMessage} style={{ display: 'flex', gap: 7, padding: 12, borderTop: '1px solid #eeeaf5' }}><input value={chatText} onChange={event => setChatText(event.target.value)} maxLength={300} placeholder="Escreve uma mensagem…" style={{ minWidth: 0, flex: 1, padding: '10px 9px', border: '1px solid #ded7eb', borderRadius: 10, outlineColor: '#7850bd' }} /><button type="submit" style={{ border: 0, borderRadius: 10, background: '#7850bd', color: 'white', fontWeight: 800, padding: '0 12px', cursor: 'pointer' }}>Enviar</button></form>
      </aside>

      {invite && <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', padding: 20, background: 'rgba(20,12,38,.55)' }}><div style={{ width: 'min(390px,100%)', borderRadius: 20, background: 'white', padding: 24, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.28)' }}><div style={{ fontSize: 42 }}>⚔️</div><h2 style={{ color: '#33205f', margin: '10px 0' }}>{invite.userName} quer desafiar-te</h2><p style={{ color: '#6d647d', lineHeight: 1.5 }}>Aceitas jogar uma partida de 10 perguntas bíblicas?</p><div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button onClick={() => answerInvite(false)} style={{ border: '1px solid #c8bfd7', background: 'white', color: '#594b71', borderRadius: 11, padding: '11px 16px', fontWeight: 800, cursor: 'pointer' }}>Agora não</button><button onClick={() => answerInvite(true)} style={{ border: 0, background: '#f4bd25', color: '#321855', borderRadius: 11, padding: '11px 16px', fontWeight: 900, cursor: 'pointer' }}>Aceitar desafio</button></div></div></div>}
      <style>{'@media (max-width: 940px) { .duel-lobby-layout { grid-template-columns: 1fr !important; } .duel-side { min-height: auto; } }'}</style>
    </main>
  );
}
