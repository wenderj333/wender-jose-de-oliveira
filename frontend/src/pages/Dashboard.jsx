import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, HandHeart, Sparkles, Heart, Church, BookOpen, Plus, ArrowRight, Clock, Star } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${API_BASE}/api/dashboard/stats`, { headers })
      .then(r => r.json())
      .then(data => {
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

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
        <LayoutDashboard size={24} /> Dashboard
      </h2>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem' }}>Carregando dados...</p>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="stat-card">
              <Users size={28} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <div className="stat-card__value">{stats?.totalUsers || 0}</div>
              <div className="stat-card__label">Usuários</div>
            </div>
            <div className="stat-card">
              <Church size={28} style={{ color: 'var(--green)', marginBottom: '0.5rem' }} />
              <div className="stat-card__value">{stats?.totalChurches || 0}</div>
              <div className="stat-card__label">Igrejas</div>
            </div>
            <div className="stat-card">
              <HandHeart size={28} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <div className="stat-card__value">{stats?.totalPrayers || 0}</div>
              <div className="stat-card__label">Pedidos de Oração</div>
            </div>
            <div className="stat-card stat-card--gold">
              <Sparkles size={28} style={{ color: 'var(--gold)', marginBottom: '0.5rem' }} />
              <div className="stat-card__value">{stats?.answeredPrayers || 0}</div>
              <div className="stat-card__label">Orações Respondidas</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} style={{ color: 'var(--gold)' }} /> Ações Rápidas
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/oracoes" className="btn btn-green"><Plus size={16} /> Novo Pedido de Oração</Link>
              <Link to="/cadastrar-igreja" className="btn btn-green"><Church size={16} /> Cadastrar Igreja</Link>
              <Link to="/kids" className="btn btn-primary"><BookOpen size={16} /> Cantinho Kids</Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} /> Atividade Recente
            </h3>
            {recentActivity.length > 0 ? (
              <ul style={{ listStyle: 'none' }}>
                {recentActivity.map(item => (
                  <li key={item.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HandHeart size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: 600 }}>{item.author_name}</span>
                        <span style={{ color: 'var(--gray-500)' }}> pediu oração: </span>
                        <span>{item.title || item.content?.substring(0, 50) + '...'}</span>
                      </div>
                    </div>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.8rem', flexShrink: 0 }}>{timeAgo(item.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--gray-500)' }}>Nenhuma atividade recente. Comece criando um pedido de oração!</p>
            )}
            <Link to="/oracoes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '1rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Ver todos os pedidos <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
