import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../context/WebSocketContext';
import { ShieldAlert, Clock, CheckCircle, Loader, User, Phone, MessageCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const TYPE_LABELS = {
  seeThings: '👁️',
  hearThings: '👂',
  feelAlone: '💔',
  needPrayer: '🙏',
  anxious: '😰',
  depressed: '😢',
};

const STATUS_COLORS = {
  pending: '#e74c3c',
  in_progress: '#f39c12',
  resolved: '#27ae60',
};

export default function HelpRequests() {
  const { t } = useTranslation();
  const { lastEvent } = useWebSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Load existing requests
  useEffect(() => {
    fetch(`${API_BASE}/api/help-requests`)
      .then(r => r.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Listen for real-time new requests via WebSocket
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === 'new_help_request') {
      setRequests(prev => [lastEvent.request, ...prev]);
    }
    if (lastEvent.type === 'help_request_update') {
      setRequests(prev => prev.map(r =>
        r.id === lastEvent.id ? { ...r, status: lastEvent.status } : r
      ));
    }
  }, [lastEvent]);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/api/help-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) { /* ok */ }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('helpRequests.justNow');
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div>
      <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldAlert size={24} style={{ color: '#e74c3c' }} /> {t('helpRequests.title')}
      </h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>{t('helpRequests.subtitle')}</p>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'in_progress', 'resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            style={filter !== f ? { borderColor: STATUS_COLORS[f] || 'var(--gray-300)', color: STATUS_COLORS[f] || 'var(--gray-500)' } : {}}
          >
            {t(`helpRequests.filter_${f}`)}
            {f !== 'all' && ` (${requests.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem' }}>
          <Loader size={20} className="spin" /> {t('helpRequests.loading')}
        </p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
          <CheckCircle size={32} style={{ marginBottom: '0.5rem', color: 'var(--green)' }} />
          <p>{t('helpRequests.empty')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(req => (
            <div key={req.id} className="card" style={{
              borderLeft: `4px solid ${STATUS_COLORS[req.status] || STATUS_COLORS.pending}`,
              padding: '1rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{TYPE_LABELS[req.type] || '🆘'}</span>
                  <strong>{t(`home.help${req.type.charAt(0).toUpperCase() + req.type.slice(1)}`, req.type)}</strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> {timeAgo(req.created_at)}
                </span>
              </div>

              {req.name && (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} /> {req.name}
                </p>
              )}
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={14} /> {req.contact}
              </p>
              {req.message && (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>
                  <MessageCircle size={14} /> {req.message}
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {req.status === 'pending' && (
                  <button className="btn btn-sm" style={{ background: '#f39c12', color: '#fff', border: 'none' }}
                    onClick={() => updateStatus(req.id, 'in_progress')}>
                    {t('helpRequests.markInProgress')}
                  </button>
                )}
                {(req.status === 'pending' || req.status === 'in_progress') && (
                  <button className="btn btn-sm btn-green"
                    onClick={() => updateStatus(req.id, 'resolved')}>
                    {t('helpRequests.markResolved')}
                  </button>
                )}
                {req.status === 'resolved' && (
                  <span style={{ color: 'var(--green)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> {t('helpRequests.resolved')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
