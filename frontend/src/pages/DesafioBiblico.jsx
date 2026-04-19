
import PERGUNTAS_JSON from '../data/perguntas.json';

function filtrarPerguntas(livro) { let pool = PERGUNTAS_JSON.filter(p => livro === 'Todos' || p.livro === livro); if(pool.length===0) pool=PERGUNTAS_JSON; const f=pool.filter(p=>p.nivel==='facil').sort(()=>Math.random()-0.5).slice(0,2); const m=pool.filter(p=>p.nivel==='medio').sort(()=>Math.random()-0.5).slice(0,2); const d=pool.filter(p=>p.nivel==='dificil').sort(()=>Math.random()-0.5).slice(0,1); return [...f,...m,...d]; }
import React, { useState, useEffect, useRef } from 'react';
import PERGUNTAS_JSON from '../data/perguntas.json';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PERGUNTAS = [];
const TEMPO = 6;

export default function DesafioBiblico() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tela, setTela] = useState('lobby');
  const [codigoSala, setCodigoSala] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [jogadores, setJogadores] = useState([]);
  const [perguntaIdx, setPerguntaIdx] = useState(0);
  const [tempo, setTempo] = useState(TEMPO);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [resultado, setResultado] = useState(null);
  const timerRef = useRef(null);
  const tempoRespostaRef = useRef(TEMPO);

  const pergunta = PERGUNTAS[perguntaIdx];

  function gerarCodigo() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  function criarSala() {
    const codigo = gerarCodigo();
    setCodigoSala(codigo);
    setJogadores([{ nome: user?.full_name || 'Eu', pontos: 0, id: user?.id }]);
    setTela('sala');
  }

  function entrarSala() {
    if (!codigoInput.trim()) return;
    setCodigoSala(codigoInput.toUpperCase());
    setJogadores([{ nome: user?.full_name || 'Eu', pontos: 0, id: user?.id }]);
    setTela('sala');
  }

  function iniciarJogo() {
    setPerguntaIdx(0);
    setPontos(0);
    setRespostaSelecionada(null);
    setFeedback(null);
    setTela('jogo');
  }

  useEffect(() => {
    if (tela !== 'jogo') return;
    setTempo(TEMPO);
    tempoRespostaRef.current = TEMPO;
    timerRef.current = setInterval(() => {
      setTempo(prev => {
        tempoRespostaRef.current = prev - 1;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (respostaSelecionada === null) proximaPergunta(null, TEMPO);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [perguntaIdx, tela]);

  function responder(idx) {
    if (respostaSelecionada !== null) return;
    clearInterval(timerRef.current);
    setRespostaSelecionada(idx);
    const correto = idx === pergunta.r;
    const tempRestante = tempoRespostaRef.current;
    const pts = correto ? (tempRestante >= 4 ? 10 : 5) : 0;
    setFeedback({ correto, pts });
    setPontos(prev => prev + pts);
    setTimeout(() => proximaPergunta(idx, tempRestante), 1500);
  }

  function proximaPergunta(resposta, tempRestante) {
    setFeedback(null);
    setRespostaSelecionada(null);
    if (perguntaIdx + 1 >= 5) {
      setResultado({ pontos: pontos + (resposta === pergunta?.r ? (tempRestante >= 4 ? 10 : 5) : 0) });
      setTela('resultado');
    } else {
      setPerguntaIdx(prev => prev + 1);
    }
  }

  function compartilhar() {
    const msg = 'Joguei o Desafio Biblico no Sigo com Fe e fiz ' + (resultado?.pontos || 0) + ' pontos! Vem jogar comigo! https://sigo-com-fe.vercel.app/desafio-biblico';
    if (navigator.share) {
      navigator.share({ title: 'Desafio Biblico', text: msg });
    } else {
      navigator.clipboard.writeText(msg);
      alert('Link copiado!');
    }
  }

  const bg = { minHeight: '100vh', background: 'linear-gradient(135deg,#1a0a3e,#2d1054)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, color: 'white' };

  if (tela === 'lobby') return (
    <div style={bg}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🏆</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>Desafio Biblico</h1>
      <p style={{ opacity: 0.7, marginBottom: 32, textAlign: 'center' }}>Testa o teu conhecimento da Palavra!</p>
      <button onClick={criarSala} style={{ width: '100%', maxWidth: 320, padding: 16, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#6c47d4,#4A2270)', color: 'white', fontSize: 18, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
        ➕ Criar Sala
      </button>
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', gap: 10, marginBottom: 14 }}>
        <input value={codigoInput} onChange={e => setCodigoInput(e.target.value.toUpperCase())} placeholder='Codigo da sala...' style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 16, outline: 'none' }} />
        <button onClick={entrarSala} style={{ padding: '14px 20px', borderRadius: 12, border: 'none', background: '#27ae60', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>Entrar</button>
      </div>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14 }}>Voltar</button>
    </div>
  );

  if (tela === 'sala') return (
    <div style={bg}>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Sala de Espera</h2>
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 24px', marginBottom: 24, fontSize: 28, fontWeight: 900, letterSpacing: 8 }}>{codigoSala}</div>
      <p style={{ opacity: 0.7, marginBottom: 24, textAlign: 'center', fontSize: 13 }}>Partilha este codigo com os teus amigos!</p>
      <button onClick={() => { navigator.clipboard.writeText('Vem jogar o Desafio Biblico comigo! Codigo: ' + codigoSala + ' https://sigo-com-fe.vercel.app/desafio-biblico'); alert('Copiado!'); }} style={{ padding: '10px 24px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: 'white', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
        📋 Copiar convite
      </button>
      <div style={{ width: '100%', maxWidth: 320, marginBottom: 24 }}>
        {jogadores.map((j, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6c47d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{j.nome.charAt(0)}</div>
            <span>{j.nome}</span>
            {i === 0 && <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.7 }}>Anfitriao</span>}
          </div>
        ))}
      </div>
      <button onClick={iniciarJogo} style={{ width: '100%', maxWidth: 320, padding: 16, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#e74c3c,#c0392b)', color: 'white', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>
        🚀 Iniciar Jogo!
      </button>
    </div>
  );

  if (tela === 'jogo') return (
    <div style={{ ...bg, justifyContent: 'flex-start', paddingTop: 40 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ opacity: 0.7 }}>Pergunta {perguntaIdx + 1}/5</span>
          <span style={{ fontWeight: 700, color: tempo <= 2 ? '#e74c3c' : '#f0c040' }}>⏱️ {tempo}s</span>
          <span style={{ opacity: 0.7 }}>🏆 {pontos} pts</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: 16 }}>
            <div style={{ width: (tempo/TEMPO*100) + '%', height: '100%', background: tempo <= 2 ? '#e74c3c' : '#6c47d4', borderRadius: 3, transition: 'width 1s linear' }} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5, textAlign: 'center' }}>{pergunta.q}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {pergunta.opts.map((opt, i) => {
            let bg2 = 'rgba(255,255,255,0.1)';
            if (respostaSelecionada !== null) {
              if (i === pergunta.r) bg2 = '#27ae60';
              else if (i === respostaSelecionada) bg2 = '#e74c3c';
            }
            return (
              <button key={i} onClick={() => responder(i)} style={{ padding: '16px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: bg2, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 0.3s', textAlign: 'center' }}>
                {opt}
              </button>
            );
          })}
        </div>
        {feedback && (
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 28, animation: 'fadeIn 0.3s' }}>
            {feedback.correto ? '🙏 Amem! +' + feedback.pts + ' pts' : '❌ Quase!'}
          </div>
        )}
      </div>
    </div>
  );

  if (tela === 'resultado') return (
    <div style={bg}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🏆</div>
      <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Resultado Final!</h2>
      <div style={{ fontSize: 48, fontWeight: 900, color: '#f0c040', marginBottom: 8 }}>{resultado?.pontos} pts</div>
      <p style={{ opacity: 0.7, marginBottom: 32 }}>{resultado?.pontos >= 40 ? 'Mestre Biblico!' : resultado?.pontos >= 25 ? 'Muito bem!' : 'Continue estudando!'}</p>
      <button onClick={compartilhar} style={{ width: '100%', maxWidth: 320, padding: 16, borderRadius: 14, border: 'none', background: '#25D366', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
        📱 Partilhar resultado
      </button>
      <button onClick={() => { setPerguntaIdx(0); setPontos(0); setTela('lobby'); }} style={{ width: '100%', maxWidth: 320, padding: 16, borderRadius: 14, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', fontSize: 16, cursor: 'pointer', marginBottom: 14 }}>
        🔄 Jogar de novo
      </button>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14 }}>Voltar</button>
    </div>
  );

  return null;
}