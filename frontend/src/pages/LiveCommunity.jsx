import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useTranslation } from 'react-i18next';
import GuestPrompt from '../components/GuestPrompt';
import { Music, Users, Send, Play, Pause } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function LiveCommunity() {
  const { user, isGuest } = useAuth();
  const { send, on, off } = useWebSocket();
  const { t } = useTranslation();

  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  // Carregar playlist
  useEffect(() => {
    fetch(`${API_BASE}/api/live-community/playlist`)
      .then(r => r.json())
      .then(data => setSongs(data.songs || []))
      .catch(() => {});
  }, []);

  // Carregar stats
  useEffect(() => {
    fetch(`${API_BASE}/api/live-community/stats`)
      .then(r => r.json())
      .then(data => setOnlineCount(data.onlineCount || 0))
      .catch(() => {});
  }, []);

  // WebSocket chat
  useEffect(() => {
    if (!send || !on || !off) return;
    
    const handleMessage = (data) => {
      setChatMessages(prev => [...prev, data].slice(-100)); // últimas 100
    };

    on('live_chat_broadcast', handleMessage);
    
    if (user && !isGuest) {
      send({ type: 'live_join', userId: user.id, userName: user.full_name, userAvatar: user.avatar_url });
    }

    return () => {
      off('live_chat_broadcast', handleMessage);
      if (user && !isGuest) send({ type: 'live_leave', userId: user.id });
    };
  }, [send, on, off, user, isGuest]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Atualizar src da música quando mudar
  useEffect(() => {
    if (songs.length > 0 && audioRef.current) {
      audioRef.current.src = songs[currentSongIndex]?.file_url;
      // Se já estava tocando, continuar tocando a próxima
      if (hasStarted && isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentSongIndex, songs]);

  const handleSendMessage = () => {
    if (!user || isGuest) {
      setShowGuestPrompt(true);
      return;
    }
    if (!messageInput.trim()) return;
    
    send({
      type: 'live_chat_message',
      userId: user.id,
      userName: user.full_name,
      userAvatar: user.avatar_url,
      message: messageInput,
    });
    setMessageInput('');
  };

  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (!hasStarted) {
      setHasStarted(true);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Play error:', err);
          setIsPlaying(false);
        });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '16px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        🎵 {t('live.title', 'Comunidade ao Vivo 24h')}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Coluna Esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Music Player */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Music size={20} /> {t('live.nowPlaying', 'Tocando agora')}
            </h3>
            {songs[currentSongIndex] && (
              <div>
                <p style={{ fontWeight: 600, margin: '4px 0' }}>{songs[currentSongIndex].title}</p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{songs[currentSongIndex].artist}</p>
              </div>
            )}
            
            {/* Big Play Button (primeiro clique necessário para permitir autoplay) */}
            {!hasStarted && (
              <button
                onClick={togglePlay}
                style={{
                  width: '100%',
                  padding: '20px',
                  marginTop: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontWeight: 600,
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Play size={24} /> Começar a ouvir
              </button>
            )}

            {/* Audio controls (aparece depois do primeiro play) */}
            {hasStarted && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                  <button
                    onClick={togglePlay}
                    style={{
                      padding: '12px 24px',
                      background: isPlaying ? '#764ba2' : '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      flex: 1,
                      justifyContent: 'center',
                    }}
                  >
                    {isPlaying ? <><Pause size={18} /> Pausar</> : <><Play size={18} /> Tocar</>}
                  </button>
                  <button
                    onClick={nextSong}
                    style={{
                      padding: '12px 24px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Próxima →
                  </button>
                </div>
                <audio
                  ref={audioRef}
                  onEnded={nextSong}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </div>
            )}
          </div>

          {/* Online Users */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} /> +{onlineCount} {t('live.online', 'online')}
            </h3>
          </div>

          {/* Live Chat */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 12px' }}>💬 Chat ao Vivo</h3>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', padding: '8px' }}>
              {chatMessages.length === 0 && (
                <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>
                  Nenhuma mensagem ainda... Seja o primeiro! 👋
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ marginBottom: '8px', padding: '8px', background: '#f9f9f9', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#667eea' }}>{msg.userName}: </span>
                  <span>{msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={user && !isGuest ? t('live.typeMessage', 'Escreve uma mensagem...') : '🔒 Cria conta para participar'}
                disabled={!user || isGuest}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <button onClick={handleSendMessage} disabled={!user || isGuest} style={{ padding: '10px 16px', borderRadius: '8px', background: '#667eea', color: 'white', border: 'none', cursor: 'pointer' }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: 'fit-content' }}>
          {user && !isGuest ? (
            <div>
              <h3>{t('live.welcome', 'Bem-vindo')}, {user.full_name}!</h3>
              <p>{t('live.enjoy', 'Aproveita a comunidade ao vivo!')}</p>
            </div>
          ) : (
            <div>
              <h3>{t('live.joinCommunity', 'Junta-te à comunidade!')}</h3>
              <p>{t('live.createAccount', 'Cria uma conta para participar no chat.')}</p>
              <button onClick={() => window.location.href = '/cadastro'} style={{ width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginTop: '12px' }}>
                ✨ {t('live.signUp', 'Criar conta grátis')}
              </button>
            </div>
          )}
        </div>

      </div>

      <GuestPrompt show={showGuestPrompt} onClose={() => setShowGuestPrompt(false)} feature="o chat ao vivo" />
    </div>
  );
}
