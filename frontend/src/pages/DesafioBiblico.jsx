import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import PERGUNTAS_JSON from '../data/perguntas.json';

const LIVROS = ['Todos', 'Genesis', 'Exodo', 'Salmos', 'Proverbios', 'Mateus', 'Apocalipse'];
const TEMPO_MAX = 15;

export default function DesafioBiblico() {
    const { i18n, t } = useTranslation();
    const lang = i18n.language?.substring(0, 2) || 'pt';
    const { user } = useAuth();
    const navigate = useNavigate();

    const [tela, setTela] = useState('lobby'); 
    const [perguntas, setPerguntas] = useState([]);
    const [idx, setIdx] = useState(0);
    const [pontos, setPontos] = useState(0);
    const [combo, setCombo] = useState(0);
    const [tempo, setTempo] = useState(TEMPO_MAX);
    const [resp, setResp] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [livro, setLivro] = useState('Todos');

    const timerRef = useRef(null);
    const wsRef = useRef(null);

    // FUNÇÃO DE TRADUÇÃO DINÂMICA
    const getTxt = (obj, sufixo) => {
        if (!obj) return '';
        // Tenta: pergunta_pt, questao_pt ou apenas q/p
        return obj[`pergunta_${lang}`] || obj[`p_${lang}`] || obj[`q_${lang}`] || obj.pergunta || obj.q || obj.text;
    };

    const getOpts = (obj) => {
        if (!obj) return [];
        return obj[`opcoes_${lang}`] || obj[`opts_${lang}`] || obj.opcoes || obj.opts || [];
    };

    // CONEXÃO WEBSOCKET (ESPERA REAL)
    const buscarOponente = () => {
        setTela('procurando');
        
        // Tenta conectar ao seu servidor real
        const socketUrl = (window.location.protocol === 'https:' ? 'wss' : 'ws') + '://sigo-com-fe-api.onrender.com/ws';
        const ws = new WebSocket(socketUrl);
        wsRef.current = ws;

        // Timeout de segurança: Se em 10 segundos ninguém aparecer, joga sozinho
        const timeoutAguarde = setTimeout(() => {
            if (ws.readyState !== WebSocket.OPEN || tela === 'procurando') {
                ws.close();
                iniciarJogoLocal();
            }
        }, 10000); 

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'join_queue', userId: user?.id, livro }));
        };

        ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.type === 'match_found') {
                clearTimeout(timeoutAguarde);
                setPerguntas(msg.perguntas);
                setTela('jogo');
            }
        };

        ws.onerror = () => {
            clearTimeout(timeoutAguarde);
            iniciarJogoLocal();
        };
    };

    const iniciarJogoLocal = () => {
        let p = PERGUNTAS_JSON.filter(x => livro === 'Todos' || x.livro === livro);
        if (p.length < 5) p = PERGUNTAS_JSON;
        const embaralhadas = p.sort(() => Math.random() - 0.5).slice(0, 5);
        setPerguntas(embaralhadas);
        setIdx(0); setPontos(0); setCombo(0); setTempo(TEMPO_MAX);
        setTela('jogo');
    };

    // LÓGICA DE RESPOSTA
    const handleResposta = (i) => {
        if (resp !== null) return;
        setResp(i);
        const correta = perguntas[idx].certa ?? perguntas[idx].r; // Aceita 'certa' ou 'r'
        
        if (i === correta) {
            const ptsGanhos = 10 + Math.floor(tempo/2) + (combo * 2);
            setPontos(p => p + ptsGanhos);
            setCombo(c => c + 1);
            setFeedback('correto');
        } else {
            setCombo(0);
            setFeedback('errado');
        }

        setTimeout(() => {
            if (idx + 1 < perguntas.length) {
                setIdx(idx + 1); setResp(null); setFeedback(null); setTempo(TEMPO_MAX);
            } else {
                setTela('resultado');
            }
        }, 1500);
    };

    useEffect(() => {
        if (tela === 'jogo' && resp === null) {
            if (tempo > 0) {
                timerRef.current = setTimeout(() => setTempo(t => t - 1), 1000);
            } else {
                handleResposta(-1);
            }
        }
        return () => clearTimeout(timerRef.current);
    }, [tempo, tela, resp]);

    if (tela === 'lobby') return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🏆 Desafio Bíblico</h1>
                <div style={styles.gridLivros}>
                    {LIVROS.map(l => (
                        <button key={l} onClick={() => setLivro(l)}
                            style={{...styles.btnLivro, backgroundColor: livro === l ? '#FFD700' : 'rgba(255,255,255,0.1)'}}>
                            {l}
                        </button>
                    ))}
                </div>
                <button onClick={buscarOponente} style={styles.btnPrincipal}>BUSCAR OPONENTE</button>
            </div>
        </div>
    );

    if (tela === 'procurando') return (
        <div style={styles.container}>
            <div style={styles.loader}></div>
            <h2 style={{marginTop: 20}}>Aguardando outro jogador...</h2>
            <p>Tema: {livro}</p>
        </div>
    );

    if (tela === 'jogo' && perguntas[idx]) {
        const p = perguntas[idx];
        return (
            <div style={styles.container}>
                <div style={styles.headerJogo}>
                    <span>Questão {idx + 1}/5</span>
                    <span style={{color: '#FFD700'}}>Pontos: {pontos}</span>
                </div>
                <div style={styles.barraFundo}>
                    <div style={{...styles.barraProgresso, width: `${(tempo/TEMPO_MAX)*100}%`, backgroundColor: tempo < 5 ? '#ff4d4d' : '#4CAF50'}}></div>
                </div>
                <div style={styles.cardPergunta}>
                    {combo > 1 && <div style={styles.comboBadge}>COMBO X{combo} 🔥</div>}
                    <h2 style={styles.perguntaTexto}>{getTxt(p)}</h2>
                </div>
                <div style={styles.gridRespostas}>
                    {getOpts(p).map((opt, i) => (
                        <button key={i} disabled={resp !== null} onClick={() => handleResposta(i)}
                            style={{
                                ...styles.btnResposta,
                                backgroundColor: resp === i ? (feedback === 'correto' ? '#2ecc71' : '#e74c3c') : 'white',
                                color: resp === i ? 'white' : '#333'
                            }}>{opt}</button>
                    ))}
                </div>
            </div>
        );
    }

    if (tela === 'resultado') return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Fim de Jogo!</h2>
                <div style={styles.pontuacaoFinal}>{pontos}</div>
                <button onClick={() => setTela('lobby')} style={styles.btnPrincipal}>JOGAR NOVAMENTE</button>
            </div>
        </div>
    );

    return null;
}

const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: 'white', fontFamily: 'sans-serif' },
    card: { background: 'rgba(0,0,0,0.6)', padding: 40, borderRadius: 25, textAlign: 'center', maxWidth: 450, width: '100%' },
    title: { fontSize: 32, marginBottom: 20 },
    gridLivros: { display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 30 },
    btnLivro: { border: '1px solid rgba(255,255,255,0.3)', padding: '8px 15px', borderRadius: 20, color: 'white', cursor: 'pointer' },
    btnPrincipal: { width: '100%', padding: 18, borderRadius: 15, border: 'none', backgroundColor: '#FFD700', color: '#000', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' },
    loader: { width: 50, height: 50, border: '5px solid #FFF', borderBottomColor: 'transparent', borderRadius: '50%', animation: 'rotation 1s linear infinite' },
    headerJogo: { width: '100%', maxWidth: 500, display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
    barraFundo: { width: '100%', maxWidth: 500, height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, marginBottom: 20, overflow: 'hidden' },
    barraProgresso: { height: '100%', transition: '1s linear' },
    cardPergunta: { width: '100%', maxWidth: 500, background: 'white', padding: 30, borderRadius: 20, color: '#333', marginBottom: 20, position: 'relative', textAlign: 'center' },
    perguntaTexto: { fontSize: 22, margin: 0 },
    comboBadge: { position: 'absolute', top: -15, right: -10, backgroundColor: '#ff4757', color: 'white', padding: '5px 12px', borderRadius: 15, fontWeight: 'bold' },
    gridRespostas: { width: '100%', maxWidth: 500, display: 'grid', gap: 10 },
    btnResposta: { padding: 20, borderRadius: 15, border: 'none', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
    pontuacaoFinal: { fontSize: 80, fontWeight: 'bold', color: '#FFD700', margin: '20px 0' }
};
