import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Search, Church, Users, Phone, Globe } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function ChurchMap() {
  const { t } = useTranslation();
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchChurches();
  }, []);

  async function fetchChurches() {
    try {
      const res = await fetch(`${API}/churches`);
      const data = await res.json();
      setChurches(data.churches || data || []);
    } catch (err) {
      console.error('Error fetching churches:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = search.trim()
    ? churches.filter(c =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.country || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.denomination || '').toLowerCase().includes(search.toLowerCase())
      )
    : churches;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '1rem 0.5rem' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', color: '#1a0a3e', marginBottom: '0.5rem' }}>
        <Church size={24} color="#4caf50" /> {t('churchMap.title', 'Igrejas')}
      </h1>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Todas as igrejas registradas na nossa comunidade
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar igreja, cidade, país..."
          style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', borderRadius: 12, border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box' }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <div style={{ padding: '0.4rem 1rem', borderRadius: 20, background: '#e8f5e9', fontSize: '0.85rem', color: '#2e7d32', fontWeight: 600 }}>
          ⛪ {churches.length} {churches.length === 1 ? 'igreja' : 'igrejas'} registradas
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Carregando igrejas...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Church size={48} style={{ color: '#ddd', marginBottom: '1rem' }} />
          <p style={{ color: '#999' }}>
            {search ? `Nenhuma igreja encontrada para "${search}"` : 'Nenhuma igreja registrada ainda. Seja a primeira!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(church => (
            <div key={church.id} style={{
              background: '#fff', borderRadius: 16, padding: '1rem',
              border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
            }}>
              {/* Church header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Church size={24} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1a0a3e' }}>{church.name}</h3>
                  {church.denomination && (
                    <span style={{ fontSize: '0.75rem', color: '#4caf50', fontWeight: 600 }}>{church.denomination}</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(church.address || church.city) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#666' }}>
                    <MapPin size={14} color="#e74c3c" />
                    {[church.address, church.city, church.state, church.country].filter(Boolean).join(', ')}
                  </div>
                )}
                {church.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#666' }}>
                    <Phone size={14} color="#3498db" />
                    {church.phone}
                  </div>
                )}
                {church.description && (
                  <p style={{ fontSize: '0.85rem', color: '#888', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                    {church.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
