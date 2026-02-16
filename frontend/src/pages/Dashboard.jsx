import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, HandHeart, Sparkles, Heart, Church, BookOpen, Plus, ArrowRight, Clock, Star, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Dashboard() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API_BASE}/api/dashboard/stats`, { headers })
      .then(r => r.json())
      .then(data => { setStats(data.stats); setRecentActivity(data.recentActivity || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setShowUsersModal(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_BASE}/api/dashboard/users`, { headers });
      const data = await res.json();
      setUsersList(data.users || []);
    } catch { setUsersList([]); }
    finally { setLoadingUsers(false); }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div>
      <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <LayoutDashboard size={24} /> {t('dashboard.title')}
      </h2>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem' }}>{t('dashboard.loading')}</p>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="stat-card" onClick={fetchUsers} style={{ cursor: 'pointer' }}>
              <Users size={28} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <div className="stat-card__value">{stats?.totalUsers || 0}</div>
              <div className="stat-card__label">{t('dashboard.users')}</div>
            </div>
            <div className="stat-card">
              <Church size={28} style={{ color: 'var(--green)', marginBottom: '0.5rem' }} />
              <div className="stat-card__value">{stats?.totalChurches || 0}</div>
              <div className="stat-card__label">{t('dashboard.churches')}</div>
            </div>
            <div className="stat-card">
              <HandHeart size={28} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <div className="stat-card__value">{stats?.totalPrayers || 0}</div>
              <div className="stat-card__label">{t('dashboard.prayerRequests')}</div>
            </div>
            <div className="stat-card stat-card--gold">
              <Sparkles size={28} style={{ color: 'var(--gold)', marginBottom: '0.5rem' }} />
              <div className="stat-card__value">{stats?.answeredPrayers || 0}</div>
              <div className="stat-card__label">{t('dashboard.answeredPrayers')}</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} style={{ color: 'var(--gold)' }} /> {t('dashboard.quickActions')}
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/oracoes" className="btn btn-green"><Plus size={16} /> {t('dashboard.newPrayerRequest')}</Link>
              <Link to="/cadastrar-igreja" className="btn btn-green"><Church size={16} /> {t('dashboard.registerChurch')}</Link>
              <Link to="/kids" className="btn btn-primary"><BookOpen size={16} /> {t('dashboard.kidsCorner')}</Link>
            </div>
          </div>

          <div className="card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} /> {t('dashboard.recentActivity')}
            </h3>
            {recentActivity.length > 0 ? (
              <ul style={{ listStyle: 'none' }}>
                {recentActivity.map(item => (
                  <li key={item.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HandHeart size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: 600 }}>{item.author_name}</span>
                        <span style={{ color: 'var(--gray-500)' }}> {t('dashboard.requestedPrayer')} </span>
                        <span>{item.title || item.content?.substring(0, 50) + '...'}</span>
                      </div>
                    </div>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.8rem', flexShrink: 0 }}>{timeAgo(item.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--gray-500)' }}>{t('dashboard.noActivity')}</p>
            )}
            <Link to="/oracoes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '1rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              {t('dashboard.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}

      {showUsersModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => { if (e.target === e.currentTarget) setShowUsersModal(false); }}>
          <div style={{ background: 'var(--bg-card, #1e1e3f)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400, maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}><Users size={20} /> Usuários</h3>
              <button onClick={() => setShowUsersModal(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {loadingUsers ? (
              <p style={{ textAlign: 'center', color: 'var(--gray-500)' }}>Carregando...</p>
            ) : usersList.length === 0 ? (
              <p style={{ color: 'var(--gray-500)' }}>Nenhum usuário encontrado.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {usersList.map(u => (
                  <li key={u.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Link to={`/perfil/${u.id}`} onClick={() => setShowUsersModal(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2d1b69', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={16} style={{ color: 'var(--primary)' }} />}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.full_name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
