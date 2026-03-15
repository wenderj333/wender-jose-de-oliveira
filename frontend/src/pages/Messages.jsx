import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { playNotificationSound } from '../utils/notification-sound';
import { Send, ArrowLeft, User, MessageCircle, Inbox } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

function timeAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function Messages() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { lastEvent } = useWebSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const chatEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    // Mark all notifications as read when opening messages
    if (token) {
      fetch(`${API}/notifications/read-all`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Poll for new messages every 5 seconds when in a chat
  useEffect(() => {
    if (selectedUser) {
      pollRef.current = setInterval(() => fetchMessages(selectedUser.id, true), 5000);
      return () => clearInterval(pollRef.current);
    }
  }, [selectedUser]);

  // Listen for WebSocket direct_message events
  useEffect(() => {
    if (lastEvent?.type === 'direct_message' && lastEvent.senderId !== user?.id) {
      playNotificationSound();
      if (selectedUser && lastEvent.senderId === selectedUser.id) {
        fetchMessages(selectedUser.id, true);
      }
      fetchConversations();
    }
  }, [lastEvent]);

  async function fetchConversations() {
    try {
      const res = await fetch(`${API}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchMessages(userId, silent = false) {
    if (!silent) setLoadingMsgs(true);
    try {
      const res = await fetch(`${API}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const newMsgs = data.messages || [];
      if (silent && newMsgs.length > messages.length) {
        playNotificationSound();
      }
      setMessages(newMsgs);
    } catch (err) { console.error(err); }
    finally { if (!silent) setLoadingMsgs(false); }
  }

  function openChat(conv) {
    setSelectedUser({ id: conv.other_id, full_name: conv.other_name, avatar_url: conv.other_avatar });
    fetchMessages(conv.other_id);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: selectedUser.id, content: newMsg }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
        setNewMsg('');
      }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  }

  const getAvatarUrl = (url) => url ? (url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || ''}${url}`) : null;

  // Chat view
  if (selectedUser) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem', background: '#fff', borderRadius: 12, marginBottom: '0.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <button onClick={() => { setSelectedUser(null); fetchConversations(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ArrowLeft size={22} color="#1a0a3e" />
          </button>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#daa520', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {selectedUser.avatar_url ? (
              <img src={getAvatarUrl(selectedUser.avatar_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={20} color="#fff" />
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a0a3e' }}>{selectedUser.full_name}</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loadingMsgs ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Carregando...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
              <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>{t('messages.noMessages')}</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.sender_id === user.id;
              return (
                <div key={msg.id} style={{
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '75%', padding: '0.6rem 0.9rem', borderRadius: 16,
                  background: isMine ? '#4caf50' : '#f0f0f0',
                  color: isMine ? '#fff' : '#333', fontSize: '0.9rem', lineHeight: 1.4,
                }}>
                  {msg.content}
                  <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: '0.5rem 0' }}>
          <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
            placeholder={t('messages.writePlaceholder')}
            style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: 25, border: '1px solid #ddd', fontSize: '0.9rem' }} />
          <button type="submit" disabled={sending || !newMsg.trim()} style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: newMsg.trim() ? '#4caf50' : '#ccc', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Send size={18} color="#fff" />
          </button>
        </form>
      </div>
    );
  }

  // Conversations list
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', color: '#1a0a3e', marginBottom: '1rem' }}>
        <Inbox size={24} /> {t('messages.title')}
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>{t('messages.loading')}</div>
      ) : conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>{t('messages.noConversations')}</p>
          <p style={{ fontSize: '0.85rem' }}>{t('messages.whenSomeone')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {conversations.map(conv => (
            <div key={conv.other_id} onClick={() => openChat(conv)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem',
              background: '#fff', borderRadius: 12, border: '1px solid #eee', cursor: 'pointer',
              boxShadow: conv.unread > 0 ? '0 0 0 2px #4caf50' : '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#daa520', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {conv.other_avatar ? (
                  <img src={getAvatarUrl(conv.other_avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={22} color="#fff" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: '#1a0a3e' }}>{conv.other_name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#999' }}>{timeAgo(conv.last_at)}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>
                  {conv.last_content}
                </div>
              </div>
              {conv.unread > 0 && (
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: '#4caf50',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {conv.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
