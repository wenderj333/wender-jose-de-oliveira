import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Send, ArrowLeft, User, Mail, Calendar, Shield, MessageCircle, Search } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

function timeAgo(d) {
  if (!d) return 'Nunca';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora';
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  return `${days}d atrás`;
}

const ROLE_LABELS = { member: '👤 Membro', leader: '⭐ Líder', pastor: '🙏 Pastor', admin: '👑 Admin' };
const ROLE_COLORS = { member: '#666', leader: '#e67e22', pastor: '#4caf50', admin: '#e74c3c' };

const ADMIN_ID = 'c7c930da-5fe8-4b4e-887d-ba547804b7e1';

export default function Members() {
  const { token, user } = useAuth();
  const isAdmin = user?.id === ADMIN_ID;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMembers() {
    try {
      const res = await fetch(`${API}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  }

  async function openChat(member) {
    setSelectedMember(member);
    setLoadingMsgs(true);
    try {
      const res = await fetch(`${API}/members/messages/${member.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMsgs(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/members/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: selectedMember.id, content: newMsg }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
        setNewMsg('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  }

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getAvatarUrl = (url) => url ? (url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || ''}${url}`) : null;

  // Chat view
  if (selectedMember) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem', background: '#fff', borderRadius: 12, marginBottom: '0.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <button onClick={() => setSelectedMember(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ArrowLeft size={22} color="#1a0a3e" />
          </button>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {selectedMember.avatar_url ? (
              <img src={getAvatarUrl(selectedMember.avatar_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={20} color="#fff" />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a0a3e' }}>{selectedMember.full_name}</div>
            <div style={{ fontSize: '0.75rem', color: ROLE_COLORS[selectedMember.role] }}>{ROLE_LABELS[selectedMember.role]}</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loadingMsgs ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Carregando...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
              <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>Nenhuma mensagem ainda. Envie a primeira!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.sender_id === selectedMember.id ? false : true;
              return (
                <div key={msg.id} style={{
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '75%', padding: '0.6rem 0.9rem', borderRadius: 16,
                  background: isMine ? '#4caf50' : '#f0f0f0',
                  color: isMine ? '#fff' : '#333',
                  fontSize: '0.9rem', lineHeight: 1.4,
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

        {/* Input */}
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: '0.5rem 0' }}>
          <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
            placeholder="Escreva sua mensagem..."
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

  // Members list
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', color: '#1a0a3e', marginBottom: '1rem' }}>
        <Users size={24} /> Membros da Comunidade
      </h1>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar membro..."
          style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', borderRadius: 12, border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box' }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ padding: '0.5rem 1rem', borderRadius: 10, background: '#e8f5e9', fontSize: '0.85rem', color: '#2e7d32', fontWeight: 600 }}>
          👥 {members.length} membros
        </div>
        <div style={{ padding: '0.5rem 1rem', borderRadius: 10, background: '#fff3e0', fontSize: '0.85rem', color: '#e65100', fontWeight: 600 }}>
          🙏 {members.filter(m => m.role === 'pastor').length} pastores
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Carregando membros...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(member => (
            <div key={member.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem',
              background: '#fff', borderRadius: 12, border: '1px solid #eee',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              {/* Avatar */}
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#daa520', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {member.avatar_url ? (
                  <img src={getAvatarUrl(member.avatar_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={22} color="#fff" />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a0a3e' }}>{member.full_name}</div>
                {isAdmin && (
                <div style={{ fontSize: '0.75rem', color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={12} /> {member.email}
                </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: '0.7rem', color: ROLE_COLORS[member.role], fontWeight: 600 }}>
                    {ROLE_LABELS[member.role]}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#aaa' }}>
                    <Calendar size={10} style={{ verticalAlign: 'middle' }} /> {timeAgo(member.last_seen_at)}
                  </span>
                </div>
              </div>

              {/* Message button */}
              <button onClick={() => openChat(member)} style={{
                padding: '0.4rem 0.8rem', borderRadius: 20, border: 'none',
                background: '#4caf50', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600,
              }}>
                <MessageCircle size={14} /> Chat
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Nenhum membro encontrado</div>
          )}
        </div>
      )}
    </div>
  );
}
