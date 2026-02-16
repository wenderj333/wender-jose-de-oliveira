import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../context/WebSocketContext';
import { MessageCircle, Send, X, RefreshCw, Church } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const helpTypes = [
  { value: 'see_things', emoji: '👁️' },
  { value: 'hear_things', emoji: '👂' },
  { value: 'feel_alone', emoji: '💔' },
  { value: 'need_prayer', emoji: '🙏' },
  { value: 'anxious', emoji: '😰' },
  { value: 'depressed', emoji: '😢' },
];

const languages = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'tl', label: 'Filipino' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'sw', label: 'Kiswahili' },
];

const styles = {
  container: { maxWidth: 600, margin: '0 auto', padding: '1rem', minHeight: '70vh' },
  header: { textAlign: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: 700, color: '#2c3e50', margin: '0.5rem 0' },
  subtitle: { color: '#7f8c8d', fontSize: '0.95rem' },
  toggleBar: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: '1.5rem' },
  toggleBtn: (active) => ({
    padding: '0.6rem 1.2rem', borderRadius: 25, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
    background: active ? '#8e44ad' : '#ecf0f1', color: active ? '#fff' : '#2c3e50', transition: 'all 0.2s',
  }),
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '0.7rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' },
  select: { padding: '0.7rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', background: '#fff' },
  submitBtn: { padding: '0.8rem', borderRadius: 25, border: 'none', background: '#8e44ad', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
  // Waiting
  waitingBox: { textAlign: 'center', padding: '3rem 1rem' },
  pulse: { width: 80, height: 80, borderRadius: '50%', background: '#8e44ad', margin: '0 auto 1.5rem', animation: 'pulse 2s infinite' },
  // Rooms list
  roomCard: { background: '#fff', borderRadius: 12, padding: '1rem', marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  joinBtn: { padding: '0.5rem 1rem', borderRadius: 20, border: 'none', background: '#27ae60', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  // Chat
  chatContainer: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', maxHeight: 600 },
  chatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 1rem', background: '#8e44ad', color: '#fff', borderRadius: '12px 12px 0 0' },
  messagesArea: { flex: 1, overflowY: 'auto', padding: '1rem', background: '#f5f0ff', display: 'flex', flexDirection: 'column', gap: 8 },
  bubble: (isOwn) => ({
    maxWidth: '80%', padding: '0.6rem 1rem', borderRadius: 16, alignSelf: isOwn ? 'flex-end' : 'flex-start',
    background: isOwn ? '#d5f5e3' : '#d6eaf8', borderBottomRightRadius: isOwn ? 4 : 16, borderBottomLeftRadius: isOwn ? 16 : 4,
  }),
  bubbleName: { fontSize: '0.75rem', fontWeight: 700, color: '#8e44ad', marginBottom: 2 },
  bubbleText: { fontSize: '0.95rem', color: '#2c3e50' },
  translatedText: { fontSize: '0.8rem', color: '#7f8c8d', fontStyle: 'italic', marginTop: 4, opacity: 0.8 },
  inputBar: { display: 'flex', gap: 8, padding: '0.7rem 1rem', background: '#fff', borderRadius: '0 0 12px 12px', borderTop: '1px solid #eee' },
  chatInput: { flex: 1, padding: '0.6rem', borderRadius: 20, border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none' },
  sendBtn: { width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#8e44ad', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  typing: { fontSize: '0.8rem', color: '#8e44ad', fontStyle: 'italic', padding: '0 1rem' },
  autoTranslate: { textAlign: 'center', fontSize: '0.8rem', color: '#27ae60', padding: '0.3rem', background: '#eafaf1', borderRadius: 8, margin: '0.5rem 0' },
  endBtn: { padding: '0.4rem 0.8rem', borderRadius: 15, border: '1px solid rgba(255,255,255,0.5)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' },
  chatEnded: { textAlign: 'center', padding: '3rem 1rem', fontSize: '1.2rem', color: '#27ae60' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.8rem', borderRadius: 15, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', margin: '0 auto 1rem' },
};

export default function PastorChat() {
  const { t } = useTranslation();
  const { send, lastEvent } = useWebSocket();
  const [isPastor, setIsPastor] = useState(false);
  const [view, setView] = useState('form'); // form | waiting | chat | ended
  const [name, setName] = useState('');
  const [helpType, setHelpType] = useState('need_prayer');
  const [language, setLanguage] = useState('pt');
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [churches, setChurches] = useState([]);
  const [selectedChurch, setSelectedChurch] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [pastorLang, setPastorLang] = useState('pt');
  const [otherLang, setOtherLang] = useState(null);
  const [role, setRole] = useState('requester');
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660;
      osc.type = 'sine';
      gain.gain.value = 0.15;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Handle WS events
  useEffect(() => {
    if (!lastEvent || !roomId) return;
    if (lastEvent.roomId !== roomId) return;

    switch (lastEvent.type) {
      case 'chat_new_message':
        setMessages((prev) => [...prev, {
          role: lastEvent.role,
          name: lastEvent.name,
          originalText: lastEvent.originalText,
          translatedText: lastEvent.translatedText,
          sourceLang: lastEvent.sourceLang,
          timestamp: lastEvent.timestamp,
        }]);
        setTyping(null);
        if (lastEvent.role !== role) playNotificationSound();
        break;
      case 'chat_user_joined':
        setMessages((prev) => [...prev, { system: true, text: `${lastEvent.name} ${t('pastorChat.joinedChat')}` }]);
        if (view === 'waiting') setView('chat');
        playNotificationSound();
        break;
      case 'chat_user_left':
        setMessages((prev) => [...prev, { system: true, text: `${lastEvent.name} ${t('pastorChat.leftChat')}` }]);
        break;
      case 'chat_typing':
        setTyping(lastEvent.name);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(null), 3000);
        break;
    }
  }, [lastEvent]);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API}/api/chat/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!isPastor) return;
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [isPastor]);

  // Fetch churches for selection
  useEffect(() => {
    fetch(`${API}/api/chat/churches-online`)
      .then(r => r.json())
      .then(data => setChurches(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleRequestChat = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/chat/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Anônimo', language, helpType,
          churchId: selectedChurch || null,
          churchName: churches.find(c => c.id === selectedChurch)?.name || null,
        }),
      });
      const data = await res.json();
      setRoomId(data.roomId);
      setRole('requester');
      send({ type: 'chat_join_room', roomId: data.roomId, role: 'requester', name: name || 'Anônimo', language });
      setView('waiting');
    } catch (e) { console.error(e); }
  };

  const handleJoinRoom = async (room) => {
    if (!pastorName.trim()) return;
    try {
      await fetch(`${API}/api/chat/rooms/${room.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pastorName, language: pastorLang }),
      });
      setRoomId(room.id);
      setRole('pastor');
      setOtherLang(room.requester_language);
      send({ type: 'chat_join_room', roomId: room.id, role: 'pastor', name: pastorName, language: pastorLang });
      setView('chat');
    } catch (e) { console.error(e); }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const myLang = role === 'requester' ? language : pastorLang;
    const targetLang = role === 'requester' ? otherLang : otherLang;
    // Determine target language
    let tLang = myLang; // fallback
    if (role === 'requester') {
      // We don't know pastor's lang from requester side until they join
      // The server will broadcast and we show what we get
    }
    send({
      type: 'chat_message',
      roomId,
      role,
      name: role === 'requester' ? (name || 'Anônimo') : pastorName,
      text: inputText,
      sourceLang: myLang,
      targetLang: otherLang || myLang,
    });
    // Add own message immediately
    setMessages((prev) => [...prev, {
      role,
      name: role === 'requester' ? (name || 'Anônimo') : pastorName,
      originalText: inputText,
      translatedText: null,
      sourceLang: myLang,
      timestamp: new Date().toISOString(),
      own: true,
    }]);
    setInputText('');
  };

  const handleTyping = () => {
    send({ type: 'chat_typing', roomId, role, name: role === 'requester' ? name : pastorName });
  };

  const handleEndChat = async () => {
    try {
      await fetch(`${API}/api/chat/rooms/${roomId}/close`, { method: 'POST' });
      send({ type: 'chat_leave_room', roomId });
      setView('ended');
    } catch (e) { console.error(e); }
  };

  // When a pastor joins our waiting room via WS
  useEffect(() => {
    if (lastEvent?.type === 'chat_user_joined' && lastEvent.roomId === roomId && lastEvent.role === 'pastor') {
      setOtherLang(lastEvent.language || 'pt');
    }
  }, [lastEvent]);

  // FORM VIEW
  if (view === 'form') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <MessageCircle size={40} color="#8e44ad" />
          <h1 style={styles.title}>{t('pastorChat.title')}</h1>
          <p style={styles.subtitle}>{t('pastorChat.subtitle')}</p>
        </div>

        <div style={styles.toggleBar}>
          <button style={styles.toggleBtn(!isPastor)} onClick={() => setIsPastor(false)}>{t('pastorChat.imPerson')}</button>
          <button style={styles.toggleBtn(isPastor)} onClick={() => setIsPastor(true)}>{t('pastorChat.imPastor')}</button>
        </div>

        {!isPastor ? (
          <form style={styles.form} onSubmit={handleRequestChat}>
            <input style={styles.input} placeholder={t('pastorChat.yourName')} value={name} onChange={(e) => setName(e.target.value)} />
            <select style={styles.select} value={helpType} onChange={(e) => setHelpType(e.target.value)}>
              {helpTypes.map((h) => (
                <option key={h.value} value={h.value}>{h.emoji} {t(`home.help${h.value.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join('')}`) || h.value}</option>
              ))}
            </select>
            <select style={styles.select} value={language} onChange={(e) => setLanguage(e.target.value)}>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            {churches.length > 0 && (
              <select style={styles.select} value={selectedChurch} onChange={(e) => setSelectedChurch(e.target.value)}>
                <option value="">{t('pastorChat.anyChurch')}</option>
                {churches.map((c) => (
                  <option key={c.id} value={c.id}>⛪ {c.name}{c.city ? ` — ${c.city}` : ''}</option>
                ))}
              </select>
            )}
            <button type="submit" style={styles.submitBtn}>{t('pastorChat.startChat')}</button>
          </form>
        ) : (
          <div>
            <div style={styles.form}>
              <input style={styles.input} placeholder={t('pastorChat.pastorName')} value={pastorName} onChange={(e) => setPastorName(e.target.value)} />
              <select style={styles.select} value={pastorLang} onChange={(e) => setPastorLang(e.target.value)}>
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            <h3 style={{ margin: '1.5rem 0 0.8rem', color: '#2c3e50' }}>{t('pastorChat.waitingRooms')}</h3>
            <button style={styles.refreshBtn} onClick={fetchRooms}><RefreshCw size={14} /> Refresh</button>
            {rooms.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#95a5a6' }}>{t('pastorChat.noWaiting')}</p>
            ) : (
              rooms.map((room) => (
                <div key={room.id} style={styles.roomCard}>
                  <div>
                    <strong>{room.requester_name}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                      {room.help_type} · {languages.find(l => l.code === room.requester_language)?.label || room.requester_language}
                    </div>
                    {room.target_church_name && (
                      <div style={{ fontSize: '0.8rem', color: '#8e44ad', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Church size={12} /> {room.target_church_name}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#bdc3c7' }}>{new Date(room.created_at).toLocaleTimeString()}</div>
                  </div>
                  <button style={styles.joinBtn} onClick={() => { setOtherLang(room.requester_language); handleJoinRoom(room); }} disabled={!pastorName.trim()}>
                    {t('pastorChat.joinChat')}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.15); opacity: 1; } }`}</style>
      </div>
    );
  }

  // WAITING VIEW
  if (view === 'waiting') {
    return (
      <div style={styles.container}>
        <div style={styles.waitingBox}>
          <div style={styles.pulse} />
          <h2 style={{ color: '#8e44ad' }}>{t('pastorChat.waiting')}</h2>
          <p style={{ color: '#7f8c8d' }}>{t('pastorChat.waitingDesc')}</p>
        </div>
        <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.15); opacity: 1; } }`}</style>
      </div>
    );
  }

  // ENDED VIEW
  if (view === 'ended') {
    return (
      <div style={styles.container}>
        <div style={styles.chatEnded}>
          <p style={{ fontSize: '3rem' }}>🙏</p>
          <h2>{t('pastorChat.chatEnded')}</h2>
          <button style={{ ...styles.submitBtn, marginTop: '1rem' }} onClick={() => { setView('form'); setMessages([]); setRoomId(null); }}>
            {t('pastorChat.startChat')}
          </button>
        </div>
      </div>
    );
  }

  // CHAT VIEW
  return (
    <div style={styles.container}>
      <div style={styles.chatContainer}>
        <div style={styles.chatHeader}>
          <span style={{ fontWeight: 700 }}>{t('pastorChat.title')}</span>
          <button style={styles.endBtn} onClick={handleEndChat}><X size={14} /> {t('pastorChat.endChat')}</button>
        </div>

        <div style={styles.autoTranslate}>{t('pastorChat.autoTranslate')}</div>

        <div style={styles.messagesArea}>
          {messages.map((msg, i) => {
            if (msg.system) {
              return <div key={i} style={{ textAlign: 'center', fontSize: '0.8rem', color: '#95a5a6', padding: '0.3rem' }}>— {msg.text} —</div>;
            }
            const isOwn = msg.own || msg.role === role;
            return (
              <div key={i} style={styles.bubble(isOwn)}>
                <div style={styles.bubbleName}>{msg.name}</div>
                <div style={styles.bubbleText}>{msg.originalText}</div>
                {msg.translatedText && msg.translatedText !== msg.originalText && (
                  <div style={styles.translatedText}>🌍 {msg.translatedText}</div>
                )}
              </div>
            );
          })}
          {typing && <div style={styles.typing}>{typing} {t('pastorChat.typing')}</div>}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputBar}>
          <input
            style={styles.chatInput}
            placeholder={t('pastorChat.typeMessage')}
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); handleTyping(); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          />
          <button style={styles.sendBtn} onClick={handleSend}><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
