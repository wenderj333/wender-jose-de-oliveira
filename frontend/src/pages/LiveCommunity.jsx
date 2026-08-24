import React, { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Music, Pause, Play, Send, ShieldCheck, Smile, Users, Volume2, Globe2, LockKeyhole, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useTranslation } from 'react-i18next';
import GuestPrompt from '../components/GuestPrompt';
import { getChristianChatCopy } from '../i18n/christianChatCopy';

const API_BASE = import.meta.env.VITE_API_URL || '';
const card = { background: '#fff', border: '1px solid #e0e6f5', borderRadius: 18, boxShadow: '0 8px 28px rgba(74,128,212,0.08)' };
const ROOMS = [
  { id: 'pt', flag: '🇧🇷', title: 'Sala em Português', subtitle: 'Brasil, Portugal e países lusófonos' },
  { id: 'es', flag: '🇪🇸', title: 'Sala en Español', subtitle: 'Hable con hermanos de habla hispana' },
  { id: 'de', flag: '🇩🇪', title: 'Deutschsprachiger Raum', subtitle: 'Gemeinschaft auf Deutsch' },
  { id: 'en', flag: '🇬🇧', title: 'English Prayer Room', subtitle: 'Christian community in English' },
];

export default function LiveCommunity() {
  const { user, isGuest } = useAuth();
  const { i18n } = useTranslation();
  const c = getChristianChatCopy(i18n.language);
  const { send, on, off } = useWebSocket();
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [roomId, setRoomId] = useState(() => (ROOMS.some(room => room.id === i18n.language?.slice(0, 2)) ? i18n.language.slice(0, 2) : 'pt'));
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
    const handleMessage = data => {
      if (data?.roomId && data.roomId !== roomId) return;
      setChatMessages(prev => {
      if (data?.id && prev.some(message => message.id === data.id)) return prev;
      return [...prev, data].slice(-100);
      });
    };
    const handlePresence = data => {
      if (data?.roomId === roomId) setOnlineCount(Number(data.onlineCount) || 0);
    };
    on('live_chat_broadcast', handleMessage);
    on('live_room_presence', handlePresence);
    if (user && !isGuest) send({ type: 'live_join', roomId, userId: user.id, userName: user.full_name, userAvatar: user.avatar_url });
    return () => { off('live_chat_broadcast', handleMessage); off('live_room_presence', handlePresence); if (user && !isGuest) send({ type: 'live_leave', roomId, userId: user.id }); };
  }, [send, on, off, user, isGuest, roomId]);

  useEffect(() => { setChatMessages([]); setOnlineCount(0); }, [roomId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
  useEffect(() => { if (songs.length && audioRef.current) audioRef.current.src = songs[currentSongIndex]?.file_url || ''; }, [songs, currentSongIndex]);

  const sendMessage = () => {
    if (!user || isGuest) return setShowGuestPrompt(true);
    const text = messageInput.trim();
    if (!text || !send) return;
    send({ type: 'live_chat_message', roomId, userId: user.id, userName: user.full_name, userAvatar: user.avatar_url, text });
    setMessageInput('');
  };
  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio || !songs.length) return;
    if (isPlaying) { audio.pause(); return; }
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };
  const nextSong = () => setCurrentSongIndex(index => songs.length ? (index + 1) % songs.length : 0);
  const addEmoji = emoji => {
    setMessageInput(value => `${value}${emoji}`);
    setShowEmojis(false);
  };
  const onlineLabel = c.online(onlineCount);

  return <div style={{ minHeight: '100vh', padding: '20px 0 36px', color: '#1e2240' }}>
    <section style={{ maxWidth: 1120, margin: '0 auto 18px', padding: '0 8px' }}>
      <div style={{ background: 'linear-gradient(120deg,#3568b8,#6a9ade)', color: '#fff', borderRadius: 20, padding: '26px 30px', boxShadow: '0 12px 28px rgba(53,104,184,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, opacity: .9 }}><MessageCircle size={19}/> {c.brand}</div>
        <h1 style={{ margin: '9px 0 7px', fontSize: 'clamp(1.7rem,4vw,2.45rem)' }}>{c.room}</h1>
        <p style={{ margin: 0, fontSize: '1rem', opacity: .92 }}>{c.intro}</p>
      </div>
    </section>
    <div style={{ maxWidth: 1120, margin: '0 auto 18px', padding: '0 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}><div><h2 style={{ margin: 0, fontSize: '1.1rem' }}>Escolha uma sala</h2><p style={{ margin: '4px 0 0', color: '#7b83a6', fontSize: 13 }}>Entre na conversa no idioma que prefere.</p></div><Link to="/mensagens" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#3568b8', textDecoration: 'none', fontWeight: 800, fontSize: 14 }}><LockKeyhole size={16}/> Conversas privadas <ChevronRight size={16}/></Link></div>
      <div className="christian-room-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
        {ROOMS.map(room => <button key={room.id} type="button" onClick={() => setRoomId(room.id)} style={{ textAlign: 'left', padding: 14, borderRadius: 15, border: roomId === room.id ? '2px solid #3568b8' : '1px solid #dce4f2', background: roomId === room.id ? '#edf4ff' : '#fff', cursor: 'pointer', boxShadow: roomId === room.id ? '0 7px 18px rgba(53,104,184,.12)' : 'none' }}><div style={{ fontSize: 21, marginBottom: 7 }}>{room.flag}</div><strong style={{ display: 'block', color: '#1e2240', fontSize: 13 }}>{room.title}</strong><span style={{ display: 'block', color: '#68738f', fontSize: 11, marginTop: 4, lineHeight: 1.35 }}>{room.subtitle}</span></button>)}
      </div>
    </div>
    <div className="christian-chat-layout" style={{ maxWidth: 1120, margin: '0 auto', padding: '0 8px', display: 'grid', gridTemplateColumns: 'minmax(0,1.8fr) minmax(260px,.8fr)', gap: 18 }}>
      <section style={{ ...card, minHeight: 540, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '18px 20px', borderBottom: '1px solid #e0e6f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div><h2 style={{ margin: 0, fontSize: '1.15rem' }}>{ROOMS.find(room => room.id === roomId)?.title || c.conversation}</h2><p style={{ margin: '4px 0 0', color: '#7b83a6', fontSize: 13 }}>{c.share}</p></div>
          <span style={{ background: onlineCount ? '#eaf7ef' : '#f4f6fa', color: onlineCount ? '#287a4b' : '#667085', borderRadius: 999, padding: '8px 10px', fontSize: 12, fontWeight: 700 }}><Users size={14} style={{ verticalAlign: 'middle', marginRight: 5 }}/>{onlineLabel}</span>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#fbfcff' }}>
          {!chatMessages.length && <div style={{ maxWidth: 390, margin: '80px auto 0', textAlign: 'center', color: '#667085' }}><MessageCircle size={35} style={{ color: '#4a80d4', marginBottom: 10 }}/><h3 style={{ margin: '0 0 8px', color: '#1e2240' }}>{c.ready}</h3><p style={{ margin: 0, lineHeight: 1.6 }}>{c.empty}</p></div>}
          {chatMessages.map((message, index) => <article key={message.id || `${message.userName}-${index}`} style={{ marginBottom: 12, padding: '11px 13px', background: '#fff', border: '1px solid #e6ebf6', borderRadius: '4px 14px 14px 14px', maxWidth: '85%' }}><strong style={{ color: '#3568b8', fontSize: 13 }}>{message.userName || 'Membro'}</strong><p style={{ margin: '4px 0 0', lineHeight: 1.45 }}>{message.text || message.message}</p></article>)}
          <div ref={chatEndRef} />
        </div>
        <footer style={{ padding: 14, borderTop: '1px solid #e0e6f5', display: 'flex', gap: 9, position: 'relative' }}>
          {showEmojis && <div style={{ position: 'absolute', left: 14, bottom: 66, zIndex: 4, display: 'flex', gap: 4, flexWrap: 'wrap', width: 238, padding: 9, borderRadius: 12, border: '1px solid #d7dfef', background: '#fff', boxShadow: '0 10px 25px rgba(30,34,64,.18)' }}>
            {['🙏', '❤️', '😊', '🙌', '📖', '✨', '🕊️', '🔥', '👏', '🤍', '🌿', '💬'].map(emoji => <button key={emoji} type="button" onClick={() => addEmoji(emoji)} aria-label={`Adicionar ${emoji}`} style={{ width: 32, height: 32, border: 0, borderRadius: 8, background: '#f5f8ff', cursor: 'pointer', fontSize: 18 }}>{emoji}</button>)}
          </div>}
          <button type="button" onClick={() => setShowEmojis(open => !open)} aria-label="Adicionar emoji" style={{ width: 42, border: '1px solid #d7dfef', borderRadius: 12, background: showEmojis ? '#eaf2ff' : '#fff', color: '#3568b8', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Smile size={19}/></button>
          <input value={messageInput} onChange={event => setMessageInput(event.target.value)} onKeyDown={event => event.key === 'Enter' && sendMessage()} onFocus={() => (!user || isGuest) && setShowGuestPrompt(true)} placeholder={user && !isGuest ? c.write : c.account} readOnly={!user || isGuest} style={{ minWidth: 0, flex: 1, padding: '12px 14px', border: '1px solid #d7dfef', borderRadius: 12, fontSize: 14, outlineColor: '#4a80d4' }}/>
          <button onClick={sendMessage} aria-label="Enviar mensagem" style={{ width: 46, border: 0, borderRadius: 12, background: '#3568b8', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Send size={19}/></button>
        </footer>
      </section>
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <section style={{ ...card, padding: 18 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3568b8', fontWeight: 800 }}><ShieldCheck size={19}/> {c.rules}</div><ul style={{ paddingLeft: 18, margin: '13px 0 0', color: '#59627d', fontSize: 13, lineHeight: 1.65 }}><li>{c.rule1}</li><li>{c.rule2}</li><li>{c.rule3}</li></ul></section>
        <section style={{ ...card, padding: 18 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}><Heart size={19} color="#c49a28"/> {c.welcome}</div><p style={{ color: '#667085', fontSize: 13, lineHeight: 1.6, marginBottom: 0 }}>{c.welcomeText}</p></section>
        <section style={{ ...card, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}><Music size={19} color="#6c3fa0"/> {c.worship}</div>
          {songs[currentSongIndex] ? (
            <div>
              <p style={{ fontSize: 14, margin: '11px 0 3px', fontWeight: 700 }}>{songs[currentSongIndex].title}</p>
              <p style={{ color: '#7b83a6', fontSize: 12, margin: '0 0 12px' }}>{songs[currentSongIndex].artist}</p>
            </div>
          ) : <p style={{ color: '#7b83a6', fontSize: 13 }}>{c.noMusic}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={toggleMusic} disabled={!songs.length} style={{ flex: 1, border: 0, borderRadius: 10, padding: 10, background: '#6c3fa0', color: '#fff', cursor: songs.length ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
              {isPlaying ? <span><Pause size={15} style={{ verticalAlign: 'middle' }}/> {c.pause}</span> : <span><Play size={15} style={{ verticalAlign: 'middle' }}/> {c.listen}</span>}
            </button>
            <button onClick={nextSong} disabled={!songs.length} aria-label="Próxima música" style={{ width: 42, border: '1px solid #d7dfef', borderRadius: 10, background: '#fff', cursor: 'pointer' }}><Volume2 size={17}/></button>
          </div>
          <audio ref={audioRef} onEnded={nextSong} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} />
        </section>
      </aside>
    </div>
    <style>{`@media(max-width:800px){.christian-chat-layout{grid-template-columns:1fr !important}.christian-room-list{grid-template-columns:repeat(2,minmax(0,1fr)) !important}}`}</style>
    <GuestPrompt show={showGuestPrompt} onClose={() => setShowGuestPrompt(false)} feature={c.room} />
  </div>;
}
