import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Users, User, MessageCircle, Search, ShieldCheck, Heart } from 'lucide-react';

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

const ROLE_STYLES = {
  member: { bg: '#f0f2f5', color: '#65676b', label: 'Membro' },
  leader: { bg: '#fff4e5', color: '#ff8c00', label: 'Líder' },
  pastor: { bg: '#e7f3ff', color: '#0095f6', label: 'Pastor' },
  admin: { bg: '#feebeb', color: '#e74c3c', label: 'Admin' }
};

export default function Members() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API}/members`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setMembers(data.members || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const filtered = members.filter(m => m.full_name?.toLowerCase().includes(search.toLowerCase()));
  const getAvatarUrl = (url) => url ? (url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || ''}${url}`) : null;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 20px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#262626', marginBottom: '10px' }}>Comunidade Sigo com Fé</h1>
        <p style={{ color: '#8e8e8e' }}>Conecte-se com irmãos e irmãs de todo o mundo</p>
      </div>

      {/* Barra de Busca Estilizada */}
      <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto 40px auto' }}>
        <Search size={20} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#8e8e8e' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Encontrar pessoas..."
          style={{ 
            width: '100%', padding: '15px 15px 15px 50px', borderRadius: '30px', 
            border: '1px solid #dbdbdb', background: '#fff', fontSize: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)', outline: 'none'
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Carregando irmãos...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
          {filtered.map(member => {
            const style = ROLE_STYLES[member.role] || ROLE_STYLES.member;
            return (
              <div key={member.id}
                style={{ 
                  background: '#fff', borderRadius: '20px', padding: '25px 15px', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #efefef',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Avatar com Story Ring */}
                <div 
                  onClick={() => navigate(`/perfil/${member.id}`)}
                  style={{ 
                    width: 90, height: 90, borderRadius: '50%', padding: '3px', cursor: 'pointer',
                    background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', 
                    marginBottom: '15px' 
                  }}
                >
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #fff', overflow: 'hidden', background: '#eee' }}>
                    {member.avatar_url
                      ? <img src={getAvatarUrl(member.avatar_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={40} color="#ccc" /></div>}
                  </div>
                </div>

                <div style={{ fontWeight: '700', fontSize: '1rem', color: '#262626', marginBottom: '5px' }}>{member.full_name}</div>
                
                {/* Badge de Cargo */}
                <div style={{ 
                  fontSize: '0.7rem', padding: '4px 12px', borderRadius: '20px', 
                  background: style.bg, color: style.color, fontWeight: '700', 
                  marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' 
                }}>
                  {style.label}
                </div>

                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button 
                    onClick={() => navigate(`/perfil/${member.id}`)}
                    style={{ 
                      flex: 2, padding: '10px', borderRadius: '10px', border: 'none', 
                      background: '#0095f6', color: '#fff', fontWeight: '700', cursor: 'pointer' 
                    }}
                  >
                    Ver Perfil
                  </button>
                  <button 
                    onClick={() => navigate(`/chat/${member.id}`)}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '10px', border: 'none', 
                      background: '#efefef', color: '#262626', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>

                <div style={{ marginTop: '15px', fontSize: '0.65rem', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   <div style={{ width: 6, height: 6, borderRadius: '50%', background: (Date.now() - new Date(member.last_seen_at).getTime() < 300000) ? '#4caf50' : '#ccc' }}></div>
                   Ativo há {timeAgo(member.last_seen_at)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
