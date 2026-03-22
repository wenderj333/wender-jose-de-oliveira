import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Send, Search, ArrowLeft, UserPlus, MessageCircle, Check, CheckCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

export default function Chat() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { userId } = useParams(); // /mensagens/:userId
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [friendStatus, setFriendStatus] = useState('loading'); // 'accepted'|'pending'|'none'|'loading'
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [translations, setTranslations] = useState({}); // msgId -> translated text
  const [translating, setTranslating] = useState({}); // msgId -> bool
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const translateMessage = async (msgId, content) => {
    if (translations[msgId]) {
      setTranslations(prev => { const n = {...prev}; delete n[msgId]; return n; });
      return;
    }
    setTranslating(prev => ({ ...prev, [msgId]: true }));
    try {
      const targetLang = navigator.language?.split('-')[0] || 'pt';
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(content)}&langpair=auto|${targetLang}`);
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && translated !== content) {
        setTranslations(prev => ({ ...prev, [msgId]: translated }));
      }
    } catch {}
    setTranslating(prev => ({ ...prev, [msgId]: false }));
  };

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // ── Load conversations list ────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/messages/conversations`, { headers });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (_) {}
    setLoadingConvs(false);
  }, [token]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ── Load messages for active chat ─────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/api/messages/${userId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setFriendStatus(data.friendshipStatus || 'none');
        setOtherUser(data.otherUser || null);
      }
    } catch (_) {}
  }, [userId, token]);

  useEffect(() => {
    if (userId) {
      setMessages([]);
      setFriendStatus('loading');
      loadMessages();
      // Poll every 4s for new messages
      pollRef.current = setInterval(() => {
        loadMessages();
        loadConversations();
      }, 4000);
    }
    return () => clearInterval(pollRef.current);
  }, [userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !userId || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ receiverId: userId, content: text.trim() }),
      });
      if (res.ok) {
        setText('');
        await loadMessages();
        await loadConversations();
      }
    } catch (_) {}
    setSending(false);
  };

  // ── Send friend request ───────────────────────────────────────────────────
  const sendFriendRequest = async () => {
    if (!userId || requestSent) return;
    try {
      const res = await fetch(`${API}/api/friends/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ addresseeId: userId }),
      });
      if (res.ok) {
        setFriendStatus('pending');
        setRequestSent(true);
      }
    } catch (_) {}
  };

  // ── Filtered conversations ────────────────────────────────────────────────
  const filtered = conversations.filter(c =>
    c.other_name?.toLowerCase().includes(search.toLowerCase())
  );

  const isMobile = window.innerWidth < 768;
  const showList = !userId || !isMobile;
  const showChat = !!userId;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  const Avatar = ({ url, name, size = 38 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#4a80d4,#3568b8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: size * 0.38,
      overflow: 'hidden',
    }}>
      {url ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name?.charAt(0)?.toUpperCase()}
    </div>
  );

  return (
    <div style={{
      display: 'flex', height: 'calc(100vh - 60px)',
      background: 'var(--bg)', borderRadius: 12, overflow: 'hidden',
      border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(74,128,212,0.08)',
    }}>

      {/* ── LEFT: Conversations List ─────────────────────────────────────── */}
      {showList && (
        <div style={{
          width: userId ? 300 : '100%', maxWidth: userId ? 300 : '100%',
          borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
          background: 'var(--card)',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 14px 10px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              💬 Mensagens
            </h2>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 20, padding: '7px 12px', border: '1px solid var(--border)' }}>
              <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Procurar conversa..."
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--text)', width: '100%' }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConvs ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>A carregar...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Nenhuma conversa ainda</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>Vai ao perfil de um amigo e envia uma mensagem!</p>
              </div>
            ) : (
              filtered.map(conv => {
                const isActive = conv.other_id === userId;
                return (
                  <div
                    key={conv.other_id}
                    onClick={() => navigate(`/mensagens/${conv.other_id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 14px', cursor: 'pointer',
                      background: isActive ? 'var(--fb-light,#e8f0fe)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--fb,#4a80d4)' : '3px solid transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ position: 'relative' }}>
                      <Avatar url={conv.other_avatar} name={conv.other_name} size={42} />
                      {/* Online dot placeholder */}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: conv.unread > 0 ? 700 : 500, fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>
                          {conv.other_name}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--muted)', flexShrink: 0 }}>{formatTime(conv.last_at)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                        <span style={{ fontSize: '0.78rem', color: conv.unread > 0 ? 'var(--text)' : 'var(--muted)', fontWeight: conv.unread > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                          {conv.last_content}
                        </span>
                        {conv.unread > 0 && (
                          <span style={{ background: 'var(--fb,#4a80d4)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── RIGHT: Chat Window ───────────────────────────────────────────── */}
      {showChat ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Chat header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
            {isMobile && (
              <button onClick={() => navigate('/mensagens')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fb)', padding: 4 }}>
                <ArrowLeft size={20} />
              </button>
            )}
            {otherUser && (
              <>
                <Link to={`/perfil/${otherUser.id}`}>
                  <Avatar url={otherUser.avatar_url} name={otherUser.full_name} size={38} />
                </Link>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', margin: 0 }}>{otherUser.full_name}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: 0 }}>
                    {friendStatus === 'accepted' ? '✓ Amigos' : friendStatus === 'pending' ? '⏳ Pedido enviado' : ''}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* NOT FRIENDS — show friend request prompt */}
          {friendStatus !== 'loading' && friendStatus !== 'accepted' ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>🤝</div>
              {otherUser && <Avatar url={otherUser.avatar_url} name={otherUser.full_name} size={64} />}
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {otherUser?.full_name}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', maxWidth: 300 }}>
                {friendStatus === 'pending' || requestSent
                  ? 'Pedido de amizade enviado! Quando aceitar, poderão conversar. ✝️'
                  : 'Para enviar mensagens, precisam ser amigos primeiro.'}
              </p>
              {friendStatus === 'none' && !requestSent && (
                <button
                  onClick={sendFriendRequest}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#3568b8,#4a80d4)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(74,128,212,0.3)' }}
                >
                  <UserPlus size={17} /> Enviar pedido de amizade
                </button>
              )}
              {(friendStatus === 'pending' || requestSent) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 12, background: '#f0f5ff', color: 'var(--fb)', fontSize: '0.88rem', fontWeight: 600, border: '1px solid #dde8fa' }}>
                  <Check size={15} /> Pedido enviado — aguardando aprovação
                </div>
              )}
            </div>
          ) : friendStatus === 'loading' ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              A carregar...
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🕊️</div>
                    <p style={{ fontSize: '0.88rem' }}>Nenhuma mensagem ainda. Diga olá! 👋</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === user?.id;
                  const prevMsg = messages[i - 1];
                  const showAvatar = !isMe && (i === 0 || prevMsg?.sender_id !== msg.sender_id);
                  const showTime = i === messages.length - 1 || messages[i + 1]?.sender_id !== msg.sender_id;

                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6, marginBottom: showTime ? 8 : 2 }}>
                      {!isMe && (
                        <div style={{ width: 28, flexShrink: 0 }}>
                          {showAvatar && <Avatar url={msg.sender_avatar} name={msg.sender_name} size={28} />}
                        </div>
                      )}
                      <div style={{ maxWidth: '68%' }}>
                        <div style={{
                          background: isMe ? 'linear-gradient(135deg,#3568b8,#4a80d4)' : 'var(--card)',
                          color: isMe ? 'white' : 'var(--text)',
                          border: isMe ? 'none' : '1px solid var(--border)',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          padding: '9px 14px',
                          fontSize: '0.88rem',
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                          boxShadow: isMe ? '0 2px 8px rgba(53,104,184,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                        }}>
                          {msg.content}
                          {translations[msg.id] && (
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: isMe ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--border)', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.85 }}>
                              🌐 {translations[msg.id]}
                            </div>
                          )}
                        </div>
                        {!isMe && (
                          <button
                            onClick={() => translateMessage(msg.id, msg.content)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--muted)', padding: '2px 4px', marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}
                            title="Traduzir mensagem"
                          >
                            {translating[msg.id] ? '⏳' : translations[msg.id] ? '✕ ocultar' : '🌐 traduzir'}
                          </button>
                        )}
                        {showTime && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{formatTime(msg.created_at)}</span>
                            {isMe && (msg.is_read
                              ? <CheckCheck size={11} style={{ color: '#4a80d4' }} />
                              : <Check size={11} style={{ color: 'var(--muted)' }} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, padding: '12px 14px', borderTop: '1px solid var(--border)', background: 'var(--card)', alignItems: 'flex-end' }}>
                <Avatar url={user?.avatar_url} name={user?.full_name} size={34} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg)', borderRadius: 22, padding: '8px 14px', border: '1px solid var(--border)', gap: 8 }}>
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Escreve uma mensagem..."
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.88rem', color: 'var(--text)' }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  style={{ width: 38, height: 38, borderRadius: '50%', background: text.trim() ? 'linear-gradient(135deg,#3568b8,#4a80d4)' : 'var(--border)', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <Send size={15} style={{ color: text.trim() ? 'white' : 'var(--muted)' }} />
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        // Empty state when no chat selected (desktop)
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--muted)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--fb-light,#e8f0fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={34} style={{ color: 'var(--fb,#4a80d4)' }} />
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', color: 'var(--text)', fontWeight: 600 }}>
            As tuas mensagens
          </h3>
          <p style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: 240 }}>
            Seleciona uma conversa ou vai ao perfil de um amigo para começar a conversar!
          </p>
        </div>
      )}
    </div>
  );
}
