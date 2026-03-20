import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_URL || '';

const PURPLE = '#6C3FA0';
const PURPLE_DARK = '#4A2270';
const GOLD = '#D4A843';
const BG = '#F5F0FF';

const styles = {
  page: { minHeight: '100vh', background: BG, fontFamily: "'Segoe UI', sans-serif" },
  header: {
    background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`,
    color: '#fff', textAlign: 'center', padding: '32px 16px 24px',
    borderRadius: '0 0 28px 28px', marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: 800, margin: 0 },
  subtitle: { fontSize: 14, opacity: 0.85, marginTop: 6 },
  container: { maxWidth: 800, margin: '0 auto', padding: '0 16px 80px' },
  searchRow: { display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  input: {
    flex: 1, minWidth: 120, padding: '10px 14px', borderRadius: 12,
    border: '1.5px solid #ddd', fontSize: 14, outline: 'none',
    background: '#fff', boxSizing: 'border-box',
  },
  searchBtn: {
    background: PURPLE, color: '#fff', border: 'none', borderRadius: 12,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
  card: {
    background: '#fff', borderRadius: 18, padding: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #eee',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  logo: {
    width: 56, height: 56, borderRadius: 14,
    background: `linear-gradient(135deg, ${PURPLE}, ${GOLD})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, flexShrink: 0,
  },
  churchName: { fontSize: 16, fontWeight: 700, color: PURPLE_DARK, margin: 0 },
  churchSub: { fontSize: 12, color: '#777', margin: 0 },
  badge: (bg) => ({
    display: 'inline-block', background: bg, color: '#fff',
    borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 600,
  }),
  viewBtn: {
    marginTop: 4, background: PURPLE, color: '#fff', border: 'none',
    borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', alignSelf: 'flex-start',
  },
  empty: { textAlign: 'center', color: '#999', padding: 48, fontSize: 15 },
  loading: { textAlign: 'center', color: PURPLE, padding: 48, fontSize: 15 },
};

export default function Churches() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (name) params.set('name', name);
      if (city) params.set('city', city);
      const res = await fetch(`${API_BASE}/api/churches?${params}`);
      const data = await res.json();
      setChurches(data.churches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [name, city]);

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>🌍 {t('churches.title', 'Encontrar uma Igreja')}</div>
        <div style={styles.subtitle}>{t('churches.subtitle', 'Conecte-se à sua comunidade de fé')}</div>
      </div>

      <div style={styles.container}>
        <form style={styles.searchRow} onSubmit={handleSearch}>
          <input
            style={styles.input}
            placeholder={t('churches.searchName', 'Buscar por nome...')}
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder={t('churches.searchCity', 'Cidade...')}
            value={city}
            onChange={e => setCity(e.target.value)}
          />
          <button type="submit" style={styles.searchBtn}>🔍</button>
        </form>

        {loading ? (
          <div style={styles.loading}>⛪ Carregando igrejas...</div>
        ) : churches.length === 0 ? (
          <div style={styles.empty}>⛪ Nenhuma igreja encontrada.</div>
        ) : (
          <div style={styles.grid}>
            {churches.map(c => (
              <div key={c.id} style={styles.card}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {c.logo_url ? (
                    <img src={c.logo_url} alt="" style={{ ...styles.logo, objectFit: 'cover' }} />
                  ) : (
                    <div style={styles.logo}>⛪</div>
                  )}
                  <div>
                    <div style={styles.churchName}>{c.name}</div>
                    {c.pastor_name && <div style={styles.churchSub}>👤 {c.pastor_name}</div>}
                    {c.city && <div style={styles.churchSub}>📍 {c.city}{c.country ? `, ${c.country}` : ''}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#888' }}>
                    👥 {c.member_count || 0} {t('churches.members', 'membros')}
                  </span>
                  <span style={styles.badge(c.status === 'active' ? '#27ae60' : GOLD)}>
                    {c.status === 'active' ? t('churches.active', 'Ativa') : t('churches.pending', 'Pendente')}
                  </span>
                </div>
                <button style={styles.viewBtn} onClick={() => navigate(`/igrejas/${c.id}`)}>
                  {t('churches.viewChurch', 'Ver Igreja')} →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
