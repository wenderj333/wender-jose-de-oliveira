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

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '24px 16px 48px' }}>
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
    </main>
  );
}