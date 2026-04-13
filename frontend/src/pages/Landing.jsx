import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSwitcher';
import { Music, Users, Send } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Landing() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { send, on, off } = useWebSocket();

  // Chat state
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  // Login/Register state
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Playlist
  useEffect(() => {
    fetch(`${API_BASE}/api/live-community/playlist`)
      .then(r => r.json())
      .then(data => setSongs(data.songs || []))
      .catch(() => {});
  }, []);

  // Stats
  useEffect(() => {
    fetch(`${API_BASE}/api/live-community/stats`)
      .then(r => r.json())
      .then(data => setOnlineCount(data.onlineCount || 0))
      .catch(() => {});
  }, []);

  // WebSocket
  useEffect(() => {
    if (!on) return;
    const handleMessage = (data) => {
      setChatMessages(prev => [...prev, data].slice(-100));
    };
    on('live_chat_broadcast', handleMessage);
    return () => off('live_chat_broadcast', handleMessage);
  }, [on, off]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Play music
  useEffect(() => {
    if (songs.length > 0 && audioRef.current) {
      audioRef.current.src = songs[currentSongIndex]?.file_url;
      audioRef.current.play().catch(() => {});
    }
  }, [currentSongIndex, songs]);

  const nextSong = () => setCurrentSongIndex(prev => (prev + 1) % songs.length);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao entrar');
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar conta');
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  const verse = '"Porque onde dois ou três se reúnem em meu nome, ali estou eu no meio deles." —Mt 18:20';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Nunito, Segoe UI, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: 'white', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src='/logo-new.png' style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} alt="logo" />
          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1877F2', fontFamily: 'Georgia, serif' }}>Sigo com Fé</span>
        </div>
        <LanguageSelector variant="light" />
      </nav>

      {/* MAIN LAYOUT */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 32, alignItems: 'start' }}>

        {/* ===== LADO ESQUERDO: CHAT AO VIVO ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <h1 style={{ textAlign: 'center', color: '#333', margin: '0 0 8px', fontSize: '1.6rem' }}>
            🎵 Comunidade ao Vivo 24h, 7 dias da semana
          </h1>

          {/* Music Player */}
          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Music size={20} /> Tocando agora
            </h3>
            {songs[currentSongIndex] ? (
              <div>
                <p style={{ fontWeight: 600, margin: '4px 0' }}>{songs[currentSongIndex].title}</p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{songs[currentSongIndex].artist}</p>
              </div>
            ) : (
              <p style={{ color: '#999', fontSize: '0.9rem' }}>A carregar músicas...</p>
            )}
            <audio ref={audioRef} controls onEnded={nextSong} style={{ width: '100%', marginTop: 12 }} />
          </div>

          {/* Online count */}
          <div style={{ background: 'white', borderRadius: 12, padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} style={{ color: '#667eea' }} />
            <span style={{ fontWeight: 600 }}>+{onlineCount} em linha</span>
          </div>

          {/* Live Chat */}
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', height: 420 }}>
            <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e74c3c', display: 'inline-block' }} />
              Chat ao Vivo
            </h3>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
              {chatMessages.length === 0 && (
                <p style={{ color: '#bbb', textAlign: 'center', marginTop: 40, fontSize: '0.9rem' }}>Sem mensagens ainda... Entra e participa! 🙏</p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 8, padding: '8px 10px', background: '#f9f9f9', borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: '#667eea' }}>{msg.userName}: </span>
                  <span style={{ color: '#333' }}>{msg.text || msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                disabled
                placeholder="🔒 Entra para participar no chat"
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#f5f5f5', color: '#999', cursor: 'not-allowed' }}
              />
              <button disabled style={{ padding: '10px 16px', borderRadius: 8, background: '#bbb', color: 'white', border: 'none', cursor: 'not-allowed' }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ===== LADO DIREITO: LOGIN/REGISTO ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 72 }}>

          {/* Form card */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', marginBottom: 20, borderBottom: '2px solid #eee' }}>
              <button onClick={() => { setMode('login'); setError(''); }} style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', color: mode === 'login' ? '#1877F2' : '#999', borderBottom: mode === 'login' ? '2px solid #1877F2' : '2px solid transparent', marginBottom: -2 }}>
                Para entrar
              </button>
              <button onClick={() => { setMode('register'); setError(''); }} style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', color: mode === 'register' ? '#42B72A' : '#999', borderBottom: mode === 'register' ? '2px solid #42B72A' : '2px solid transparent', marginBottom: -2 }}>
                Criar conta
              </button>
            </div>

            {error && (
              <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#c0392b', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: '1rem', outline: 'none' }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Senha"
                  required
                  style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: '1rem', outline: 'none' }}
                />
                <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 8, background: '#1877F2', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'A entrar...' : 'Para entrar'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nome completo"
                  required
                  style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: '1rem', outline: 'none' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: '1rem', outline: 'none' }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Senha"
                  required
                  style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: '1rem', outline: 'none' }}
                />
                <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 8, background: '#42B72A', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'A criar...' : '✨ Crea una cuenta gratuita'}
                </button>
              </form>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#eee' }} />
              <span style={{ color: '#999', fontSize: '0.85rem' }}>el</span>
              <div style={{ flex: 1, height: 1, background: '#eee' }} />
            </div>

            <button onClick={handleGoogle} style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'white', border: '1.5px solid #ddd', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} height={20} alt="Google" />
              Iniciar sessão com Google
            </button>

            <button onClick={() => navigate('/comunidade-ao-vivo')} style={{ width: '100%', marginTop: 10, padding: '12px', borderRadius: 8, background: '#667eea', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
              👁 Visita como convidado →
            </button>
          </div>

          {/* Verse */}
          <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <p style={{ color: '#555', fontSize: '0.85rem', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
              {verse}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .landing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
