import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import PERGUNTAS_JSON from '../data/perguntas.json';

const LIVROS = ['Todos', 'Genesis', 'Exodo', 'Salmos', 'Proverbios', 'Mateus', 'Apocalipse'];
const TEMPO_MAX = 15;

export default function DesafioBiblico() {
    const { i18n } = useTranslation();
    const lang = i18n.language?.substring(0, 2) || 'pt';
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // ESTADOS DE JOGO
    const [tela, setTela] = useState('lobby'); // lobby, procurando, jogo, resultado
    const [perguntas, setPerguntas] = useState([]);
    const [idx, setIdx] = useState(0);
    const [pontos, setPontos] = useState(0);
    const [combo, setCombo] = useState(0);
    const [tempo, setTempo] = useState(TEMPO_MAX);
    const [resp, setResp] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [livro, setLivro] = useState('Todos');
    const [roomId, setRoomId] = useState(null);

    const timerRef = useRef(null);
    const wsRef = useRef(null);

    // SONS (Refatorado para ser mais estável)
    function playSfx(freq, type = 'sine', duration = 0.1) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
            g.gain.setValueAtTime(0.1, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            o.connect(g); g.connect(ctx.destination);
            o.start(); o.stop(ctx.currentTime + duration);
        } catch (e) {}
    }

    // LÓGICA DE FILTRAR PERGUNTAS (Local para caso o socket falhe)
    function getPerguntasLocal(tema) {
        let p = PERGUNTAS_JSON.filter(x => tema === 'Todos' || x.livro === tema);
        if (p.length < 5) p = PERGUNTAS_JSON;
        return p.sort(() => Math.random() - 0.5).slice(0, 5);
    }

    // FUNÇÃO COMPARTILHAR
    const compartilharJogo = () => {
        const link = `https://sigocomfe.com/desafio?invite=${user?.id || 'play'}`;
        const texto = `Vem me desafiar no Desafio Bíblico! Escolhi o livro de ${livro}. Clique aqui: ${link}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
    };

    // TIMER
    useEffect(() => {
        if (tela === 'jogo' && resp === null) {
            if (tempo > 0) {
                timerRef.current = setTimeout(() => setTempo(t => t - 1), 1000);
            } else {
                handleResposta(-1); // Tempo esgotado
            }
        }
        return () => clearTimeout(timerRef.current);
    }, [tempo, tela, resp]);

    // INICIAR BUSCA POR JOGADOR
    const buscarOponente = () => {
        setTela('procurando');
        // Simulando conexão ou Socket
        setTimeout(() => {
            const pgs = getPerguntasLocal(livro);
            setPerguntas(pgs);
            setIdx(0); setPontos(0); setCombo(0);
            setTela('jogo');
            setTempo(TEMPO_MAX);
        }, 3000); // 3 segundos para achar alguém (mais real)
    };

    const handleResposta = (i) => {
        if (resp !== null) return;
        setResp(i);
        const correta = perguntas[idx].r;
        if (i === correta) {
            playSfx(600, 'sine', 0.3);
            const bonusTempo = Math.floor(tempo / 2);
            const ptsGanhos = 10 + bonusTempo + (combo * 2);
            setPontos(p => p + ptsGanhos);
            setCombo(c => c + 1);
            setFeedback('correto');
        } else {
            playSfx(200, 'sawtooth', 0.3);
            setCombo(0);
            setFeedback('errado');
        }

        setTimeout(() => {
            if (idx + 1 < perguntas.length) {
                setIdx(idx + 1);
                setResp(null);
                setFeedback(null);
                setTempo(TEMPO_MAX);
            } else {
                setTela('resultado');
            }
        }, 1500);
    };

    // RENDER LOBBY
    if (tela === 'lobby') return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🏆 Desafio Bíblico</h1>
                <p style={styles.subtitle}>Escolha um tema para começar</p>
                
                <div style={styles.gridLivros}>
                    {LIVROS.map(l => (
                        <button key={l} 
                            onClick={() => setLivro(l)}
                            style={{...styles.btnLivro, backgroundColor: livro === l ? '#FFD700' : 'rgba(255,255,255,0.1)'}}>
                            {l}
                        </button>
                    ))}
                </div>

                <button onClick={buscarOponente} style={styles.btnPrincipal}>JOGAR AGORA</button>
                <button onClick={compartilharJogo} style={styles.btnSecundario}>邀请 AMIGO (WHATSAPP)</button>
            </div>
        </div>
    );

    // RENDER PROCURANDO
    if (tela === 'procurando') return (
        <div style={styles.container}>
            <div style={styles.loader}></div>
            <h2 style={{marginTop: 20}}>Buscando oponente...</h2>
            <p>Preparando perguntas de {livro}</p>
        </div>
    );

    // RENDER JOGO
    if (tela === 'jogo' && perguntas[idx]) {
        const p = perguntas[idx];
        const progresso = (tempo / TEMPO_MAX) * 100;
        
        return (
            <div style={styles.container}>
                <div style={styles.headerJogo}>
                    <span>Questão {idx + 1}/5</span>
                    <span style={{color: '#FFD700', fontWeight: 'bold'}}>Pontos: {pontos}</span>
                </div>

                {/* Barra de Tempo Profissional */}
                <div style={styles.barraFundo}>
                    <div style={{...styles.barraProgresso, width: `${progresso}%`, backgroundColor: tempo < 5 ? '#ff4d4d' : '#4CAF50'}}></div>
                </div>

                <div style={styles.cardPergunta}>
                    {combo > 1 && <div style={styles.comboBadge}>COMBO X{combo} 🔥</div>}
                    <h2 style={styles.perguntaTexto}>{p[lang+'_q'] || p.q}</h2>
                </div>

                <div style={styles.gridRespostas}>
                    {(p[lang+'_opts'] || p.opts).map((opt, i) => (
                        <button key={i} 
                            disabled={resp !== null}
                            onClick={() => handleResposta(i)}
                            style={{
                                ...styles.btnResposta,
                                backgroundColor: resp === i ? (feedback === 'correto' ? '#2ecc71' : '#e74c3c') : 'white',
                                color: resp === i ? 'white' : '#333'
                            }}>
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // RENDER RESULTADO
    if (tela === 'resultado') return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={{fontSize: 50}}>🎊</h1>
                <h2>Fim de Partida!</h2>
                <div style={styles.pontuacaoFinal}>{pontos}</div>
                <p>Pontos conquistados</p>
                <button onClick={() => setTela('lobby')} style={styles.btnPrincipal}>VOLTAR AO INÍCIO</button>
            </div>
        </div>
    );

    return null;
}

const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: 'white', fontFamily: 'sans-serif' },
    card: { background: 'rgba(0,0,0,0.6)', padding: 40, borderRadius: 25, textAlign: 'center', maxWidth: 450, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
    title: { fontSize: 32, marginBottom: 10, fontWeight: 'bold' },
    subtitle: { opacity: 0.8, marginBottom: 30 },
    gridLivros: { display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 30 },
    btnLivro: { border: '1px solid rgba(255,255,255,0.3)', padding: '8px 15px', borderRadius: 20, color: 'white', cursor: 'pointer', transition: '0.3s' },
    btnPrincipal: { width: '100%', padding: 18, borderRadius: 15, border: 'none', backgroundColor: '#FFD700', color: '#000', fontWeight: 'bold', fontSize: 18, cursor: 'pointer', marginBottom: 15 },
    btnSecundario: { width: '100%', padding: 15, borderRadius: 15, border: '1px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
    loader: { width: 50, height: 50, border: '5px solid #FFF', borderBottomColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'rotation 1s linear infinite' },
    headerJogo: { width: '100%', maxWidth: 500, display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 18 },
    barraFundo: { width: '100%', maxWidth: 500, height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, marginBottom: 30, overflow: 'hidden' },
    barraProgresso: { height: '100%', transition: '1s linear' },
    cardPergunta: { width: '100%', maxWidth: 500, background: 'white', padding: 30, borderRadius: 20, color: '#333', marginBottom: 20, position: 'relative', textAlign: 'center' },
    perguntaTexto: { fontSize: 22, margin: 0 },
    comboBadge: { position: 'absolute', top: -15, right: -10, backgroundColor: '#ff4757', color: 'white', padding: '5px 12px', borderRadius: 15, fontWeight: 'bold', fontSize: 14, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
    gridRespostas: { width: '100%', maxWidth: 500, display: 'grid', gridTemplateColumns: '1fr', gap: 10 },
    btnResposta: { padding: 20, borderRadius: 15, border: 'none', fontSize: 16, fontWeight: '500', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 0px rgba(0,0,0,0.1)' },
    pontuacaoFinal: { fontSize: 80, fontWeight: 'bold', color: '#FFD700', margin: '20px 0' }
};
