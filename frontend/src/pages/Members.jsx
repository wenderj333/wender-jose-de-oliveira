import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Search, MessageCircle, UserPlus, UserCheck, Clock, Send, ArrowLeft, User } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

function timeAgo(d, t) {
  if (!d) return t('members.never', 'Nunca');
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('members.now', 'Agora');
  if (mins < 60) return t('members.minsAgo', '{{mins}}m', { mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('members.hoursAgo', '{{hrs}}h', { hrs });
  const days = Math.floor(hrs / 24);
  return t('members.daysAgo', '{{days}}d', { days });
}

function isOnline(last_seen_at) {
  if (!last_seen_at) return false;
  return Date.now() - new Date(last_seen_at).getTime() < 5 * 60 * 1000;
}

const ADMIN_ID = 'c7c930da-5fe8-4b4e-887d-ba547804b7e1';

export default function Members() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.id === ADMIN_ID;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [friendMsg, setFriendMsg] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());
  const [selectedMember, setSelectedMember] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { fetchMembers(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function fetchMembers() {
    try {
      const res = await fetch(`${API}/members`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function sendFriendRequest(e, memberId) {
    e.stopPropagation();
    try {
      const res = await fetch(`${API}/friends/request`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressee_id: memberId }),
      });
      const data = await res.json();
      setFriendMsg(data.message || t('members.requestSent', 'Pedido enviado!'));
      setSentRequests(prev => new Set([...prev, memberId]));
      setTimeout(() => setFriendMsg(''), 3000);
    } catch (err) { console.error(err); }
  }

  async function openChat(e, member) {
    e.stopPropagation();
    setSelectedMember(member);
    setLoadingMsgs(true);
    try {
      const res = await fetch(`${API}/members/messages/${member.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) { console.error(err); }
    finally { setLoadingMsgs(false); }
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
      if (data.message) { setMessages(prev => [...prev, data.message]); setNewMsg(''); }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  }

  const getAvatarUrl = (url) => url ? (url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || ''}${url}`) : null;

  const filtered = members.filter(m => {
    const matchSearch = m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.username?.toLowerCase().includes(search.toLowerCase()) ||
      (isAdmin && m.email?.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'online') return matchSearch && isOnline(m.last_seen_at);
    if (filter === 'new') {
      const days = (Date.now() - new Date(m.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return matchSearch && days <= 7;
    }
    if (filter === 'friends') return matchSearch && m.friendship_status === 'accepted';
    return matchSearch;
  });

  // ── CHAT VIEW ──────────────────────────────────────────
  if (selectedMember) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem', background: '#fff', borderRadius: 16, marginBottom: '0.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <button onClick={() => setSelectedMember(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ArrowLeft size={22} color="#1a0a3e" />
          </button>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#daa520' }}>
              {getAvatarUrl(selectedMember.avatar_url)
                ? <img src={getAvatarUrl(selectedMember.avatar_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={22} color="#fff" /></div>}
            </div>
            {isOnline(selectedMember.last_seen_at) && (
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' }} />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a0a3e' }}>{selectedMember.full_name}</div>
            <div style={{ fontSize: '0.75rem', color: isOnline(selectedMember.last_seen_at) ? '#22c55e' : '#999' }}>
              {isOnline(selectedMember.last_seen_at) ? t('members.online', 'Online') : timeAgo(selectedMember.last_seen_at, t)}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loadingMsgs ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>{t('members.loading', 'Carregando...')}</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
              <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>{t('members.noMessages', 'Nenhuma mensagem ainda.')}</p>
            </div>
          ) : messages.map(msg => {
            const isMine = msg.sender_id !== selectedMember.id;
            return (
              <div key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%', padding: '0.6rem 0.9rem', borderRadius: 18, background: isMine ? 'linear-gradient(135deg, #DAA520, #FFD700)' : '#f0f0f0', color: isMine ? '#fff' : '#333', fontSize: '0.9rem', lineHeight: 1.4 }}>
                {msg.content}
                <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: '0.5rem 0' }}>
          <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
            placeholder={t('members.typeMessage', 'Escreva uma mensagem...')}
            style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: 25, border: '1.5px solid #ddd', fontSize: '0.9rem', outline: 'none' }} />
          <button type="submit" disabled={sending || !newMsg.trim()} style={{ width: 46, height: 46, borderRadius: '50%', border: 'none', background: newMsg.trim() ? 'linear-gradient(135deg, #DAA520, #FFD700)' : '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={18} color="#fff" />
          </button>
        </form>
      </div>
    );
  }

  // ── MAIN VIEW ──────────────────────────────────────────
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a0a3e', marginBottom: '1.25rem', textAlign: 'center' }}>
        👥 {t('members.title', 'Membros da Comunidade')}
      </h1>

      {friendMsg && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '10px 16px', borderRadius: 12, marginBottom: 12, fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>
          ✅ {friendMsg}
        </div>
      )}

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('members.searchPlaceholder', 'Pesquisar membro...')}
          style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.75rem', borderRadius: 14, border: '1.5px solid #e8e8e8', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', background: '#fafafa' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `👥 ${t('members.all', 'Todos')} (${members.length})` },
          { key: 'online', label: `🟢 ${t('members.online', 'Online')}` },
          { key: 'new', label: `✨ ${t('members.new', 'Novos')}` },
          { key: 'friends', label: `❤️ ${t('members.friends', 'Amigos')}` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '0.45rem 1rem', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            background: filter === f.key ? 'linear-gradient(135deg, #1a0a3e, #2d1b69)' : '#f0f0f0',
            color: filter === f.key ? '#fff' : '#555',
            transition: 'all 0.2s',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#f0f0f0', borderRadius: 16, height: 200, opacity: 0.5 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {filtered.map(member => (
            <div key={member.id} onClick={() => navigate(`/perfil/${member.id}`)}
              style={{ background: '#fff', borderRadius: 18, padding: '1.25rem 0.75rem 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #DAA520, #FFD700)', overflow: 'hidden', border: isOnline(member.last_seen_at) ? '3px solid #22c55e' : '3px solid #e8e8e8' }}>
                  {getAvatarUrl(member.avatar_url)
                    ? <img src={getAvatarUrl(member.avatar_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={28} color="#fff" /></div>}
                </div>
                {isOnline(member.last_seen_at) && (
                  <div style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' }} />
                )}
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', marginBottom: 2, lineHeight: 1.2 }}>
                {member.full_name || member.username}
              </div>

              {member.username && (
                <div style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: 4 }}>@{member.username}</div>
              )}

              <div style={{ fontSize: '0.65rem', color: isOnline(member.last_seen_at) ? '#22c55e' : '#bbb', marginBottom: '0.75rem', fontWeight: isOnline(member.last_seen_at) ? 600 : 400 }}>
                {isOnline(member.last_seen_at) ? `🟢 ${t('members.online', 'Online')}` : timeAgo(member.last_seen_at, t)}
              </div>

              {member.id !== user?.id && (
                <div style={{ display: 'flex', gap: 5, width: '100%' }}>
                  {member.friendship_status === 'accepted' ? (
                    <button style={{ flex: 1, padding: '0.4rem 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      <UserCheck size={11} /> {t('members.friends', 'Amigos')}
                    </button>
                  ) : sentRequests.has(member.id) ? (
                    <button style={{ flex: 1, padding: '0.4rem 0', borderRadius: 10, border: 'none', background: '#e0e0e0', color: '#999', fontSize: '0.7rem', fontWeight: 700, cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      <Clock size={11} /> {t('members.pending', 'Pendente')}
                    </button>
                  ) : (
                    <button onClick={(e) => sendFriendRequest(e, member.id)}
                      style={{ flex: 1, padding: '0.4rem 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #1a0a3e, #2d1b69)', color: '#fff', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      <UserPlus size={11} /> {t('members.follow', 'Seguir')}
                    </button>
                  )}
                  <button onClick={(e) => openChat(e, member)}
                    style={{ flex: 1, padding: '0.4rem 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #DAA520, #FFD700)', color: '#fff', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <MessageCircle size={11} /> {t('members.chat', 'Chat')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#bbb' }}>
          <p>{t('members.noMembers', 'Nenhum membro encontrado')}</p>
        </div>
      )}
    </div>
  );
}
