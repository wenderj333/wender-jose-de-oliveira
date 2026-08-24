import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle, XCircle, Info, Trash, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = (import.meta.env.VITE_API_URL || '') + '/api';
function notificationData(notification) {
  if (!notification?.data) return {};
  if (typeof notification.data === 'object') return notification.data;
  try { return JSON.parse(notification.data); } catch (_) { return {}; }
}

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
    case 'message': return <MessageCircle size={20} color="#4caf50" />;
    // Add more types here
    default: return <Bell size={20} color="#daa520" />;
  }
};

export default function NotificationsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); markAllAsRead(); }, []);

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
    const data = notificationData(notification);
    // A navegação deve ficar dentro da aplicação. URLs externas ou malformadas
    // eram enviadas ao router e podiam deixar a página em branco.
    if (typeof data.url === 'string' && data.url.startsWith('/')) return data.url;
    switch (notification.type) {
      case 'flagged_post': 
        return data.postId ? `/?postId=${encodeURIComponent(data.postId)}` : '/';
      case 'like':
        return data.postId ? `/?postId=${encodeURIComponent(data.postId)}` : '/';
      case 'new_direct_message':
      case 'message':
        // Se tem senderId, vai direto para o chat com essa pessoa
        if (data.senderId) {
          return `/mensagens/${data.senderId}`;
        }
        return '/mensagens';
      case 'friend_request':
        // Open the sender profile, where the request can be accepted or declined.
        return data.from ? `/perfil/${data.from}` : '/amigos?tab=requests';
      case 'friend_accepted':
        return data.from ? `/perfil/${data.from}` : '/amigos';
      case 'prayer':
      case 'new_help_request':
        return '/pedidos-ajuda';
      default: 
        return '#';
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
          {notifications.map(n => {
            const link = getNotificationLink(n);
            const canOpen = link && link !== '#';
            return <button key={n.id} type="button" onClick={()=>{ markAsRead(n.id); if (canOpen) navigate(link); }} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '1rem',
              background: n.is_read ? '#f0fff4' : '#fff', borderRadius: 12, border: n.is_read ? '2px solid #86efac' : '2px solid #daa520', transition: 'background 0.3s',
              boxShadow: n.is_read ? 'none' : '0 0 0 2px #daa52030',
              cursor: canOpen ? 'pointer' : 'default', textDecoration: 'none', color: 'inherit', textAlign: 'left', width: '100%', font: 'inherit',
            }}>
              <div style={{ flexShrink: 0 }}><NotificationIcon type={n.type} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1a0a3e', fontSize: '0.95rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 2 }}>{n.body}</div>
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>{timeAgo(n.created_at)}{n.is_read && <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.7rem' }}>✓ Lido</span>}</div>
              </div>
              {!n.is_read && (
                <CheckCircle size={20} color="#4caf50" style={{ flexShrink: 0 }} />
              )}
              {canOpen && <span style={{ color: '#6C3FA0', fontSize: '0.78rem', fontWeight: 700 }}>Abrir ›</span>}
            </button>;
          })}
        </div>
      )}
    </div>
  );
}

