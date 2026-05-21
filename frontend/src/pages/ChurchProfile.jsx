import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

const PURPLE = '#6C3FA0';
const PURPLE_DARK = '#4A2270';
const GOLD = '#D4A843';
const BG = '#F5F0FF';

const eventTypeConfig = {
  culto:    { emoji: '🕊️', color: '#2980b9', label: 'Culto' },
  campanha: { emoji: '📢', color: '#D4A843', label: 'Campanha' },
  reuniao:  { emoji: '🤝', color: '#27ae60', label: 'Reunião' },
  outro:    { emoji: '📅', color: '#888',    label: 'Evento' },
};

const styles = {
  page: { minHeight: '100vh', background: BG, fontFamily: "'Segoe UI', sans-serif" },
  banner: {
    background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
    color: '#fff', padding: '32px 20px 28px', marginBottom: 0,
  },
  container: { maxWidth: 700, margin: '0 auto', padding: '24px 16px 80px' },
  backBtn: {
    background: 'none', border: 'none', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  churchName: { fontSize: 26, fontWeight: 800, margin: '0 0 4px' },
  churchSub: { fontSize: 14, opacity: 0.85, margin: '2px 0' },
  card: { background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 17, fontWeight: 700, color: PURPLE_DARK, marginBottom: 12 },
  joinBtn: {
    background: PURPLE, color: '#fff', border: 'none', borderRadius: 12,
    padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8,
  },
  badge: (bg) => ({
    display: 'inline-block', background: bg, color: '#fff',
    borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 600, marginTop: 8,
  }),
  eventItem: {
    display: 'flex', gap: 12, alignItems: 'flex-start',
    padding: '12px 0', borderBottom: '1px solid #f0f0f0',
  },
  eventBadge: (color) => ({
    background: color, color: '#fff', borderRadius: 8,
    padding: '4px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
  }),
  loading: { textAlign: 'center', color: PURPLE, padding: 48, fontSize: 15 },
  error: { textAlign: 'center', color: '#c0392b', padding: 48, fontSize: 15 },
  empty: { color: '#999', fontSize: 13, textAlign: 'center', padding: 16 },
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (t) => {
  if (!t) return '';
  return t.slice(0, 5);
};

export default function ChurchProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAuth();

  const [church, setChurch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');

  useEffect(() => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch(`${API_BASE}/api/churches/${id}`, { headers })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setChurch(d.church);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleJoin = async () => {
    if (!token) { navigate('/login'); return; }
    setJoining(true);
    try {
      const res = await fetch(`${API_BASE}/api/churches/${id}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setJoinMsg(t('churches.requestSent', 'Pedido enviado! Aguarda aprovação.'));
        setChurch(prev => ({ ...prev, user_membership_status: { status: 'pending' } }));
      } else {
        setJoinMsg(data.error || 'Erro');
      }
    } catch {
      setJoinMsg('Erro ao enviar pedido.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div style={styles.loading}>⛪ Carregando...</div>;
  if (error) return <div style={styles.error}>⚠️ {error}</div>;
  if (!church) return null;

  const membership = church.user_membership_status;
  const isPastor = church.is_pastor;

  const getMembershipBadge = () => {
    if (isPastor) return <span style={styles.badge(PURPLE)}>🏛️ Pastor</span>;
    if (!membership) return null;
    const s = membership.status;
    if (s === 'active') return <span style={styles.badge('#27ae60')}>✅ Membro</span>;
    if (s === 'pending') return <span style={styles.badge(GOLD)}>⏳ {t('churches.pending', 'Pendente')}</span>;
    return null;
  };

  return (
    <div style={styles.page}>
      {/* Banner */}
      <div style={styles.banner}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <button style={styles.backBtn} onClick={() => navigate('/igrejas')}>← Igrejas</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {church.logo_url ? (
              <img src={church.logo_url} alt="" style={{ width: 72, height: 72, borderRadius: 18, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>⛪</div>
            )}
            <div>
              <div style={styles.churchName}>{church.name}</div>
              {church.pastor_name && <div style={styles.churchSub}>👤 Pastor: {church.pastor_name}</div>}
              {church.city && <div style={styles.churchSub}>📍 {church.city}{church.country ? `, ${church.country}` : ''}</div>}
              <div style={styles.churchSub}>👥 {church.member_count || 0} {t('churches.members', 'membros')}</div>
              {church.latitude && church.longitude && (
                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${church.latitude},${church.longitude}`, '_blank')}
                  style={{ marginTop: 8, padding: '6px 14px', background: '#4285f4', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🗺️ {t('churches.howToGet', 'Como chegar')}
                </button>
              )}
              {church.city && !church.latitude && (
                <button onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent((church.name || '') + ' ' + (church.city || '') + ' ' + (church.country || ''))}`, '_blank')}
                  style={{ marginTop: 8, padding: '6px 14px', background: '#4285f4', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🗺️ {t('churches.howToGet', 'Como chegar')}
                </button>
              )}
            </div>
          </div>

          {/* Join / Status button */}
          {!isPastor && !membership && token && (
            <button style={styles.joinBtn} onClick={handleJoin} disabled={joining}>
              {joining ? '...' : t('churches.joinChurch', 'Entrar na Igreja')}
            </button>
          )}
          {getMembershipBadge()}
          {joinMsg && <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>{joinMsg}</div>}
        </div>
      </div>

      <div style={styles.container}>
        {/* Description */}
        {church.description && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>ℹ️ Sobre a Igreja</div>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: 0 }}>{church.description}</p>
          </div>
        )}

        {/* Events */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>📅 {t('churches.events', 'Agenda')}</div>
          {church.events && church.events.length > 0 ? (
            church.events.map(ev => {
              const cfg = eventTypeConfig[ev.event_type] || eventTypeConfig.outro;
              return (
                <div key={ev.id} style={styles.eventItem}>
                  <div>
                    <span style={styles.eventBadge(cfg.color)}>{cfg.emoji} {cfg.label}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{ev.title}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      📆 {formatDate(ev.event_date)}{ev.event_time ? ` · 🕐 ${formatTime(ev.event_time)}` : ''}
                    </div>
                    {ev.description && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{ev.description}</div>}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.empty}>{t('churches.noEvents', 'Sem eventos programados.')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
