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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  const commonEmojis = ['😊', '❤️', '🙏', '✨', '🙌', '🔥', '💪', '🎵', '📖', '⛪', '🕊️', '🌟', '💫', '🎉', '👏'];

  // Carregar playlist
  useEffect(() => {
    console.log('🎵 Carregando playlist...');
    fetch(`${API_BASE}/api/live-community/playlist`)
      .then(r => r.json())
      .then(data => {
        console.log(`✅ ${data.songs?.length || 0} músicas carregadas`, data.songs);
        setSongs(data.songs || []);
      })
      .catch((err) => {
        console.error('❌ Erro ao carregar playlist:', err);
      });
  }, []);

  // Marcar como online e atualizar stats
  useEffect(() => {
    const markOnline = () => {
      if (user && !isGuest) {
        fetch(`${API_BASE}/api/live-community/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })
          .then(r => r.json())
          .then(data => {
            console.log(`✅ Online na live: ${data.onlineCount} usuários`);
            setOnlineCount(data.onlineCount || 1);
          })
          .catch(() => {});
      } else {
        // Visitante - só pegar contador
        fetch(`${API_BASE}/api/live-community/stats`)
          .then(r => r.json())
          .then(data => setOnlineCount(data.onlineCount || 0))
          .catch(() => {});
      }
    };

    markOnline();
    const interval = setInterval(markOnline, 30000); // Refresh a cada 30s

    return () => {
      clearInterval(interval);
      // Marcar como offline ao sair
      if (user && !isGuest) {
        fetch(`${API_BASE}/api/live-community/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        }).catch(() => {});
      }
    };
  }, [user, isGuest]);

  // WebSocket chat
  useEffect(() => {
    if (!send || !on || !off) {
      console.log('⚠️ WebSocket não disponível (send/on/off)', { send: !!send, on: !!on, off: !!off });
      return;
    }
    
    console.log('🔌 Conectando ao chat WebSocket...');
    
    const handleMessage = (data) => {
      console.log('💬 Mensagem recebida:', data);
      setChatMessages(prev => [...prev, data].slice(-100)); // últimas 100
    };

    on('live_chat_broadcast', handleMessage);
    
    if (user && !isGuest) {
      console.log('✅ Enviando live_join para WebSocket...', user.full_name);
      send({ type: 'live_join', userId: user.id, userName: user.full_name, userAvatar: user.avatar_url });
    } else {
      console.log('👁️ Usuário visitante (não envia live_join)');
    }

    return () => {
      off('live_chat_broadcast', handleMessage);
      if (user && !isGuest) {
        console.log('👋 Enviando live_leave...');
        send({ type: 'live_leave', userId: user.id });
      }
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
      console.log('⚠️ Guest tentou enviar mensagem');
      setShowGuestPrompt(true);
      return;
    }
    if (!messageInput.trim()) {
      console.log('⚠️ Mensagem vazia');
      return;
    }
    
    console.log('📤 Enviando mensagem:', messageInput);
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
    if (!audioRef.current) {
      console.error('❌ audioRef não existe');
      return;
    }
    
    if (!hasStarted) {
      console.log('▶️ Primeiro play - iniciando...');
      setHasStarted(true);
    }
    
    if (isPlaying) {
      console.log('⏸️ Pausando...');
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      console.log('▶️ Tocando...', audioRef.current.src);
      audioRef.current.play()
        .then(() => {
          console.log('✅ Play iniciado com sucesso');
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error('❌ Erro ao tocar:', err);
          setIsPlaying(false);
        });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '0' }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '0',
        padding: '24px 16px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#333' }}>
          🔴 {t('live.title', 'Comunidade ao Vivo 24h')}
        </h1>
        <p style={{ margin: '8px 0 0', color: '#666', fontSize: '0.95rem' }}>
          Louvor contínuo e comunidade em oração
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', maxWidth: '100%', margin: '0 auto', height: 'calc(100vh - 120px)' }}>
        
        {/* Coluna Esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Music Player */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(102,126,234,0.2)' }}>
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
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(102,126,234,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} /> +{onlineCount} {t('live.online', 'online')}
            </h3>
          </div>

          {/* Live Chat */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(102,126,234,0.2)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
            <div style={{ position: 'relative' }}>
              {showEmojiPicker && user && !isGuest && (
                <div style={{
                  position: 'absolute',
                  bottom: '60px',
                  left: 0,
                  background: 'white',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                  zIndex: 10,
                }}>
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setMessageInput(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      style={{
                        width: '36px',
                        height: '36px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '22px',
                        borderRadius: '8px',
                        transition: 'background 0.2s',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                {user && !isGuest && (
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: showEmojiPicker ? '#667eea' : '#f0f0f0',
                      color: showEmojiPicker ? 'white' : '#666',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                    }}
                  >
                    😊
                  </button>
                )}
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
        </div>

        {/* Coluna Direita */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(102,126,234,0.2)', height: 'fit-content' }}>
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
