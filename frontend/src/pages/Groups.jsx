import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Lock, Globe, ArrowLeft, Send, Image, User } from 'lucide-react';

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

export default function Groups() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrivacy, setNewPrivacy] = useState('public');
  const [newPost, setNewPost] = useState('');
  const [creating, setCreating] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  async function fetchGroups() {
    try {
      const res = await fetch(`${API}/groups`);
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function openGroup(id) {
    try {
      const res = await fetch(`${API}/groups/${id}`);
      const data = await res.json();
      setGroupData(data);
      setSelectedGroup(id);
    } catch (err) { console.error(err); }
  }

  async function createGroup(e) {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch(`${API}/groups`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc, privacy: newPrivacy }),
      });
      const data = await res.json();
      if (data.group) {
        setShowCreate(false);
        setNewName(''); setNewDesc('');
        fetchGroups();
      }
    } catch (err) { console.error(err); }
    finally { setCreating(false); }
  }

  async function joinGroup(id) {
    try {
      await fetch(`${API}/groups/${id}/join`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      openGroup(id);
    } catch (err) { console.error(err); }
  }

  async function leaveGroup(id) {
    try {
      await fetch(`${API}/groups/${id}/leave`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedGroup(null); setGroupData(null);
      fetchGroups();
    } catch (err) { console.error(err); }
  }

  async function postInGroup(e) {
    e.preventDefault();
    if (!newPost.trim() || posting) return;
    setPosting(true);
    try {
      await fetch(`${API}/groups/${selectedGroup}/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
      });
      setNewPost('');
      openGroup(selectedGroup);
    } catch (err) { console.error(err); }
    finally { setPosting(false); }
  }

  const isMember = groupData?.members?.some(m => m.id === user?.id);
  const getAvatar = (url) => url ? (url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || ''}${url}`) : null;

  // Group detail view
  if (selectedGroup && groupData) {
    const g = groupData.group;
    return (
      <div style={{ maxWidth: 650, margin: '0 auto', padding: '1rem 0.5rem' }}>
        <button onClick={() => { setSelectedGroup(null); setGroupData(null); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: '1rem', color: '#1a0a3e' }}>
          <ArrowLeft size={20} /> Voltar
        </button>

        {/* Group header */}
        <div style={{ background: 'linear-gradient(135deg, #1a0a3e, #4a1a8e)', borderRadius: 16, padding: '1.5rem', color: '#fff', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{g.name}</h2>
          {g.description && <p style={{ opacity: 0.8, fontSize: '0.85rem', marginTop: 6 }}>{g.description}</p>}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.8rem', opacity: 0.7 }}>
            <span>{g.privacy === 'private' ? '🔒 Privado' : '🌐 Público'}</span>
            <span>👥 {groupData.members?.length || 0} membros</span>
          </div>
          {user && !isMember && (
            <button onClick={() => joinGroup(selectedGroup)} style={{
              marginTop: 12, padding: '0.5rem 1.5rem', borderRadius: 20, border: 'none',
              background: '#daa520', color: '#fff', fontWeight: 600, cursor: 'pointer',
            }}>+ Entrar no Grupo</button>
          )}
          {user && isMember && (
            <button onClick={() => leaveGroup(selectedGroup)} style={{
              marginTop: 12, padding: '0.4rem 1rem', borderRadius: 20, border: '1px solid rgba(255,255,255,0.3)',
              background: 'transparent', color: '#fff', fontSize: '0.8rem', cursor: 'pointer',
            }}>Sair do Grupo</button>
          )}
        </div>

        {/* Members */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', overflowX: 'auto', padding: 4 }}>
          {groupData.members?.map(m => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#daa520', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {m.avatar_url ? <img src={getAvatar(m.avatar_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} color="#fff" />}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#666', marginTop: 2, textAlign: 'center' }}>{m.full_name?.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* New post */}
        {user && isMember && (
          <form onSubmit={postInGroup} style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
            <input value={newPost} onChange={e => setNewPost(e.target.value)}
              placeholder="Escreva no grupo..." style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: 25, border: '1px solid #ddd', fontSize: '0.85rem' }} />
            <button type="submit" disabled={posting || !newPost.trim()} style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none',
              background: newPost.trim() ? '#daa520' : '#ccc', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Send size={16} color="#fff" /></button>
          </form>
        )}

        {/* Posts */}
        {groupData.posts?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Nenhuma publicação ainda</div>
        ) : (
          groupData.posts?.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: 8, border: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#daa520', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {p.author_avatar ? <img src={getAvatar(p.author_avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={14} color="#fff" />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.author_name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#999' }}>{timeAgo(p.created_at)}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{p.content}</div>
              {p.media_url && <img src={p.media_url} alt="" style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />}
            </div>
          ))
        )}
      </div>
    );
  }

  // Groups list view
  return (
    <div style={{ maxWidth: 650, margin: '0 auto', padding: '1rem 0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', color: '#1a0a3e', margin: 0 }}>
          <Users size={24} /> {t('groups.title')}
        </h1>
        {user && (
          <button onClick={() => setShowCreate(true)} style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '0.5rem 1rem',
            borderRadius: 20, border: 'none', background: '#daa520', color: '#fff',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
          }}><Plus size={16} /> {t('groups.createGroup')}</button>
        )}
      </div>

      {/* Create group modal */}
      {showCreate && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', border: '2px solid #daa520' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#1a0a3e' }}>{t('groups.newGroup')}</h3>
          <form onSubmit={createGroup}>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder={t('groups.groupName')} required
              style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', marginBottom: 8, fontSize: '0.9rem', boxSizing: 'border-box' }} />
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)}
              placeholder={t('groups.description')} rows={3}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', marginBottom: 8, fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button type="button" onClick={() => setNewPrivacy('public')} style={{
                padding: '0.4rem 1rem', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: newPrivacy === 'public' ? '#4caf50' : '#eee',
                color: newPrivacy === 'public' ? '#fff' : '#666',
              }}><Globe size={14} style={{ verticalAlign: 'middle' }} /> {t('groups.public')}</button>
              <button type="button" onClick={() => setNewPrivacy('private')} style={{
                padding: '0.4rem 1rem', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: newPrivacy === 'private' ? '#e74c3c' : '#eee',
                color: newPrivacy === 'private' ? '#fff' : '#666',
              }}><Lock size={14} style={{ verticalAlign: 'middle' }} /> {t('groups.private')}</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={creating} style={{
                padding: '0.5rem 1.5rem', borderRadius: 20, border: 'none',
                background: '#daa520', color: '#fff', fontWeight: 600, cursor: 'pointer',
              }}>{creating ? t('groups.creating') : t('groups.createGroup')}</button>
              <button type="button" onClick={() => setShowCreate(false)} style={{
                padding: '0.5rem 1rem', borderRadius: 20, border: '1px solid #ddd',
                background: '#fff', color: '#666', cursor: 'pointer',
              }}>{t('groups.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Carregando...</div>
      ) : groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>{t('groups.noGroups')}</p>
          <p style={{ fontSize: '0.85rem' }}>{t('groups.createFirst')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {groups.map(g => (
            <div key={g.id} onClick={() => openGroup(g.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '1rem',
              background: '#fff', borderRadius: 12, border: '1px solid #eee', cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #1a0a3e, #4a1a8e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {g.cover_url ? <img src={g.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                  : <Users size={24} color="#daa520" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1a0a3e', fontSize: '0.95rem' }}>{g.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>
                  {g.privacy === 'private' ? '🔒 Privado' : '🌐 Público'} • 👥 {g.member_count} membros
                </div>
                {g.description && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 250 }}>{g.description}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
