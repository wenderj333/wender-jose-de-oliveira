import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Users, Send, ArrowLeft, User, Mail, MessageCircle, Search, UserPlus } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

function timeAgo(d, t) {
  if (!d) return 'Nunca';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const ROLE_COLORS = { member: '#666', leader: '#e67e22', pastor: '#4caf50', admin: '#e74c3c' };

export default function Members() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    try {
      const res = await fetch(`${API}/members`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const filtered = members.filter(m => m.full_name?.toLowerCase().includes(search.toLowerCase()));
  const getAvatarUrl = (url) => url ? (url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || ''}${url}`) : null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 15px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}>Comunidade</h1>
      
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Pesquisar..."
          style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #dbdbdb', background: '#fafafa', outline: 'none' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#999' }}>Carregando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
          {filtered.map(member => (
            <div key={member.id} 
                 onClick={() => navigate(`/perfil/${member.id}`)}
                 style={{ background: '#fff', border: '1px solid #dbdbdb', borderRadius: '12px', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
              
              {/* Avatar Estilo Instagram */}
              <div style={{ width: 80, height: 80, borderRadius: '50%', padding: '3px', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', marginBottom: '10px' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #fff', overflow: 'hidden', background: '#eee' }}>
                  {member.avatar_url 
                    ? <img src={getAvatarUrl(member.avatar_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={30} color="#ccc" /></div>}
                </div>
              </div>

              <div style={{ fontWeight: '700', fontSize: '0.85rem', textAlign: 'center', marginBottom: '2px', color: '#262626' }}>{member.full_name}</div>
              <div style={{ fontSize: '0.7rem', color: ROLE_COLORS[member.role], fontWeight: '600', marginBottom: '12px' }}>{member.role.toUpperCase()}</div>

              <button style={{ width: '100%', padding: '6px', borderRadius: '8px', border: 'none', background: '#0095f6', color: '#fff', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', marginBottom: '5px' }}>Ver Perfil</button>
              <button style={{ width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid #dbdbdb', background: '#fff', color: '#262626', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>Mensagem</button>
              
              <div style={{ marginTop: '10px', fontSize: '0.6rem', color: '#999' }}>Ativo há {timeAgo(member.last_seen_at, t)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
