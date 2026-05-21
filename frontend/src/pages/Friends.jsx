import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Users, UserMinus, MessageCircle, Search, UserCheck, Clock, User } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function Friends() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tabFromUrl = new URLSearchParams(location.search).get('tab');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'my');
  const [requests, setRequests] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fr, rq] = await Promise.all([
        fetch(API + '/friends', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
        fetch(API + '/friends/requests', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json())
      ]);
      setFriends(fr.friends || fr || []);
      setRequests(rq.requests || rq || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const acceptRequest = async (friendshipId) => {
    try {
      await fetch(API + '/friends/accept/' + friendshipId, { method: 'PUT', headers: { Authorization: 'Bearer ' + token } });
      await loadData();
      alert('Amizade aceite!');
    } catch(e) { console.error(e); }
  };
  useEffect(() => { loadData(); }, [token]);

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm(t('friends.confirmRemove', 'Remover amigo?'))) return;
    try {
      await fetch(`${API}/friends/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: "Bearer " + token }
      });
      setFriends(friends.filter(f => f.id !== friendId));
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
        <Users size={28} color="#0095f6" />
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{t('friends.title', 'Amigos')}</h1>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto' }}>
        {[
          { id: 'my', label: t('friends.myFriends', 'Meus Amigos'), icon: <UserCheck size={16} /> },
          { id: 'requests', label: t('friends.requests', 'Solicitações'), icon: <Users size={16} /> },
          { id: 'search', label: t('friends.search', 'Descobrir'), icon: <Search size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '25px',
              border: 'none', cursor: 'pointer', fontWeight: '600',
              background: activeTab === tab.id ? '#0095f6' : '#efefef',
              color: activeTab === tab.id ? '#fff' : '#262626'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <p style={{ textAlign: 'center' }}>{t('common.loading', 'Carregando...')}</p>
        ) : activeTab === 'requests' ? (
          requests.length > 0 ? requests.map(req => (
            <div key={req.friendship_id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'15px', background:'#fff', borderRadius:'15px', border:'1px solid #dbdbdb' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'50px', height:'50px', borderRadius:'50%', overflow:'hidden', background:'#eee', border:'2px solid #0095f6' }}>
                  {req.avatar_url ? <img src={req.avatar_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <User color='#ccc' size={30} />}
                </div>
                <div>
                  <div style={{ fontWeight:'700', color:'#262626' }}>{req.full_name}</div>
                  <div style={{ fontSize:'12px', color:'#8e8e8e' }}>Quer ser teu amigo</div>
                </div>
              </div>
              <button onClick={() => acceptRequest(req.friendship_id)} style={{ padding:'8px 16px', borderRadius:'8px', border:'none', background:'#0095f6', color:'white', fontWeight:'600', cursor:'pointer' }}>
                ✅ Aceitar
              </button>
            </div>
          )) : <p style={{ textAlign:'center', color:'#8e8e8e' }}>Sem pedidos pendentes.</p>
        ) : friends.length > 0 ? (
          friends.map((friend) => {
            const avatarUrl = friend.avatar_url ? (friend.avatar_url.startsWith('http') ? friend.avatar_url : (import.meta.env.VITE_API_URL || '') + friend.avatar_url) : null;
            
            return (
              <div key={friend.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '15px', background: '#fff', borderRadius: '15px',
                border: '1px solid #dbdbdb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => navigate(`/perfil/${friend.id}`)}>
                  <div style={{ width: '55px', height: '55px', borderRadius: '50%', overflow: 'hidden', background: '#eee', border: '2px solid #0095f6' }}>
                    {avatarUrl ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User color="#ccc" /></div>}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#262626' }}>{friend.full_name || friend.name}</div>
                    <div style={{ fontSize: '12px', color: '#8e8e8e' }}>@{friend.username || 'membro'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => navigate(`/mensagens/${friend.id}`)} style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: '#efefef', fontWeight: '600', cursor: 'pointer' }}>
                    {t('friends.chat', 'Chat')}
                  </button>
                  <button onClick={() => handleRemoveFriend(friend.id)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ffcccc', background: '#fff', color: '#ed4956', cursor: 'pointer' }}>
                    <UserMinus size={18} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', color: '#8e8e8e' }}>{t('friends.noFriends', 'Nenhum amigo encontrado.')}</p>
        )}
      </div>
    </div>
  );
}
