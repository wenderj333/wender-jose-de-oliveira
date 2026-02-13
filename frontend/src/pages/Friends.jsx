import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, UserCheck, Search } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

export default function Friends() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [tab, setTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${API}/friends`, { headers });
      const data = await res.json();
      setFriends(data.friends || []);
    } catch (e) { console.error(e); }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API}/friends/requests`, { headers });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/friends/search?q=${encodeURIComponent(searchQuery)}`, { headers });
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const sendRequest = async (addresseeId) => {
    try {
      const res = await fetch(`${API}/friends/request`, {
        method: 'POST', headers, body: JSON.stringify({ addressee_id: addresseeId }),
      });
      if (res.ok) {
        setMessage(t('friends.requestSent'));
        handleSearch(); // refresh results
      }
    } catch (e) { console.error(e); }
    setTimeout(() => setMessage(''), 3000);
  };

  const acceptRequest = async (friendshipId) => {
    try {
      const res = await fetch(`${API}/friends/accept/${friendshipId}`, { method: 'PUT', headers });
      if (res.ok) {
        setMessage(t('friends.friendAdded'));
        fetchRequests();
        fetchFriends();
      }
    } catch (e) { console.error(e); }
    setTimeout(() => setMessage(''), 3000);
  };

  const rejectRequest = async (friendshipId) => {
    try {
      await fetch(`${API}/friends/reject/${friendshipId}`, { method: 'PUT', headers });
      fetchRequests();
    } catch (e) { console.error(e); }
  };

  const removeFriend = async (friendshipId) => {
    try {
      const res = await fetch(`${API}/friends/${friendshipId}`, { method: 'DELETE', headers });
      if (res.ok) {
        setMessage(t('friends.friendRemoved'));
        fetchFriends();
      }
    } catch (e) { console.error(e); }
    setTimeout(() => setMessage(''), 3000);
  };

  const getInitials = (name) => (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const Avatar = ({ user }) => (
    user.avatar_url
      ? <img src={user.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
      : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{getInitials(user.full_name || user.display_name)}</div>
  );

  return (
    <div className="page-container" style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Users size={28} /> {t('friends.title')}
      </h1>

      {message && <div style={{ background: '#d4edda', color: '#155724', padding: '10px 16px', borderRadius: 8, marginBottom: 16 }}>{message}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${tab === 'friends' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('friends')}>
          <UserCheck size={14} style={{ marginRight: 4 }} />{t('friends.myFriends')}
        </button>
        <button className={`btn ${tab === 'requests' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('requests')}>
          <UserPlus size={14} style={{ marginRight: 4 }} />{t('friends.requests')}
          {requests.length > 0 && <span style={{ marginLeft: 4, background: '#e74c3c', color: '#fff', borderRadius: '50%', padding: '1px 6px', fontSize: 11 }}>{requests.length}</span>}
        </button>
        <button className={`btn ${tab === 'search' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('search')}>
          <Search size={14} style={{ marginRight: 4 }} />{t('friends.search')}
        </button>
      </div>

      {/* Search Tab */}
      {tab === 'search' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={t('friends.searchPlaceholder')}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSearch} disabled={loading}>
              <Search size={16} />
            </button>
          </div>
          {searchResults.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <Avatar user={u} />
              <span style={{ flex: 1, fontWeight: 500 }}>{u.full_name || u.display_name}</span>
              {u.friendship_status === 'accepted' ? (
                <span style={{ color: '#27ae60', fontSize: 13 }}><UserCheck size={14} /> {t('friends.myFriends')}</span>
              ) : u.friendship_status === 'pending' ? (
                <span style={{ color: '#f39c12', fontSize: 13 }}>{t('friends.pending')}</span>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => sendRequest(u.id)}>
                  <UserPlus size={14} style={{ marginRight: 4 }} />{t('friends.addFriend')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Friends Tab */}
      {tab === 'friends' && (
        <div>
          {friends.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>{t('friends.noFriends')}</p>
          ) : friends.map(f => (
            <div key={f.friendship_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <Avatar user={f} />
              <span style={{ flex: 1, fontWeight: 500 }}>{f.full_name || f.display_name}</span>
              <button className="btn btn-outline btn-sm" onClick={() => removeFriend(f.friendship_id)} style={{ color: '#e74c3c', borderColor: '#e74c3c', fontSize: 12 }}>
                {t('friends.removeFriend')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>{t('friends.noRequests')}</p>
          ) : requests.map(r => (
            <div key={r.friendship_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <Avatar user={r} />
              <span style={{ flex: 1, fontWeight: 500 }}>{r.full_name || r.display_name}</span>
              <button className="btn btn-primary btn-sm" onClick={() => acceptRequest(r.friendship_id)}>
                {t('friends.accept')}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => rejectRequest(r.friendship_id)} style={{ color: '#e74c3c' }}>
                {t('friends.reject')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
