import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import PERGUNTAS_JSON from '../data/perguntas.json';

const LIVROS = ['Todos', 'Genesis', 'Exodo', 'Salmos', 'Proverbios', 'Mateus', 'Apocalipse'];
const TEMPO = 15;
const bg = { minHeight: '100vh', backgroundImage: 'url(/fundo-desafio.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, color: 'white' };

function filtrar(livro) {
    let p = PERGUNTAS_JSON.filter(x => livro === 'Todos' || x.livro === livro);
    if (!p.length) p = PERGUNTAS_JSON;
    const f = p.filter(x => x.nivel === 'facil').sort(() => Math.random() - 0.5).slice(0, 2);
    const m = p.filter(x => x.nivel === 'medio').sort(() => Math.random() - 0.5).slice(0, 2);
    const d = p.filter(x => x.nivel === 'dificil').sort(() => Math.random() - 0.5).slice(0, 1);
    return [...f, ...m, ...d];
}

export default function DesafioBiblico() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language?.substring(0, 2) || 'pt';
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    function playSound(type) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            if (type === 'click') { o.frequency.value = 600; g.gain.setValueAtTime(0.1, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1); o.start(); o.stop(ctx.currentTime + 0.1); }
            else if (type === 'certo') { o.type = 'sine'; o.frequency.setValueAtTime(523, ctx.currentTime); o.frequency.setValueAtTime(659, ctx.currentTime + 0.1); o.frequency.setValueAtTime(784, ctx.currentTime + 0.2); g.gain.setValueAtTime(0.2, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4); o.start(); o.stop(ctx.currentTime + 0.4); }
            else if (type === 'errado') { o.type = 'sawtooth'; o.frequency.setValueAtTime(200, ctx.currentTime); o.frequency.setValueAtTime(150, ctx.currentTime + 0.1); g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); o.start(); o.stop(ctx.currentTime + 0.3); }
            else if (type === 'conquista') { o.type = 'sine'; o.frequency.setValueAtTime(784, ctx.currentTime); o.frequency.setValueAtTime(988, ctx.currentTime + 0.15); o.frequency.setValueAtTime(1175, ctx.currentTime + 0.3); g.gain.setValueAtTime(0.25, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6); o.start(); o.stop(ctx.currentTime + 0.6); }
            else if (type === 'fim') { o.type = 'sine'; o.frequency.setValueAtTime(523, ctx.currentTime); o.frequency.setValueAtTime(659, ctx.currentTime + 0.2); o.frequency.setValueAtTime(523, ctx.currentTime + 0.4); g.gain.setValueAtTime(0.2, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7); o.start(); o.stop(ctx.currentTime + 0.7); }
        } catch (e) { }
    }

    const ADMIN_EMAIL = 'wenderj333@gmail.com';
    const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const audioRef = useRef(null);
    const [musicUrl, setMusicUrl] = useState(() => localStorage.getItem('desafio_music') || '');
    const [musicPlaying, setMusicPlaying] = useState(false);
    const [musicVolume, setMusicVolume] = useState(0.4);
    const [showMusicAdmin, setShowMusicAdmin] = useState(false);
    const [musicInputVal, setMusicInputVal] = useState(() => localStorage.getItem('desafio_music') || '');
    const [showConquistasModal, setShowConquistasModal] = useState(false);
    const [evento, setEvento] = useState(() => JSON.parse(localStorage.getItem('desafio_evento') || 'null'));
    const [showEventoAdmin, setShowEventoAdmin] = useState(false);
    const [eventoInput, setEventoInput] = useState({ premio: '100', descricao: 'Competicao Biblica', dataFim: '' });

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = musicVolume;
            if (musicPlaying) { audioRef.current.play().catch(() => { }); }
            else { audioRef.current.pause(); }
        }
    }, [musicPlaying, musicVolume, musicUrl]);

    const modoSolo = new URLSearchParams(location.search).get('modo') === 'solo';
    const [soloIdx, setSoloIdx] = useState(0);
    const [soloPerguntas, setSoloPerguntas] = useState([]);
    const [soloResp, setSoloResp] = useState(null);
    const [soloFeedback, setSoloFeedback] = useState(null);
    const [soloPontos, setSoloPontos] = useState(0);
    const [soloTela, setSoloTela] = useState('jogo');
    const [soloTempo, setSoloTempo] = useState(15);
    const soloTimerRef = useRef(null);

    useEffect(() => {
        if (modoSolo) {
            setSoloPerguntas(filtrar('Todos'));
            setSoloIdx(0); setSoloResp(null); setSoloFeedback(null); setSoloPontos(0); setSoloTela('jogo');
        }
    }, [modoSolo]);

    useEffect(() => {
        if (!modoSolo || soloTela !== 'jogo' || soloResp !== null) return;
        setSoloTempo(15);
        clearInterval(soloTimerRef.current);
        soloTimerRef.current = setInterval(() => {
            setSoloTempo(prev => {
                if (prev <= 1) { clearInterval(soloTimerRef.current); soloAvancar(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(soloTimerRef.current);
    }, [soloIdx, modoSolo, soloTela, soloResp]);

    function soloResponder(i) {
        if (soloResp !== null) return;
        clearInterval(soloTimerRef.current);
        setSoloResp(i);
        const q = soloPerguntas[soloIdx];
        const certo = i === q.certa;
        setSoloFeedback(certo);
        if (certo) { playSound('certo'); setSoloPontos(p => p + 10); }
        else playSound('errado');
        setTimeout(() => soloAvancar(), 1500);
    }

    function soloAvancar() {
        const next = soloIdx + 1;
        if (next >= soloPerguntas.length) {
            setSoloTela('fim');
        } else {
            setSoloIdx(next); setSoloResp(null); setSoloFeedback(null);
        }
    }

    const [tela, setTela] = useState('lobby');
    const [livro, setLivro] = useState('Todos');
    const [codigo, setCodigo] = useState('');
    const [cInput, setCInput] = useState('');
    const [esperando, setEsperando] = useState(false);
    const [ranking, setRanking] = useState([]);
    const [conquistas, setConquistas] = useState(() => JSON.parse(localStorage.getItem('desafio_conquistas') || '[]'));
    const [novaConquista, setNovaConquista] = useState(null);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [adversario, setAdversario] = useState(null);

    const CONQUISTAS_DEF = [
        { id: 'first', icon: '⭐', nome: 'Primeira Vitória', desc: 'Completa o teu primeiro jogo', check: (pts, total) => total >= 1 },
        { id: 'streak3', icon: '🔥', nome: 'Em Chamas', desc: '3 respostas certas seguidas', check: (pts, total, streak) => streak >= 3 },
        { id: 'streak5', icon: '💥', nome: 'Imparável', desc: '5 respostas certas seguidas', check: (pts, total, streak) => streak >= 5 },
        { id: 'perfeito', icon: '🏆', nome: 'Jogo Perfeito', desc: '50 pontos num jogo', check: (pts) => pts >= 50 },
    ];

    function verificarConquistas(pts, streakAtual) {
        const stats = JSON.parse(localStorage.getItem('desafio_stats') || '{}');
        const total = (stats.totalJogos || 0);
        const novas = [];
        CONQUISTAS_DEF.forEach(c => {
            if (!conquistas.includes(c.id) && c.check(pts, total, streakAtual)) {
                novas.push(c);
            }
        });
        if (novas.length > 0) {
            const ids = [...conquistas, ...novas.map(c => c.id)];
            setConquistas(ids);
            localStorage.setItem('desafio_conquistas', JSON.stringify(ids));
            setNovaConquista(novas[0]);
            playSound('conquista');
            setTimeout(() => setNovaConquista(null), 4000);
        }
    }

    useEffect(() => {
        fetch((import.meta.env.VITE_API_URL || '') + '/api/quiz/ranking?periodo=semana')
            .then(r => r.json()).then(d => { if (Array.isArray(d)) setRanking(d); }).catch(() => { });
    }, []);

    const wsRef = useRef(null);
    const [perguntas, setPerguntas] = useState([]);
    const [idx, setIdx] = useState(0);
    const [tempo, setTempo] = useState(TEMPO);
    const [pausado, setPausado] = useState(false);
    const [resp, setResp] = useState(null);
    const [pontos, setPontos] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [chat, setChat] = useState([]);
    const [chatMsg, setChatMsg] = useState('');
    const timerRef = useRef(null);
    const tRef = useRef(TEMPO);
    const chatEnd = useRef(null);

    useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

    useEffect(() => {
        if (tela !== 'jogo' || pausado) return;
        setTempo(TEMPO); tRef.current = TEMPO;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTempo(prev => {
                tRef.current = prev - 1;
                if (prev <= 1) { clearInterval(timerRef.current); avancar(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [idx, tela, pausado]);

    function jogarAleatorio() {
        const ws = new WebSocket((window.location.protocol === 'https:' ? 'wss' : 'ws') + '://sigo-com-fe-api.onrender.com/ws');
        wsRef.current = ws;
        setEsperando(true);
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'game_queue', userId: user?.id, userName: user?.full_name, avatar: user?.photo_url || user?.avatar_url, livro }));
        };
        ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.type === 'game_matched') {
                setEsperando(false);
                setCodigo(msg.roomId);
                if (msg.adversario) setAdversario(msg.adversario);
                setPerguntas(msg.perguntas || filtrar(livro));
                setIdx(0); setPontos(0); setResp(null); setFeedback(null); setPausado(false); setChat([]);
                setTela('vs');
                setTimeout(() => setTela('jogo'), 3000);
            }
        };
        ws.onerror = () => { setEsperando(false); alert('Erro ao conectar.'); };
    }

    function iniciar() {
        const ps = filtrar(livro);
        setPerguntas(ps); setIdx(0); setPontos(0); setResp(null); setFeedback(null); setPausado(false); setChat([]);
        setTela('jogo');
        setStreak(0); setMaxStreak(0);
    }

    function responder(i) {
        if (resp !== null || pausado) return;
        clearInterval(timerRef.current);
        setResp(i);
        const p = perguntas[idx];
        const ok = i === p.r;
        const pts = ok ? (tRef.current >= 10 ? 10 : 5) : 0;
        playSound(ok ? 'certo' : 'errado');
        setFeedback({ ok, pts });
        setPontos(prev => prev + pts);
        if (ok) {
            setStreak(prev => {
                const ns = prev + 1;
                setMaxStreak(m => Math.max(m, ns));
                return ns;
            });
        } else {
            setStreak(0);
        }
        setTimeout(avancar, 1500);
    }

    function avancar() {
        setFeedback(null); setResp(null);
        if (idx + 1 >= perguntas.length) {
            const stats = JSON.parse(localStorage.getItem('desafio_stats') || '{}');
            stats.totalJogos = (stats.totalJogos || 0) + 1;
            localStorage.setItem('desafio_stats', JSON.stringify(stats));
            verificarConquistas(pontos, maxStreak);
            playSound('fim');
            setTela('resultado');
        } else {
            setIdx(prev => prev + 1);
        }
    }

    function enviarChat() {
        if (!chatMsg.trim()) return;
        setChat(prev => [...prev, { nome: user?.full_name?.split(' ')[0] || 'Eu', texto: chatMsg }]);
        setChatMsg('');
    }

    const av = user?.photo_url || user?.avatar_url;
    const nm = user?.full_name || 'Jogador';
    const perg = perguntas[idx];

    if (modoSolo) {
        const q = soloPerguntas[soloIdx];
        if (soloTela === 'fim') return (
            <div style={bg}>
                <h2>Resultado Solo</h2>
                <p style={{ fontSize: 48, color: '#f0c040' }}>{soloPontos} pts</p>
                <button onClick={() => navigate('/register')} style={{ padding: 15, background: '#27ae60', color: 'white', borderRadius: 10, border: 'none' }}>Criar conta para Ranking</button>
                <button onClick={() => navigate('/')} style={{ marginTop: 10, background: 'none', color: 'white', border: 'none' }}>Voltar</button>
            </div>
        );
        if (!q) return <div style={bg}>Carregando...</div>;
        return (
            <div style={bg}>
                <p>Pergunta {soloIdx + 1}/{soloPerguntas.length} | {soloTempo}s</p>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 15, textAlign: 'center', width: '100%', maxWidth: 400 }}>
                    <p>{q.pergunta}</p>
                    {q.opcoes.map((op, i) => (
                        <button key={i} onClick={() => soloResponder(i)} style={{ display: 'block', width: '100%', padding: 10, margin: '5px 0', background: soloResp === i ? (soloFeedback ? '#27ae60' : '#e74c3c') : 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 8 }}>{op}</button>
                    ))}
                </div>
            </div>
        );
    }

    if (tela === 'lobby') return (
        <div style={{ minHeight: '100vh', backgroundImage: 'url(/fundo-desafio.jpg)', backgroundSize: 'cover', display: 'flex', color: 'white' }}>
            <div style={{ width: 220, background: 'rgba(0,0,0,0.4)', padding: 20, overflowY: 'auto' }}>
                <p style={{ fontSize: 12, fontWeight: 900, color: '#f0c040' }}>🏆 RANKING SEMANAL</p>
                {ranking.map((j, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 10 }}>#{i + 1}</span>
                        <img src={j.avatar_url || '/default-avatar.png'} style={{ width: 25, height: 25, borderRadius: '50%' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 10, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.full_name}</p>
                            <p style={{ fontSize: 9, color: '#f0c040', margin: 0 }}>{j.total_pontos} pts</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                {evento?.ativo && (
                    <div style={{ background: 'linear-gradient(135deg,#f0c040,#e67e22)', padding: 15, borderRadius: 12, color: '#1a0a3e', textAlign: 'center', marginBottom: 20 }}>
                        <p style={{ fontWeight: 900, margin: 0 }}>{evento.descricao}</p>
                        <p style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>PRÊMIO: €{evento.premio}</p>
                    </div>
                )}

                <h1 style={{ fontSize: 32, fontWeight: 900 }}>Desafio Bíblico</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginBottom: 20 }}>
                    {LIVROS.map(l => (
                        <button key={l} onClick={() => setLivro(l)} style={{ padding: '5px 12px', borderRadius: 20, border: 'none', background: livro === l ? '#f0c040' : 'rgba(255,255,255,0.2)', color: 'white' }}>{l}</button>
                    ))}
                </div>

                <button onClick={jogarAleatorio} style={{ width: 300, padding: 15, background: '#e74c3c', color: 'white', borderRadius: 12, border: 'none', fontWeight: 900, marginBottom: 10 }}>
                    {esperando ? 'Procurando...' : 'JOGAR AGORA'}
                </button>

                {isAdmin && (
                    <div style={{ marginTop: 20 }}>
                        <button onClick={() => setShowMusicAdmin(!showMusicAdmin)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: 5, fontSize: 10 }}>⚙️ Admin Música</button>
                        {showMusicAdmin && (
                            <div style={{ background: 'white', color: 'black', padding: 10, borderRadius: 8, marginTop: 5 }}>
                                <input value={musicInputVal} onChange={e => setMusicInputVal(e.target.value)} placeholder="URL da Música (MP3)" style={{ width: '100%' }} />
                                <button onClick={() => { localStorage.setItem('desafio_music', musicInputVal); setMusicUrl(musicInputVal); }}>Salvar</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {novaConquista && (
                <div style={{ position: 'fixed', top: 20, right: 20, background: '#6c47d4', padding: 15, borderRadius: 12, boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                    <p style={{ margin: 0, fontWeight: 900 }}>{novaConquista.icon} Conquista!</p>
                    <p style={{ margin: 0, fontSize: 12 }}>{novaConquista.nome}</p>
                </div>
            )}
            
            <audio ref={audioRef} src={musicUrl} loop />
        </div>
    );

    if (tela === 'jogo' && perg) return (
        <div style={bg}>
            <div style={{ width: '100%', maxWidth: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span>{idx + 1}/{perguntas.length}</span>
                    <span style={{ color: '#f0c040', fontWeight: 900 }}>{tempo}s</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: 30, borderRadius: 20, textAlign: 'center', marginBottom: 20 }}>
                    <h3>{perg[lang + '_q'] || perg.q}</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {(perg[lang + '_opts'] || perg.opts).map((opt, i) => (
                        <button key={i} onClick={() => responder(i)} style={{ padding: 15, background: resp === i ? (feedback?.ok ? '#27ae60' : '#e74c3c') : 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: 12 }}>{opt}</button>
                    ))}
                </div>
            </div>
        </div>
    );

    if (tela === 'resultado') return (
        <div style={bg}>
            <h1>Fim de Jogo!</h1>
            <p style={{ fontSize: 64, fontWeight: 900, color: '#f0c040' }}>{pontos} pts</p>
            <button onClick={() => setTela('lobby')} style={{ padding: 15, background: '#6c47d4', color: 'white', border: 'none', borderRadius: 12, width: 200 }}>Voltar ao Lobby</button>
        </div>
    );

    return <div style={bg}>Carregando...</div>;
}
