import React, { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Music, Pause, Play, Send, ShieldCheck, Smile, Users, Volume2, VolumeX, LockKeyhole, ChevronRight, Flag, EyeOff, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useTranslation } from 'react-i18next';
import GuestPrompt from '../components/GuestPrompt';
import ReportModal from '../components/ReportModal';
import { getChristianChatCopy } from '../i18n/christianChatCopy';
import { repairMojibake } from '../utils/textEncoding';

const API_BASE = import.meta.env.VITE_API_URL || '';
const card = { background: '#fff', border: '1px solid #e0e6f5', borderRadius: 18, boxShadow: '0 8px 28px rgba(74,128,212,0.08)' };
const ROOM_IDS = ['pt', 'es', 'de', 'en'];
const ROOM_UI = {
  pt: { choose: 'Escolha uma sala', chooseDesc: 'Entre na conversa no idioma que prefere.', private: 'Conversas privadas', info: 'Informações da sala', report: 'Denunciar utilizador', hide: 'Ocultar mensagens desta pessoa', emoji: 'Adicionar emoji', send: 'Enviar mensagem', next: 'Próxima música', soundOn: 'Som ativado', soundOff: 'Som desativado', rooms: [{ id: 'pt', flag: '🇧🇷', title: 'Português', subtitle: 'Brasil, Portugal e países lusófonos' }, { id: 'es', flag: '🇪🇸', title: 'Español', subtitle: 'Fale com irmãos de fala espanhola' }, { id: 'de', flag: '🇩🇪', title: 'Deutsch', subtitle: 'Gemeinschaft auf Deutsch' }, { id: 'en', flag: '🇬🇧', title: 'English', subtitle: 'Christian community in English' }] },
  es: { choose: 'Elige una sala', chooseDesc: 'Entra en la conversación en el idioma que prefieras.', private: 'Conversaciones privadas', info: 'Información de la sala', report: 'Denunciar usuario', hide: 'Ocultar mensajes de esta persona', emoji: 'Añadir emoji', send: 'Enviar mensaje', next: 'Siguiente canción', soundOn: 'Sonido activado', soundOff: 'Sonido desactivado', rooms: [{ id: 'pt', flag: '🇧🇷', title: 'Português', subtitle: 'Brasil, Portugal y países lusófonos' }, { id: 'es', flag: '🇪🇸', title: 'Español', subtitle: 'Habla con hermanos hispanohablantes' }, { id: 'de', flag: '🇩🇪', title: 'Deutsch', subtitle: 'Comunidad en alemán' }, { id: 'en', flag: '🇬🇧', title: 'English', subtitle: 'Comunidad cristiana en inglés' }] },
  en: { choose: 'Choose a room', chooseDesc: 'Join the conversation in your preferred language.', private: 'Private conversations', info: 'Room information', report: 'Report user', hide: 'Hide this person’s messages', emoji: 'Add emoji', send: 'Send message', next: 'Next song', soundOn: 'Sound on', soundOff: 'Sound off', rooms: [{ id: 'pt', flag: '🇧🇷', title: 'Português', subtitle: 'Brazil, Portugal and Lusophone countries' }, { id: 'es', flag: '🇪🇸', title: 'Español', subtitle: 'Speak with Spanish-speaking believers' }, { id: 'de', flag: '🇩🇪', title: 'Deutsch', subtitle: 'German-speaking community' }, { id: 'en', flag: '🇬🇧', title: 'English', subtitle: 'Christian community in English' }] },
  de: { choose: 'Wähle einen Raum', chooseDesc: 'Tritt der Unterhaltung in deiner bevorzugten Sprache bei.', private: 'Private Gespräche', info: 'Rauminformationen', report: 'Nutzer melden', hide: 'Nachrichten dieser Person ausblenden', emoji: 'Emoji hinzufügen', send: 'Nachricht senden', next: 'Nächstes Lied', soundOn: 'Ton an', soundOff: 'Ton aus', rooms: [{ id: 'pt', flag: '🇧🇷', title: 'Português', subtitle: 'Brasilien, Portugal und lusophone Länder' }, { id: 'es', flag: '🇪🇸', title: 'Español', subtitle: 'Sprich mit spanischsprachigen Glaubensgeschwistern' }, { id: 'de', flag: '🇩🇪', title: 'Deutsch', subtitle: 'Deutschsprachige Gemeinschaft' }, { id: 'en', flag: '🇬🇧', title: 'English', subtitle: 'Christliche Gemeinschaft auf Englisch' }] },
  fr: { choose: 'Choisissez un salon', chooseDesc: 'Entrez dans la conversation dans la langue de votre choix.', private: 'Conversations privées', info: 'Informations du salon', report: 'Signaler cet utilisateur', hide: 'Masquer les messages de cette personne', emoji: 'Ajouter un emoji', send: 'Envoyer le message', next: 'Chanson suivante', rooms: [{ id: 'pt', flag: '🇧🇷', title: 'Português', subtitle: 'Brésil, Portugal et pays lusophones' }, { id: 'es', flag: '🇪🇸', title: 'Español', subtitle: 'Échangez avec des croyants hispanophones' }, { id: 'de', flag: '🇩🇪', title: 'Deutsch', subtitle: 'Communauté germanophone' }, { id: 'en', flag: '🇬🇧', title: 'English', subtitle: 'Communauté chrétienne anglophone' }] },
  ro: { choose: 'Alege o cameră', chooseDesc: 'Intră în conversație în limba preferată.', private: 'Conversații private', info: 'Informații despre cameră', report: 'Raportează utilizatorul', hide: 'Ascunde mesajele acestei persoane', emoji: 'Adaugă emoji', send: 'Trimite mesajul', next: 'Următoarea melodie', rooms: [{ id: 'pt', flag: '🇧🇷', title: 'Português', subtitle: 'Brazilia, Portugalia și țările lusofone' }, { id: 'es', flag: '🇪🇸', title: 'Español', subtitle: 'Vorbește cu creștini vorbitori de spaniolă' }, { id: 'de', flag: '🇩🇪', title: 'Deutsch', subtitle: 'Comunitate de limbă germană' }, { id: 'en', flag: '🇬🇧', title: 'English', subtitle: 'Comunitate creștină în engleză' }] },
  ru: { choose: 'Выберите комнату', chooseDesc: 'Присоединяйтесь к беседе на удобном для вас языке.', private: 'Личные беседы', info: 'Информация о комнате', report: 'Пожаловаться на пользователя', hide: 'Скрыть сообщения этого человека', emoji: 'Добавить эмодзи', send: 'Отправить сообщение', next: 'Следующая песня', rooms: [{ id: 'pt', flag: '🇧🇷', title: 'Português', subtitle: 'Бразилия, Португалия и португалоязычные страны' }, { id: 'es', flag: '🇪🇸', title: 'Español', subtitle: 'Общайтесь с испаноязычными христианами' }, { id: 'de', flag: '🇩🇪', title: 'Deutsch', subtitle: 'Немецкоязычное сообщество' }, { id: 'en', flag: '🇬🇧', title: 'English', subtitle: 'Христианское сообщество на английском' }] },
};
const getRoomUi = language => ROOM_UI[language?.split('-')[0]] || ROOM_UI.pt;

export default function LiveCommunity() {
  const { user, isGuest } = useAuth();
  const { i18n } = useTranslation();
  const c = getChristianChatCopy(i18n.language);
  const roomUi = getRoomUi(i18n.language);
  const { send, on, off, isConnected } = useWebSocket();
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [roomId, setRoomId] = useState(() => (ROOM_IDS.includes(i18n.language?.slice(0, 2)) ? i18n.language.slice(0, 2) : 'pt'));
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [reportMessage, setReportMessage] = useState(null);
  const [hiddenUserIds, setHiddenUserIds] = useState(() => new Set());
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chatSoundEnabled, setChatSoundEnabled] = useState(() => localStorage.getItem('live_chat_sound') !== 'false');
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  const playChatNotification = () => {
    if (!chatSoundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(740, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(980, context.currentTime + 0.09);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 0.2);
      oscillator.addEventListener('ended', () => context.close().catch(() => {}), { once: true });
    } catch (_) { /* o navegador pode bloquear áudio até haver interação */ }
  };

  // The global language selector should bring the person to the matching
  // public room as well. This avoids two people thinking they are together
  // while one is in Portuguese and the other is in Spanish.
  useEffect(() => {
    const selectedLanguage = i18n.language?.slice(0, 2);
    if (ROOM_IDS.includes(selectedLanguage)) setRoomId(selectedLanguage);
  }, [i18n.language]);

  useEffect(() => {
    fetch(`${API_BASE}/api/live-community/playlist`).then(r => r.json()).then(data => setSongs(data.songs || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!send || !on || !off) return undefined;
    const handleMessage = data => {
      if (data?.roomId && data.roomId !== roomId) return;
      const isNewMessage = data?.id ? !chatMessages.some(message => message.id === data.id) : true;
      if (isNewMessage && data?.userId !== user?.id) playChatNotification();
      setChatMessages(prev => {
      if (data?.id && prev.some(message => message.id === data.id)) return prev;
      if (prev.some(message => message.userId === data.userId && (message.text || message.message) === (data.text || data.message))) return prev;
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
  }, [send, on, off, user, isGuest, roomId, isConnected, chatSoundEnabled]);

  useEffect(() => {
    setChatMessages([]); setOnlineCount(0);
    const loadHistory = () => fetch(`${API_BASE}/api/live-community/history?roomId=${encodeURIComponent(roomId)}`)
      .then(response => response.json())
      .then(data => setChatMessages(previous => {
        const incoming = data.messages || [];
        const confirmed = incoming.map(message => {
          const localCopy = previous.find(item => item.userId === message.userId && (item.text || item.message) === (message.text || message.message));
          return localCopy ? { ...message, id: localCopy.id } : message;
        });
        const pending = previous.filter(message => String(message.id || '').startsWith('local-') && !incoming.some(item => item.userId === message.userId && (item.text || item.message) === (message.text || message.message)));
        return [...confirmed, ...pending].sort((a, b) => new Date(a.time || 0) - new Date(b.time || 0)).slice(-100);
      }))
      .catch(() => {});
    loadHistory();
    const timer = setInterval(loadHistory, 6000);
    return () => clearInterval(timer);
  }, [roomId]);

  useEffect(() => {
    if (!user || isGuest) return undefined;
    const updatePresence = () => fetch(`${API_BASE}/api/live-community/join`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, roomId }),
    }).then(response => response.json()).then(data => setOnlineCount(Number(data.onlineCount) || 0)).catch(() => {});
    updatePresence();
    const timer = setInterval(updatePresence, 60000);
    return () => {
      clearInterval(timer);
      fetch(`${API_BASE}/api/live-community/leave`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) }).catch(() => {});
    };
  }, [user, isGuest, roomId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
  useEffect(() => { if (songs.length && audioRef.current) audioRef.current.src = songs[currentSongIndex]?.file_url || ''; }, [songs, currentSongIndex]);

  const sendMessage = () => {
    if (!user || isGuest) return setShowGuestPrompt(true);
    const text = messageInput.trim();
    if (!text || !send) return;
    const localMessage = { id: `local-${Date.now()}`, roomId, userId: user.id, userName: user.full_name, userAvatar: user.avatar_url, text, time: new Date().toISOString() };
    setChatMessages(previous => [...previous, localMessage].slice(-100));
    send({ type: 'live_chat_message', ...localMessage });
    fetch(`${API_BASE}/api/live-community/history`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, userId: user.id, userName: user.full_name, userAvatar: user.avatar_url, message: text }),
    }).catch(() => {});
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
  const hideUser = userId => {
    if (!userId) return;
    setHiddenUserIds(previous => new Set([...previous, userId]));
  };

  return <div style={{ minHeight: '100vh', padding: '20px 0 36px', color: '#1e2240' }}>
    <section style={{ maxWidth: 1120, margin: '0 auto 18px', padding: '0 8px' }}>
      <div style={{ background: 'linear-gradient(120deg,#3568b8,#6a9ade)', color: '#fff', borderRadius: 20, padding: '26px 30px', boxShadow: '0 12px 28px rgba(53,104,184,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, opacity: .9 }}><MessageCircle size={19}/> {c.brand}</div>
        <h1 style={{ margin: '9px 0 7px', fontSize: 'clamp(1.7rem,4vw,2.45rem)' }}>{c.room}</h1>
        <p style={{ margin: 0, fontSize: '1rem', opacity: .92 }}>{c.intro}</p>
      </div>
    </section>
    <div style={{ maxWidth: 1120, margin: '0 auto 18px', padding: '0 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}><div><h2 style={{ margin: 0, fontSize: '1.1rem' }}>{roomUi.choose}</h2><p style={{ margin: '4px 0 0', color: '#7b83a6', fontSize: 13 }}>{roomUi.chooseDesc}</p></div><Link to="/mensagens" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#3568b8', textDecoration: 'none', fontWeight: 800, fontSize: 14 }}><LockKeyhole size={16}/> {roomUi.private} <ChevronRight size={16}/></Link></div>
      <div className="christian-room-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(118px,1fr))', gap: 18, justifyItems: 'center' }}>
        {roomUi.rooms.map(room => <button key={room.id} type="button" onClick={() => setRoomId(room.id)} aria-label={room.title} style={{ width: '100%', maxWidth: 156, aspectRatio: '1', textAlign: 'center', padding: 13, borderRadius: '50%', border: roomId === room.id ? '3px solid #3568b8' : '1px solid #dce4f2', background: roomId === room.id ? 'linear-gradient(145deg,#e8f2ff,#f8fbff)' : '#fff', cursor: 'pointer', boxShadow: roomId === room.id ? '0 10px 22px rgba(53,104,184,.16)' : '0 5px 13px rgba(30,34,64,.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform .2s, box-shadow .2s' }} onMouseEnter={event => { event.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseLeave={event => { event.currentTarget.style.transform = 'translateY(0)'; }}><div style={{ fontSize: 27, marginBottom: 5 }}>{room.flag}</div><strong style={{ display: 'block', color: '#1e2240', fontSize: 13 }}>{room.title}</strong><span style={{ display: 'block', color: '#68738f', fontSize: 10, marginTop: 4, lineHeight: 1.25, maxWidth: 112 }}>{room.subtitle}</span></button>)}
      </div>
    </div>
    <div className="christian-chat-layout" style={{ maxWidth: 1120, margin: '0 auto', padding: '0 8px', display: 'grid', gridTemplateColumns: 'minmax(0,1.8fr) minmax(260px,.8fr)', gap: 18 }}>
      <section style={{ ...card, minHeight: 540, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '18px 20px', borderBottom: '1px solid #e0e6f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div><h2 style={{ margin: 0, fontSize: '1.15rem' }}>{roomUi.rooms.find(room => room.id === roomId)?.title || c.conversation}</h2><p style={{ margin: '4px 0 0', color: '#7b83a6', fontSize: 13 }}>{c.share}</p></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><button type="button" onClick={() => { const next = !chatSoundEnabled; setChatSoundEnabled(next); localStorage.setItem('live_chat_sound', String(next)); if (next) playChatNotification(); }} aria-pressed={chatSoundEnabled} aria-label={chatSoundEnabled ? (roomUi.soundOn || 'Som ativado') : (roomUi.soundOff || 'Som desativado')} title={chatSoundEnabled ? (roomUi.soundOn || 'Som ativado') : (roomUi.soundOff || 'Som desativado')} style={{ width: 38, height: 34, border: '1px solid #d7dfef', borderRadius: 10, background: chatSoundEnabled ? '#eaf7ef' : '#f4f6fa', color: chatSoundEnabled ? '#287a4b' : '#667085', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>{chatSoundEnabled ? <Volume2 size={17}/> : <VolumeX size={17}/>}</button><span style={{ background: onlineCount ? '#eaf7ef' : '#f4f6fa', color: onlineCount ? '#287a4b' : '#667085', borderRadius: 999, padding: '8px 10px', fontSize: 12, fontWeight: 700 }}><Users size={14} style={{ verticalAlign: 'middle', marginRight: 5 }}/>{onlineLabel}</span></div>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#fbfcff' }}>
          {!chatMessages.length && <div style={{ maxWidth: 390, margin: '80px auto 0', textAlign: 'center', color: '#667085' }}><MessageCircle size={35} style={{ color: '#4a80d4', marginBottom: 10 }}/><h3 style={{ margin: '0 0 8px', color: '#1e2240' }}>{c.ready}</h3><p style={{ margin: 0, lineHeight: 1.6 }}>{c.empty}</p></div>}
          {chatMessages.filter(message => !hiddenUserIds.has(message.userId)).map((message, index) => <article key={message.id || `${message.userName}-${index}`} style={{ marginBottom: 12, padding: '11px 13px', background: '#fff', border: '1px solid #e6ebf6', borderRadius: '4px 14px 14px 14px', maxWidth: '85%' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><strong style={{ color: '#3568b8', fontSize: 13, flex: 1 }}>{repairMojibake(message.userName) || 'Membro'}</strong>{message.userId && message.userId !== user?.id && <><button type="button" onClick={() => setReportMessage(message)} title={roomUi.report} style={{ border: 0, background: 'transparent', color: '#c73c3c', cursor: 'pointer', padding: 3 }}><Flag size={15}/></button><button type="button" onClick={() => hideUser(message.userId)} title={roomUi.hide} style={{ border: 0, background: 'transparent', color: '#77829a', cursor: 'pointer', padding: 3 }}><EyeOff size={15}/></button></>}</div><p style={{ margin: '4px 0 0', lineHeight: 1.45 }}>{repairMojibake(message.text || message.message)}</p></article>)}
          <div ref={chatEndRef} />
        </div>
        <footer style={{ padding: 14, borderTop: '1px solid #e0e6f5', display: 'flex', gap: 9, position: 'relative' }}>
          {showEmojis && <div style={{ position: 'absolute', left: 14, bottom: 66, zIndex: 4, display: 'flex', gap: 4, flexWrap: 'wrap', width: 238, padding: 9, borderRadius: 12, border: '1px solid #d7dfef', background: '#fff', boxShadow: '0 10px 25px rgba(30,34,64,.18)' }}>
            {['🙏', '❤️', '😊', '🙌', '📖', '✨', '🕊️', '🔥', '👏', '🤍', '🌿', '💬'].map(emoji => <button key={emoji} type="button" onClick={() => addEmoji(emoji)} aria-label={`Adicionar ${emoji}`} style={{ width: 32, height: 32, border: 0, borderRadius: 8, background: '#f5f8ff', cursor: 'pointer', fontSize: 18 }}>{emoji}</button>)}
          </div>}
          <button type="button" onClick={() => setShowEmojis(open => !open)} aria-label={roomUi.emoji} style={{ width: 42, border: '1px solid #d7dfef', borderRadius: 12, background: showEmojis ? '#eaf2ff' : '#fff', color: '#3568b8', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Smile size={19}/></button>
          <input value={messageInput} onChange={event => setMessageInput(event.target.value)} onKeyDown={event => event.key === 'Enter' && sendMessage()} onFocus={() => (!user || isGuest) && setShowGuestPrompt(true)} placeholder={user && !isGuest ? c.write : c.account} readOnly={!user || isGuest} style={{ minWidth: 0, flex: 1, padding: '12px 14px', border: '1px solid #d7dfef', borderRadius: 12, fontSize: 14, outlineColor: '#4a80d4' }}/>
          <button onClick={sendMessage} aria-label={roomUi.send} style={{ width: 46, border: 0, borderRadius: 12, background: '#3568b8', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Send size={19}/></button>
        </footer>
      </section>
      <aside className="chat-info-desktop" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <section style={{ ...card, padding: 18 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3568b8', fontWeight: 800 }}><ShieldCheck size={19}/> {c.rules}</div><ul style={{ paddingLeft: 18, margin: '13px 0 0', color: '#59627d', fontSize: 13, lineHeight: 1.65 }}><li>{c.rule1}</li><li>{c.rule2}</li><li>{c.rule3}</li></ul></section>
        <section style={{ ...card, padding: 18 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}><Heart size={19} color="#c49a28"/> {c.welcome}</div><p style={{ color: '#667085', fontSize: 13, lineHeight: 1.6, marginBottom: 0 }}>{c.welcomeText}</p></section>
        <section style={{ ...card, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}><Music size={19} color="#6c3fa0"/> {c.worship}</div>
          {songs[currentSongIndex] ? (
            <div>
              <p style={{ fontSize: 14, margin: '11px 0 3px', fontWeight: 700 }}>{repairMojibake(songs[currentSongIndex].title)}</p>
              <p style={{ color: '#7b83a6', fontSize: 12, margin: '0 0 12px' }}>{repairMojibake(songs[currentSongIndex].artist)}</p>
            </div>
          ) : <p style={{ color: '#7b83a6', fontSize: 13 }}>{c.noMusic}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={toggleMusic} disabled={!songs.length} style={{ flex: 1, border: 0, borderRadius: 10, padding: 10, background: '#6c3fa0', color: '#fff', cursor: songs.length ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
              {isPlaying ? <span><Pause size={15} style={{ verticalAlign: 'middle' }}/> {c.pause}</span> : <span><Play size={15} style={{ verticalAlign: 'middle' }}/> {c.listen}</span>}
            </button>
            <button onClick={nextSong} disabled={!songs.length} aria-label={roomUi.next} style={{ width: 42, border: '1px solid #d7dfef', borderRadius: 10, background: '#fff', cursor: 'pointer' }}><Volume2 size={17}/></button>
          </div>
          <audio ref={audioRef} onEnded={nextSong} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} />
        </section>
      </aside>
    </div>
    <section className="chat-info-mobile" style={{ ...card, maxWidth: 1120, margin: '14px auto 0', padding: 14 }}>
      <button type="button" onClick={() => setShowRoomInfo(open => !open)} style={{ width: '100%', border: 0, background: 'transparent', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#3568b8', fontWeight: 800, cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Info size={19}/> {roomUi.info}</span><ChevronRight size={18} style={{ transform: showRoomInfo ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}/>
      </button>
      {showRoomInfo && <div style={{ marginTop: 14, borderTop: '1px solid #e0e6f5', paddingTop: 13, color: '#59627d', fontSize: 13, lineHeight: 1.65 }}>
        <strong style={{ color: '#1e2240' }}>{c.rules}</strong>
        <ul style={{ paddingLeft: 18, margin: '8px 0 12px' }}><li>{c.rule1}</li><li>{c.rule2}</li><li>{c.rule3}</li></ul>
        <strong style={{ color: '#1e2240' }}>{c.welcome}</strong><p style={{ margin: '5px 0 0' }}>{c.welcomeText}</p>
      </div>}
    </section>
    <style>{` .chat-info-mobile{display:none}@media(max-width:800px){.christian-chat-layout{grid-template-columns:1fr !important}.christian-room-list{grid-template-columns:repeat(2,minmax(0,1fr)) !important}.chat-info-desktop{display:none !important}.chat-info-mobile{display:block !important}}`}</style>
    <GuestPrompt show={showGuestPrompt} onClose={() => setShowGuestPrompt(false)} feature={c.room} />
    {reportMessage && <ReportModal type="user" targetId={reportMessage.userId} targetName={reportMessage.userName} onClose={() => setReportMessage(null)} />}
  </div>;
}
