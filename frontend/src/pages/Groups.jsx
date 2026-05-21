import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Search, Lock, Globe, ChevronRight, Settings } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

const EMOJI_COVERS = ['🙏','✝️','📖','🕊️','⛪','🎵','❤️','🌟','🌿','🌈'];

export default function Groups() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', is_private: false });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch(`${API}/groups`, { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(data => { setGroups(data.groups || data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const handleCreate = async () => {
    if (!newGroup.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(newGroup)
      });
      const data = await res.json();
      if (data.group) {
        setGroups(prev => [data.group, ...prev]);
        setShowCreate(false);
        setNewGroup({ name: '', description: '', is_private: false });
      }
    } catch(e) {}
    setCreating(false);
  };

  const handleJoin = async (e, groupId) => {
    e.stopPropagation();
    await fetch(`${API}/groups/${groupId}/join`, { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
    setGroups(prev => prev.map(g => g.id === groupId ? {...g, is_member: true, member_count: (g.member_count||0)+1} : g));
  };

  const myGroups = groups.filter(g => g.is_member || g.creator_id === user?.id);
  const filtered = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()));
  const getEmoji = (id) => EMOJI_COVERS[(id || 0) % EMOJI_COVERS.length];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 16px 40px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>👥 Grupos</h1>
          <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>Comunidades de fé e oração</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff',
          border: 'none', borderRadius: 24, padding: '10px 20px',
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Plus size={16}/> Criar Grupo
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar grupos..."
          style={{ width: '100%', padding: '11px 16px 11px 38px', borderRadius: 24, border: '1.5px solid #e8e8f0', fontSize: 14, outline: 'none', background: '#f8f9ff', boxSizing: 'border-box' }}
        />
      </div>

      {myGroups.length > 0 && !search && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#667eea', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meus Grupos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {myGroups.map(g => (
              <div key={g.id} onClick={() => navigate(`/grupos/${g.id}`)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: '#fff', borderRadius: 14, cursor: 'pointer',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s'
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{getEmoji(g.id)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{g.member_count || 0} membros · {g.is_private ? '🔒 Privado' : '🌍 Público'}</div>
                </div>
                <ChevronRight size={16} color="#ccc"/>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#667eea', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {search ? `Resultados para "${search}"` : 'Descobrir Grupos'}
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>A carregar...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>Nenhum grupo encontrado</div>
          <div style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Sê o primeiro a criar uma comunidade!</div>
          <button onClick={() => setShowCreate(true)} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            + Criar Grupo
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {filtered.map(g => (
            <div key={g.id} onClick={() => navigate(`/grupos/${g.id}`)} style={{
              background: '#fff', borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer'
            }}>
              <div style={{ height: 90, background: `linear-gradient(135deg, #667eea, #764ba2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, position: 'relative' }}>
                {getEmoji(g.id)}
                {g.is_private && <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: '2px 8px', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}><Lock size={9}/> Privado</div>}
              </div>
              <div style={{ padding: '14px 14px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}><Users size={11} style={{marginRight:3}}/>{g.member_count || 0} membros</div>
                {g.is_member || g.creator_id === user?.id ? (
                  <div style={{ background: '#f0f4ff', color: '#667eea', borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>✓ Membro</div>
                ) : (
                  <button onClick={e => handleJoin(e, g.id)} style={{ width: '100%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Entrar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Criar Novo Grupo</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
            </div>
            <input value={newGroup.name} onChange={e => setNewGroup(p => ({...p, name: e.target.value}))}
              placeholder="Nome do grupo *"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e8e8f0', fontSize: 14, marginBottom: 12, outline: 'none', boxSizing: 'border-box' }}
            />
            <textarea value={newGroup.description} onChange={e => setNewGroup(p => ({...p, description: e.target.value}))}
              placeholder="Descrição..."
              rows={3}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e8e8f0', fontSize: 14, marginBottom: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setNewGroup(p => ({...p, is_private: false}))} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `2px solid ${!newGroup.is_private ? '#667eea' : '#e8e8f0'}`, background: !newGroup.is_private ? '#f0f4ff' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>🌍 Público</button>
              <button onClick={() => setNewGroup(p => ({...p, is_private: true}))} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `2px solid ${newGroup.is_private ? '#667eea' : '#e8e8f0'}`, background: newGroup.is_private ? '#f0f4ff' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>🔒 Privado</button>
            </div>
            <button onClick={handleCreate} disabled={creating || !newGroup.name.trim()} style={{ width: '100%', padding: '14px', borderRadius: 24, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: (!newGroup.name.trim() || creating) ? 0.6 : 1 }}>
              {creating ? 'A criar...' : '+ Criar Grupo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
