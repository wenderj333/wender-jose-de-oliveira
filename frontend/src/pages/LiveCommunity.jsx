import React, { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Music, Pause, Play, Send, ShieldCheck, Users, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import GuestPrompt from '../components/GuestPrompt';

const API_BASE = import.meta.env.VITE_API_URL || '';
const card = { background: '#fff', border: '1px solid #e0e6f5', borderRadius: 18, boxShadow: '0 8px 28px rgba(74,128,212,0.08)' };

export default function LiveCommunity() {
  const { user, isGuest } = useAuth();
  const { send, on, off } = useWebSocket();
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/live-community/playlist`).then(r => r.json()).then(data => setSongs(data.songs || [])).catch(() => {});
    fetch(`${API_BASE}/api/live-community/stats`).then(r => r.json()).then(data => setOnlineCount(Number(data.onlineCount) || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!send || !on || !off) return undefined;
    const handleMessage = data => setChatMessages(prev => {
      if (data?.id && prev.some(message => message.id === data.id)) return prev;
      return [...prev, data].slice(-100);
    });
    on('live_chat_broadcast', handleMessage);
    if (user && !isGuest) send({ type: 'live_join', userId: user.id, userName: user.full_name, userAvatar: user.avatar_url });
    return () => { off('live_chat_broadcast', handleMessage); if (user && !isGuest) send({ type: 'live_leave', userId: user.id }); };
  }, [send, on, off, user, isGuest]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
  useEffect(() => { if (songs.length && audioRef.current) audioRef.current.src = songs[currentSongIndex]?.file_url || ''; }, [songs, currentSongIndex]);

  const sendMessage = () => {
    if (!user || isGuest) return setShowGuestPrompt(true);
    const text = messageInput.trim();
    if (!text || !send) return;
    send({ type: 'live_chat_message', userId: user.id, userName: user.full_name, userAvatar: user.avatar_url, text });
    setMessageInput('');
  };
  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio || !songs.length) return;
    if (isPlaying) { audio.pause(); return; }
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };
  const nextSong = () => setCurrentSongIndex(index => songs.length ? (index + 1) % songs.length : 0);
  const onlineLabel = onlineCount === 1 ? '1 pessoa nesta sala agora' : `${onlineCount} pessoas nesta sala agora`;

  return <div style={{ minHeight: '100vh', padding: '20px 0 36px', color: '#1e2240' }}>
    <section style={{ maxWidth: 1120, margin: '0 auto 18px', padding: '0 8px' }}>
      <div style={{ background: 'linear-gradient(120deg,#3568b8,#6a9ade)', color: '#fff', borderRadius: 20, padding: '26px 30px', boxShadow: '0 12px 28px rgba(53,104,184,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, opacity: .9 }}><MessageCircle size={19}/> Sigo com Fé</div>
        <h1 style={{ margin: '9px 0 7px', fontSize: 'clamp(1.7rem,4vw,2.45rem)' }}>Sala de Conversa Cristã</h1>
        <p style={{ margin: 0, fontSize: '1rem', opacity: .92 }}>Um espaço de fé, oração e amizade. Fale com respeito e acolha quem chega.</p>
      </div>
    </section>
    <div className="christian-chat-layout" style={{ maxWidth: 1120, margin: '0 auto', padding: '0 8px', display: 'grid', gridTemplateColumns: 'minmax(0,1.8fr) minmax(260px,.8fr)', gap: 18 }}>
      <section style={{ ...card, minHeight: 540, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '18px 20px', borderBottom: '1px solid #e0e6f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div><h2 style={{ margin: 0, fontSize: '1.15rem' }}>Conversa da sala</h2><p style={{ margin: '4px 0 0', color: '#7b83a6', fontSize: 13 }}>Partilhe uma palavra, um versículo ou um pedido de oração.</p></div>
          <span style={{ background: onlineCount ? '#eaf7ef' : '#f4f6fa', color: onlineCount ? '#287a4b' : '#667085', borderRadius: 999, padding: '8px 10px', fontSize: 12, fontWeight: 700 }}><Users size={14} style={{ verticalAlign: 'middle', marginRight: 5 }}/>{onlineLabel}</span>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#fbfcff' }}>
          {!chatMessages.length && <div style={{ maxWidth: 390, margin: '80px auto 0', textAlign: 'center', color: '#667085' }}><MessageCircle size={35} style={{ color: '#4a80d4', marginBottom: 10 }}/><h3 style={{ margin: '0 0 8px', color: '#1e2240' }}>A sala está pronta</h3><p style={{ margin: 0, lineHeight: 1.6 }}>Escreva uma saudação, um versículo ou um pedido de oração. A primeira mensagem começa a conversa.</p></div>}
          {chatMessages.map((message, index) => <article key={message.id || `${message.userName}-${index}`} style={{ marginBottom: 12, padding: '11px 13px', background: '#fff', border: '1px solid #e6ebf6', borderRadius: '4px 14px 14px 14px', maxWidth: '85%' }}><strong style={{ color: '#3568b8', fontSize: 13 }}>{message.userName || 'Membro'}</strong><p style={{ margin: '4px 0 0', lineHeight: 1.45 }}>{message.text || message.message}</p></article>)}
          <div ref={chatEndRef} />
        </div>
        <footer style={{ padding: 14, borderTop: '1px solid #e0e6f5', display: 'flex', gap: 9 }}>
          <input value={messageInput} onChange={event => setMessageInput(event.target.value)} onKeyDown={event => event.key === 'Enter' && sendMessage()} onFocus={() => (!user || isGuest) && setShowGuestPrompt(true)} placeholder={user && !isGuest ? 'Escreva para a sala...' : 'Crie uma conta gratuita para participar'} readOnly={!user || isGuest} style={{ minWidth: 0, flex: 1, padding: '12px 14px', border: '1px solid #d7dfef', borderRadius: 12, fontSize: 14, outlineColor: '#4a80d4' }}/>
          <button onClick={sendMessage} aria-label="Enviar mensagem" style={{ width: 46, border: 0, borderRadius: 12, background: '#3568b8', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Send size={19}/></button>
        </footer>
      </section>
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <section style={{ ...card, padding: 18 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3568b8', fontWeight: 800 }}><ShieldCheck size={19}/> Como cuidamos da sala</div><ul style={{ paddingLeft: 18, margin: '13px 0 0', color: '#59627d', fontSize: 13, lineHeight: 1.65 }}><li>Fale com respeito e gentileza.</li><li>Não publique dados pessoais ou conteúdo ofensivo.</li><li>Pedidos urgentes precisam de ajuda local profissional.</li></ul></section>
        <section style={{ ...card, padding: 18 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}><Heart size={19} color="#c49a28"/> Uma sala para acolher</div><p style={{ color: '#667085', fontSize: 13, lineHeight: 1.6, marginBottom: 0 }}>Todos podem ouvir. Para escrever e conhecer a comunidade, entre com a sua conta gratuita.</p></section>
        <section style={{ ...card, padding: 18 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}><Music size={19} color="#6c3fa0"/> Louvor ambiente</div>{songs[currentSongIndex] ? <><p style={{ fontSize: 14, margin: '11px 0 3px', fontWeight: 700 }}>{songs[currentSongIndex].title}</p><p style={{ color: '#7b83a6', fontSize: 12, margin: '0 0 12px' }}>{songs[currentSongIndex].artist}</p></> : <p style={{ color: '#7b83a6', fontSize: 13 }}>Nenhuma música selecionada agora.</p>}<div style={{ display: 'flex', gap: 8 }}><button onClick={toggleMusic} disabled={!songs.length} style={{ flex: 1, border: 0, borderRadius: 10, padding: 10, background: '#6c3fa0', color: '#fff', cursor: songs.length ? 'pointer' : 'not-allowed', fontWeight: 700 }}>{isPlaying ? <><Pause size={15} style={{ verticalAlign: 'middle'}/> Pausar</> : <><Play size={15} style={{ verticalAlign: 'middle'}/> Ouvir</>}</button><button onClick={nextSong} disabled={!songs.length} aria-label="Próxima música" style={{ width: 42, border: '1px solid #d7dfef', borderRadius: 10, background: '#fff', cursor: 'pointer' }}><Volume2 size={17}/></button></div><audio ref={audioRef} onEnded={nextSong} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} /></section>
      </aside>
    </div>
    <style>{`@media(max-width:800px){.christian-chat-layout{grid-template-columns:1fr !important}}`}</style>
    <GuestPrompt show={showGuestPrompt} onClose={() => setShowGuestPrompt(false)} feature="a sala de conversa cristã" />
  </div>;
}
