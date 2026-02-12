import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChurchPin from '../components/ChurchPin';
import { MapPin, Search, Church } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DEMO_CHURCHES = [
  { id: 'demo-1', name: 'Igreja Batista Central de Madrid', denomination: 'Batista', address: 'Calle Gran Vía, 45', city: 'Madrid', country: 'Espanha', phone: '+34 91 234 5678', pastor_name: 'Roberto Almeida', member_count: 180, latitude: 40.4168, longitude: -3.7038 },
  { id: 'demo-2', name: 'Comunidade Cristã de Lisboa', denomination: 'Interdenominacional', address: 'Rua Augusta, 120', city: 'Lisboa', country: 'Portugal', phone: '+351 21 345 6789', pastor_name: 'Fernando Costa', member_count: 250, latitude: 38.7223, longitude: -9.1393 },
  { id: 'demo-3', name: 'Assembleia de Deus - Vila Mariana', denomination: 'Assembleia de Deus', address: 'Av. Paulista, 900', city: 'São Paulo', country: 'Brasil', phone: '+55 11 9876-5432', pastor_name: 'Carlos Eduardo Silva', member_count: 520, latitude: -23.5505, longitude: -46.6333 },
  { id: 'demo-4', name: 'Igreja Presbiteriana de Barcelona', denomination: 'Presbiteriana', address: 'Carrer de Balmes, 78', city: 'Barcelona', country: 'Espanha', phone: '+34 93 456 7890', pastor_name: 'André Mendes', member_count: 95, latitude: 41.3874, longitude: 2.1686 },
  { id: 'demo-5', name: 'Brazilian Christian Fellowship', denomination: 'Evangélica', address: '42 Baker Street', city: 'London', country: 'Reino Unido', phone: '+44 20 7946 0958', pastor_name: 'Marcos Oliveira', member_count: 130, latitude: 51.5074, longitude: -0.1278 },
];

export default function ChurchMap() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [apiChurches, setApiChurches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${API_BASE}/api/churches/search?city=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setApiChurches(data.churches || []);
    } catch {
      setApiChurches([]);
    }
    setLoading(false);
  };

  const filteredDemo = searchQuery.trim()
    ? DEMO_CHURCHES.filter(c =>
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : DEMO_CHURCHES;

  const displayChurches = searched && apiChurches.length > 0 ? apiChurches : filteredDemo;

  return (
    <div>
      <h2 style={{ color: 'var(--green-dark)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MapPin size={24} /> {t('churchMap.title')}
      </h2>

      <form onSubmit={search} className="church-search">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('churchMap.searchPlaceholder')} style={{ paddingLeft: '2.5rem' }} />
        </div>
        <button type="submit" className="btn btn-green"><Search size={16} /> {t('churchMap.search')}</button>
      </form>

      {loading && <p style={{ textAlign: 'center', color: 'var(--gray-500)' }}>{t('churchMap.searching')}</p>}

      {!loading && displayChurches.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Church size={48} style={{ color: 'var(--gray-200)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--gray-500)' }}>{t('churchMap.noResults', { query: searchQuery })}</p>
        </div>
      )}

      <div className="church-grid">
        {displayChurches.map((church) => (
          <ChurchPin key={church.id} church={church} />
        ))}
      </div>
    </div>
  );
}
