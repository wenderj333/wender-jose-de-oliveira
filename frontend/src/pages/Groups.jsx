import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Search, Lock, Globe, ChevronRight } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function Groups() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', is_private: false });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch(`${API}/groups`, { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(data => {
        const all = data.groups || data || [];
        setGroups(all);
        setMyGroups(all.filter(g => g.is_member || g.creator_id === user?.id));
        setLoading(false);
      })
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
        setMyGroups(prev => [data.group, ...prev]);
        setShowCreate(false);
        setNewGroup({ name: '', description: '', is_private: false });
      }
    } catch(e) {}
    setCreating(false);
  };

  const handleJoin = async (groupId) => {
    await fetch(`${API}/groups/${groupId}/join`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token }
    });
    setGroups(prev => prev.map(g => g.id === groupId ? {...g, is_member: true, member_count: (g.member_count||0)+1} : g));
  };

  const filtered = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()));

  const GroupCard = ({ group }) => (
    <div onClick={() => navigate(`/grupos/${group.id}`)} style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)', cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      onMouseEnter: e => e.currentTarget.style.transform = 'translateY(-4px)'
    }}>
      <div style={{
        height: 100, background: group.cover_url ? `url(${group.cover_url}) center/cover` : 'linear-gradient(135deg, #667eea, #764ba2)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute', bottom: -24, left: 16,
          width: 48, height: 48, borderRadius: 12,
          background: '#fff', padding: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: 10,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20
          }}>🙏</div>
        </div>
        {group.is_private && <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: '2px 8px',
          color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4
        }}><Lock size={10}/> Privado</div>}
      </div>
      <div style={{ padding: '32px 16px 16px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 4 }}>{group.name}</div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {group.description || 'Grupo cristão de comunhão e oração'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' }}>
            <Users size={13}/> {group.member_count || 0} membros
          </div>
          {group.is_member || group.creator_id === user?.id ? (
            <div style={{ background: '#e8f0fe', color: '#3a6ad4', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
              ✓ Membro
            </div>
          ) : (
            <button onClick={e => { e.stopPropagation(); handleJoin(group.id); }} style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff',
              border: 'none', borderRadius: 20, padding: '4px 14px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer'
            }}>+ Entrar</button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px' }}>

      {/* Header */}
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

      {/* Pesquisa */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar grupos..."
          style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 24, border: '1.5px solid #e8e8f0', fontSize: 14, outline: 'none', background: '#f8f9ff' }}
        />
      </div>

      {/* Meus Grupos */}
      {myGroups.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>Meus Grupos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myGroups.map(g => (
              <div key={g.id} onClick={() => navigate(`/grupos/${g.id}`)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: '#fff', borderRadius: 12, cursor: 'pointer',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🙏</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{g.member_count || 0} membros • {g.is_private ? '🔒 Privado' : '🌍 Público'}</div>
                </div>
                <ChevronRight size={16} color="#ccc"/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Todos os Grupos */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>
        {search ? `Resultados para "${search}"` : 'Descobrir Grupos'}
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>A carregar...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>Nenhum grupo encontrado</div>
          <div style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Sê o primeiro a criar uma comunidade!</div>
          <button onClick={() => setShowCreate(true)} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
            + Criar Grupo
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {filtered.map(g => <GroupCard key={g.id} group={g}/>)}
        </div>
      )}

      {/* Modal Criar Grupo */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Criar Novo Grupo</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
            </div>
            <input value={newGroup.name} onChange={e => setNewGroup(p => ({...p, name: e.target.value}))}
              placeholder="Nome do grupo *"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e8e8f0', fontSize: 14, marginBottom: 12, outline: 'none', boxSizing: 'border-box' }}
            />
            <textarea value={newGroup.description} onChange={e => setNewGroup(p => ({...p, description: e.target.value}))}
              placeholder="Descrição do grupo..."
              rows={3}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e8e8f0', fontSize: 14, marginBottom: 12, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setNewGroup(p => ({...p, is_private: false}))} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `2px solid ${!newGroup.is_private ? '#667eea' : '#e8e8f0'}`, background: !newGroup.is_private ? '#f0f4ff' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                🌍 Público
              </button>
              <button onClick={() => setNewGroup(p => ({...p, is_private: true}))} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `2px solid ${newGroup.is_private ? '#667eea' : '#e8e8f0'}`, background: newGroup.is_private ? '#f0f4ff' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                🔒 Privado
              </button>
            </div>
            <button onClick={handleCreate} disabled={creating || !newGroup.name.trim()} style={{
              width: '100%', padding: '14px', borderRadius: 24,
              background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff',
              border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer'
            }}>
              {creating ? 'A criar...' : '+ Criar Grupo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
