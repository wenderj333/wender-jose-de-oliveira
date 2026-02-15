import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle, XCircle, Info, Trash, MessageCircle } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';
const FRONTEND_URL = 'https://sigo-com-fe.vercel.app'; // Or wherever your frontend is deployed

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora';
  if (mins < 60) return `Há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Há ${days}d`;
}

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'flagged_post': return <XCircle size={20} color="#e74c3c" />;
    case 'new_help_request': return <Info size={20} color="#3498db" />;
    case 'new_direct_message': return <MessageCircle size={20} color="#4caf50" />;
    // Add more types here
    default: return <Bell size={20} color="#daa520" />;
  }
};

export default function NotificationsPage() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    if (!user) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) { console.error('Error fetching notifications:', err); }
    finally { setLoading(false); }
  }

  async function markAsRead(id) {
    try {
      await fetch(`${API}/notifications/${id}/read`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error('Error marking read:', err); }
  }

  async function markAllAsRead() {
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) { console.error('Error marking all read:', err); }
  }

  const getNotificationLink = (notification) => {
    if (notification.data?.url) {
      return notification.data.url.startsWith('/') ? `${FRONTEND_URL}${notification.data.url}` : notification.data.url;
    }
    switch (notification.type) {
      case 'flagged_post': return `${FRONTEND_URL}/mural?postId=${notification.data?.postId}`; // Example for linking to a specific post
      case 'new_direct_message': return `${FRONTEND_URL}/mensagens`;
      // Add more specific links here
      default: return '#';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Carregando notificações...</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', color: '#1a0a3e', margin: 0 }}>
          <Bell size={24} /> Notificações
        </h1>
        {notifications.some(n => !n.is_read) && (
          <button onClick={markAllAsRead} style={{
            padding: '0.4rem 0.8rem', borderRadius: 20, border: '1px solid #ddd',
            background: '#fff', color: '#666', fontSize: '0.8rem', cursor: 'pointer',
          }}>Marcar todas como lidas</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          <Info size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>Nenhuma notificação por enquanto.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map(n => (
            <a key={n.id} href={getNotificationLink(n)} onClick={() => markAsRead(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '1rem',
              background: n.is_read ? '#f8f8f8' : '#fff', borderRadius: 12, border: n.is_read ? '1px solid #eee' : '1px solid #daa520',
              boxShadow: n.is_read ? 'none' : '0 0 0 2px #daa52030',
              cursor: 'pointer', textDecoration: 'none', color: 'inherit',
            }}>
              <div style={{ flexShrink: 0 }}><NotificationIcon type={n.type} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1a0a3e', fontSize: '0.95rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 2 }}>{n.body}</div>
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: 4 }}>{timeAgo(n.created_at)}</div>
              </div>
              {!n.is_read && (
                <CheckCircle size={20} color="#4caf50" style={{ flexShrink: 0 }} />
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
