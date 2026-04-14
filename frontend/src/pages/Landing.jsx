import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Music, Users, Send } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Landing() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { on, off, send } = useWebSocket();

  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(Math.floor(Math.random() * 4) + 4); // 4-7 pessoas
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  const [mode, setMode] = useState(null); // null | 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [landingMsg, setLandingMsg] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorCountry, setVisitorCountry] = useState('');
  const [chatReady, setChatReady] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);

  const startMusic = () => {
    if (!musicStarted && audioRef.current) {
      audioRef.current.volume = 0.15;
      audioRef.current.play().then(() => setMusicStarted(true)).catch(() => {});
    }
  };
  const [showWelcome, setShowWelcome] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 120000); // 2 minutos
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/live-community/playlist`)
      .then(r => r.json()).then(data => setSongs(data.songs || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const uid = 'guest_' + Math.random().toString(36).slice(2,8);
    fetch(`${API_BASE}/api/live-community/join`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid }),
    }).then(r => r.json()).then(d => setOnlineCount(d.onlineCount || 0)).catch(() => {});
    const interval = setInterval(() => {
      // Renovar presenca
      fetch(`${API_BASE}/api/live-community/join`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid }),
      }).then(r => r.json()).then(d => setOnlineCount(d.onlineCount || 0)).catch(() => {});
    }, 60000);
    return () => {
      clearInterval(interval);
      fetch(`${API_BASE}/api/live-community/leave`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid }),
      }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/live-community/stats`)
      .then(r => r.json()).then(data => setOnlineCount(data.onlineCount || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!on || user) return;
    const handleMessage = (data) => setChatMessages(prev => [...prev, data].slice(-100));
    on('live_chat_broadcast', handleMessage);
    return () => off('live_chat_broadcast', handleMessage);
  }, [on, off, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (songs.length > 0 && audioRef.current) {
      audioRef.current.src = songs[currentSongIndex]?.file_url;
      audioRef.current.volume = 0.15;
      audioRef.current.play().catch(() => {});
    }
  }, [currentSongIndex, songs]);

  const nextSong = () => setCurrentSongIndex(prev => (prev + 1) % songs.length);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao entrar');
      login(data.token, data.user);
      navigate('/');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar conta');
      login(data.token, data.user);
      navigate('/');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Erro ao entrar com Google');
    }
  };

  const handleLandingSend = () => {
    if (!landingMsg.trim()) return;
    if (send) {
      send({
        type: 'live_chat_message',
        userId: 'guest_' + Math.random().toString(36).slice(2,7),
        userName: 'Visitante',
        userAvatar: null,
        text: landingMsg,
      });
    }
    setLandingMsg('');
  };

  const toggleMode = (m) => { setMode(prev => prev === m ? null : m); setError(''); };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Nunito, Segoe UI, sans-serif' }} onClick={startMusic}>

      {/* NAV */}
      <nav style={{ background: 'white', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src='/logo-new.png' style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} alt="logo" />
          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1877F2', fontFamily: 'Georgia, serif' }}>Sigo com Fé</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LanguageSelector variant="light" />
          <button onClick={() => toggleMode('login')} style={{ padding: '7px 18px', borderRadius: 6, border: '1.5px solid #1877F2', background: mode === 'login' ? '#1877F2' : 'white', color: mode === 'login' ? 'white' : '#1877F2', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
            {t('landing.login', 'Para entrar')}
          </button>
          <button onClick={() => toggleMode('register')} style={{ padding: '7px 18px', borderRadius: 6, border: 'none', background: '#42B72A', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
            {t('landing.register', t('landing.register'))}
          </button>
        </div>
      </nav>

      {/* DROPDOWN FORM — aparece sob o nav */}
      {mode && (
        <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', padding: '20px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            {error && (
              <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#c0392b', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t("auth.email", "Email")} required
                  style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: '1rem' }} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t("auth.password", "Senha")} required
                  style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: '1rem' }} />
                <button type="submit" disabled={loading}
                  style={{ padding: '12px', borderRadius: 8, background: '#1877F2', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                  {loading ? 'A entrar...' : t('landing.login', 'Para entrar')}
                </button>
                <button type="button" onClick={handleGoogle}
                  style={{ padding: '11px', borderRadius: 8, background: 'white', border: '1.5px solid #ddd', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} height={20} alt="G" />
                  {t('landing.googleLogin', t('landing.googleLogin'))}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t("auth.fullName", "Nome completo")} required
                  style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: '1rem' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t("auth.email", "Email")} required
                  style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: '1rem' }} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t("auth.password", "Senha")} required
                  style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: '1rem' }} />
                <button type="submit" disabled={loading}
                  style={{ padding: '12px', borderRadius: 8, background: '#42B72A', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                  {loading ? 'A criar...' : '✨ ' + t('landing.register', 'Criar conta grátis')}
                </button>
                <button type="button" onClick={handleGoogle}
                  style={{ padding: '11px', borderRadius: 8, background: 'white', border: '1.5px solid #ddd', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} height={20} alt="G" />
                  {t('landing.googleLogin', 'Registar com Google')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '220px 1fr 380px', gap: 20, alignItems: 'start' }}>

        {/* MENU LATERAL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'sticky', top: 72 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              {t('nav.spiritual_life', 'Vida Espiritual')}
            </p>
            {[
              { icon: '🙏', label: t('nav.prayers', 'Orações'), path: '/pedidos-ajuda' },
              { icon: '🔥', label: t('nav.consecration', 'Consagração'), path: '/consagracao' },
              { icon: '☀️', label: t('nav.reflection', 'Reflexão'), path: '/reflexao' },
              { icon: '📖', label: t('course.title', 'Curso Bíblico'), path: '/curso-biblico' },
              { icon: '❤️', label: t('nav.help_life', 'Ajuda'), path: '/ajuda-uma-vida' },
              { icon: '🌍', label: t('nav.journeys', 'Viagens de Fé'), path: '/journeys' },
              { icon: '📔', label: t('nav.diary', 'Diário com Deus'), path: '/diario-com-deus' },
              { icon: '💬', label: t('nav.pastoral_chat', 'Charla Pastoral'), path: '/chat-pastoral' },
            ].map((item, i) => (
              <div key={i} onClick={() => setMode('register')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', color: '#444', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f2ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #eee' }} />
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Menu</p>
            {[
              { icon: '🏠', label: t('nav.mural', 'Mural'), path: '/' },
              { icon: '💬', label: t('nav.messages', 'Mensagens'), path: '/mensagens' },
              { icon: '👥', label: t('nav.friends', 'Amigos'), path: '/amigos' },
              { icon: '👤', label: t('nav.members', 'Membros'), path: '/membros' },
              { icon: '🎵', label: t('nav.music', 'Música'), path: '/musica' },
              { icon: '⛪', label: t('nav.churches', 'Igrejas'), path: '/igrejas' },
              { icon: '👥', label: t('nav.groups', 'Grupos'), path: '/grupos' },
            ].map((item, i) => (
              <div key={i} onClick={() => setMode('register')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', color: '#444', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f2ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
          <div onClick={() => setMode('register')} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 12, padding: '14px 16px', textAlign: 'center', cursor: 'pointer', color: 'white' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '0.9rem' }}>✨ {t('landing.register', 'Criar conta grátis')}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>{t('landing.ctaFree', 'Grátis. Cristão. Para ti.')}</p>
          </div>
        </div>

        {/* ESQUERDA: CHAT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 style={{ textAlign: 'center', color: '#333', margin: '0 0 8px', fontSize: '1.5rem' }}>
            {t('live.title', 'Comunidade ao Vivo 24h')}
          </h1>




          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', height: 500, backgroundImage: 'url(/chat-bg.png)', backgroundSize: '40%', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat', backgroundColor: 'rgba(255,255,255,0.94)' }}>
            <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e74c3c', display: 'inline-block', animation: 'pulse 1.5s infinite' }} /> {t('live.chatTitle', 'Chat ao Vivo')}
              <span style={{ fontSize: '0.8rem', color: '#667eea', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={14} /> +{Math.max(onlineCount, fakeCount.current)} {t('live.online', 'online')}
              </span>
            </h3>
            {!chatReady ? (
              <div style={{ display: 'flex', gap: 6, padding: '6px', borderRadius: 8, margin: '4px 0', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#667eea', fontWeight: 600 }}>🙏</span>
                <input type="text" value={visitorName} onChange={e => setVisitorName(e.target.value)}
                  placeholder={t('live.your_name', 'Nome...')}
                  style={{ flex: 2, minWidth: 80, padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: '0.82rem' }} />
                <select value={visitorCountry} onChange={e => setVisitorCountry(e.target.value)}
                  style={{ flex: 1, minWidth: 60, padding: '5px 6px', borderRadius: 6, border: '1px solid #ddd', fontSize: '0.82rem' }}>
                  <option value="">{t('live.your_country', 'O teu pais...')}</option>
                  <option value="BR">Brasil</option>
                  <option value="PT">Portugal</option>
                  <option value="DE">Alemanha</option>
                  <option value="US">USA</option>
                  <option value="ES">Espanha</option>
                  <option value="FR">Franca</option>
                  <option value="AO">Angola</option>
                  <option value="MZ">Mocambique</option>
                  <option value="CH">Suica</option>
                  <option value="IT">Italia</option>
                  <option value="OTHER">{t('live.other_country', 'Outro')}</option>
                </select>
                <button onClick={() => { if(visitorName.trim()) setChatReady(true); }}
                  disabled={!visitorName.trim()}
                  style={{ padding: '5px 10px', borderRadius: 6, background: visitorName.trim() ? '#667eea' : '#ccc', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.82rem', cursor: visitorName.trim() ? 'pointer' : 'not-allowed' }}>
                  {t('live.enter_chat', 'Entrar no chat')} 🙏
                </button>
              </div>
            ) : (
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>

              {chatMessages.length === 0 && (
                <p style={{ color: '#bbb', textAlign: 'center', marginTop: 20, fontSize: '0.9rem' }}>{t("live.noMessages", "Sem mensagens ainda... Entra e participa!")} 🙏</p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 8, padding: '8px 10px', background: '#f9f9f9', borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: '#667eea' }}>{msg.userName}: </span>
                  <span>{msg.text || msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>)}
            {chatReady && <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" placeholder={t("live.typeMessage", "Escreve uma mensagem...")}
                value={landingMsg}
                onChange={e => setLandingMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLandingSend()}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd' }} />
              <button onClick={handleLandingSend} style={{ padding: '10px 16px', borderRadius: 8, background: '#667eea', color: 'white', border: 'none', cursor: 'pointer' }}>
                <Send size={18} />
              </button>
            </div>}
          </div>
          {showWelcome && <div style={{ background: 'linear-gradient(135deg, #667eea22, #764ba222)', borderRadius: 12, padding: '14px 16px', border: '1px solid #667eea33' }}>
            <p style={{ margin: '0 0 8px', color: '#333', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 700, color: '#667eea' }}>🙏 Sigo com Fé: </span>
              {t('live.welcome_msg', 'Bem-vindo! Deus te abencoe!')}
            </p>
            <p style={{ margin: 0, color: '#555', fontSize: '0.85rem', fontStyle: 'italic' }}>
              <span style={{ fontWeight: 700, color: '#daa520' }}>📖 </span>
              {t('live.daily_verse', '"O Senhor e o meu pastor." - Sl 23:1')}
            </p>
          </div>}
          <div style={{ background: 'white', borderRadius: 12, padding: '10px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Music size={18} style={{ color: '#667eea', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, margin: 0, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{songs[currentSongIndex]?.title || t("common.loading", "A carregar...")}</p>
              <audio ref={audioRef} controls onEnded={nextSong} style={{ width: '100%', height: 32, marginTop: 4 }} />
            </div>
          </div>
        </div>

        {/* DIREITA: IMAGEM + INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 72 }}>

          {/* Imagem principal */}
          <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <img src="/avatar2.jpg" alt="Sigo com Fé" style={{ width: '100%', height: 380, objectFit: 'cover', objectPosition: 'center bottom' }} />
            <div style={{ padding: '20px' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.3rem', color: '#1877F2', fontFamily: 'Georgia, serif' }}>{t('landing.tagline', 'Sigo adelante con fe.')}</h2>
              <p style={{ color: '#555', fontSize: '0.9rem', margin: '0 0 16px', lineHeight: 1.6 }}>
                {t('landing.headline2', 'Quizás no sea una coincidencia...')}
              </p>
              <p style={{ color: '#777', fontSize: '0.85rem', margin: '0 0 16px', lineHeight: 1.6 }}>
                Conéctate con verdaderos cristianos, ora, crece en la fe y encuentra una comunidad que te edifique.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[t('landing.msg1'),
                  t('landing.msg2'),
                  t('landing.msg3')].map((txt, i) => (
                  <div key={i} style={{ background: '#f8f9ff', borderLeft: '3px solid #1877F2', borderRadius: 6, padding: '8px 12px', fontSize: '0.85rem', color: '#444', fontStyle: 'italic' }}>
                    {txt}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Versículo */}
          <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <p style={{ color: '#555', fontSize: '0.85rem', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
              {t('landing.verse')}
            </p>
          </div>

          {/* Botão convidado */}
          
        </div>
      </div>
    </div>
  );
}
