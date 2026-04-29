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
    const [ranking, setRanking] = useState([]);
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

    // BUSCAR RANKING TOP 10
    useEffect(() => {
        const carregarRanking = async () => {
            try {
                const res = await fetch('https://sigo-com-fe-api.onrender.com/api/quiz/ranking?limit=10');
                const data = await res.json();
                if (Array.isArray(data)) setRanking(data);
            } catch (e) { console.error("Erro ranking:", e); }
        };
        carregarRanking();
    }, []);

    const getTxt = (obj) => {
        if (!obj) return '';
        return obj[`pergunta_${lang}`] || obj[`p_${lang}`] || obj[`q_${lang}`] || obj.pergunta || obj.q;
    };

    const getOpts = (obj) => {
        if (!obj) return [];
        return obj[`opcoes_${lang}`] || obj[`opts_${lang}`] || obj.opcoes || obj.opts || [];
    };

    const compartilharJogo = () => {
        const link = `https://sigocomfe.com/desafio`;
        const texto = `Desafio você no Desafio Bíblico! Tema: ${livro}. Entre aqui: ${link}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
    };

    const buscarOponente = () => {
        setTela('procurando');
        const socketUrl = 'wss://sigo-com-fe-api.onrender.com/ws';
        const ws = new WebSocket(socketUrl);
        wsRef.current = ws;

        const timeoutAguarde = setTimeout(() => {
            if (ws.readyState !== WebSocket.OPEN || tela === 'procurando') {
                ws.close();
                iniciarJogoLocal();
            }
        }, 8000); 

        ws.onopen = () => ws.send(JSON.stringify({ type: 'join_queue', userId: user?.id, livro }));
        ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.type === 'match_found') {
                clearTimeout(timeoutAguarde);
                setPerguntas(msg.perguntas);
                setTela('jogo');
            }
        };
        ws.onerror = () => { clearTimeout(timeoutAguarde); iniciarJogoLocal(); };
    };

    const iniciarJogoLocal = () => {
        let p = PERGUNTAS_JSON.filter(x => livro === 'Todos' || x.livro === livro);
        if (p.length < 5) p = PERGUNTAS_JSON;
        setPerguntas(p.sort(() => Math.random() - 0.5).slice(0, 5));
        setIdx(0); setPontos(0); setCombo(0); setTempo(TEMPO_MAX);
        setTela('jogo');
    };

    const handleResposta = (i) => {
        if (resp !== null) return;
        setResp(i);
        const correta = perguntas[idx].certa ?? perguntas[idx].r;
        if (i === correta) {
            setPontos(p => p + 10 + Math.floor(tempo/2) + (combo * 2));
            setCombo(c => c + 1);
            setFeedback('correto');
        } else {
            setCombo(0);
            setFeedback('errado');
        }
        setTimeout(() => {
            if (idx + 1 < perguntas.length) {
                setIdx(idx + 1); setResp(null); setFeedback(null); setTempo(TEMPO_MAX);
            } else { setTela('resultado'); }
        }, 1500);
    };

    useEffect(() => {
        if (tela === 'jogo' && resp === null) {
            if (tempo > 0) { timerRef.current = setTimeout(() => setTempo(t => t - 1), 1000); }
            else { handleResposta(-1); }
        }
        return () => clearTimeout(timerRef.current);
    }, [tempo, tela, resp]);

    if (tela === 'lobby') return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🏆 Desafio Bíblico</h1>
                <p style={{marginBottom: 20, opacity: 0.9}}>Escolha um tema para começar</p>
                <div style={styles.gridLivros}>
                    {LIVROS.map(l => (
                        <button key={l} onClick={() => setLivro(l)}
                            style={{...styles.btnLivro, backgroundColor: livro === l ? '#FFD700' : 'rgba(255,255,255,0.1)'}}>
                            {l}
                        </button>
                    ))}
                </div>
                <button onClick={buscarOponente} style={styles.btnPrincipal}>JOGAR AGORA</button>
                <button onClick={compartilharJogo} style={styles.btnSecundario}>CONVIDAR AMIGO</button>

                <hr style={{margin: '30px 0', border: '0.5px solid rgba(255,255,255,0.2)'}} />
                
                <h3 style={{marginBottom: 15, fontSize: 18}}>🌟 Top 10 Mundial</h3>
                <div style={styles.rankingList}>
                    {ranking.map((player, i) => (
                        <div key={i} style={styles.rankItem}>
                            <span style={{width: 25, fontWeight: 'bold'}}>{i+1}º</span>
                            <img src={player.photo_url || player.avatar_url || 'https://via.placeholder.com/40'} style={styles.rankAvatar} alt="user" />
                            <span style={{flex: 1, textAlign: 'left', marginLeft: 10, fontSize: 14}}>{player.full_name || 'Jogador'}</span>
                            <span style={{color: '#FFD700', fontWeight: 'bold'}}>{player.total_pontos || 0} pts</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (tela === 'procurando') return (
        <div style={styles.container}>
            <div style={styles.loader}></div>
            <h2 style={{marginTop: 20}}>Buscando oponente...</h2>
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
                <button onClick={() => setTela('lobby')} style={styles.btnPrincipal}>VOLTAR AO INÍCIO</button>
            </div>
        </div>
    );

    return null;
}

const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: 'white', fontFamily: 'sans-serif' },
    card: { background: 'rgba(0,0,0,0.7)', padding: 30, borderRadius: 25, textAlign: 'center', maxWidth: 450, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
    title: { fontSize: 28, marginBottom: 10 },
    gridLivros: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 },
    btnLivro: { border: '1px solid rgba(255,255,255,0.3)', padding: '6px 12px', borderRadius: 20, color: 'white', cursor: 'pointer', fontSize: 13 },
    btnPrincipal: { width: '100%', padding: 16, borderRadius: 15, border: 'none', backgroundColor: '#FFD700', color: '#000', fontWeight: 'bold', fontSize: 16, cursor: 'pointer', marginBottom: 10 },
    btnSecundario: { width: '100%', padding: 12, borderRadius: 15, border: '1px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
    rankingList: { display: 'flex', flexDirection: 'column', gap: 10 },
    rankItem: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: 12 },
    rankAvatar: { width: 35, height: 35, borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFD700' },
    loader: { width: 40, height: 40, border: '4px solid #FFF', borderBottomColor: 'transparent', borderRadius: '50%', animation: 'rotation 1s linear infinite' },
    headerJogo: { width: '100%', maxWidth: 500, display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
    barraFundo: { width: '100%', maxWidth: 500, height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 20, overflow: 'hidden' },
    barraProgresso: { height: '100%', transition: '1s linear' },
    cardPergunta: { width: '100%', maxWidth: 500, background: 'white', padding: 25, borderRadius: 20, color: '#333', marginBottom: 20, position: 'relative', textAlign: 'center' },
    perguntaTexto: { fontSize: 20, margin: 0 },
    comboBadge: { position: 'absolute', top: -15, right: -10, backgroundColor: '#ff4757', color: 'white', padding: '5px 12px', borderRadius: 15, fontWeight: 'bold', fontSize: 12 },
    gridRespostas: { width: '100%', maxWidth: 500, display: 'grid', gap: 10 },
    btnResposta: { padding: 18, borderRadius: 15, border: 'none', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
    pontuacaoFinal: { fontSize: 60, fontWeight: 'bold', color: '#FFD700', margin: '15px 0' }
};
