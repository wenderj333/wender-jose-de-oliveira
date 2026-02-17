import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PrayerCard from '../components/PrayerCard';
import { useAuth } from '../context/AuthContext';
import { HandHeart, Trophy, Sparkles, AlertTriangle, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DEMO_PRAYERS = [
  {
    id: 'demo-1',
    author_name: 'Maria Silva',
    church_name: 'Igreja Batista Central',
    category: 'health',
    title: 'Oração pela saúde do meu pai',
    content: 'Meu pai foi diagnosticado com uma doença grave e está internado. Peço orações para que Deus toque na vida dele e traga cura completa. Acreditamos no poder da oração!',
    is_urgent: true,
    is_answered: false,
    prayer_count: 47,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    author_name: 'João Santos',
    church_name: 'Assembleia de Deus',
    category: 'work_finance',
    title: 'Novo emprego',
    content: 'Estou desempregado há 3 meses e preciso muito de um novo trabalho para sustentar minha família. Oro para que Deus abra portas e me dê sabedoria nas entrevistas.',
    is_urgent: false,
    is_answered: false,
    prayer_count: 23,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    author_name: 'Ana Oliveira',
    church_name: 'Comunidade da Graça',
    category: 'family',
    title: 'Restauração do meu casamento',
    content: 'Estamos passando por um momento muito difícil no casamento. Peço que orem por restauração, paciência e amor entre nós. Deus é fiel e pode restaurar todas as coisas.',
    is_urgent: false,
    is_answered: false,
    prayer_count: 35,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-4',
    author_name: 'Lucas Ferreira',
    church_name: 'Igreja Presbiteriana',
    category: 'emotional',
    title: 'Luta contra a ansiedade',
    content: 'Tenho sofrido muito com ansiedade e crises de pânico. Sei que Deus não nos deu espírito de medo. Orem para que eu encontre paz e consiga confiar mais no Senhor.',
    is_urgent: false,
    is_answered: false,
    prayer_count: 52,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-5',
    author_name: 'Camila Rodrigues',
    church_name: 'Igreja Metodista',
    category: 'studies',
    title: 'Aprovação no vestibular',
    content: 'Estou me preparando para o vestibular de medicina. Preciso de muita concentração e sabedoria. Orem para que Deus me ajude a alcançar essa conquista para servir ao próximo.',
    is_urgent: false,
    is_answered: false,
    prayer_count: 18,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export default function PrayerFeed() {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [prayers, setPrayers] = useState([]);
  const [tab, setTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'other', is_urgent: false });
  const [loading, setLoading] = useState(true);

  const CATEGORIES = [
    { value: '', label: t('prayerFeed.categories.all') },
    { value: 'health', label: t('prayerFeed.categories.health') },
    { value: 'work_finance', label: t('prayerFeed.categories.work_finance') },
    { value: 'family', label: t('prayerFeed.categories.family') },
    { value: 'studies', label: t('prayerFeed.categories.studies') },
    { value: 'housing', label: t('prayerFeed.categories.housing') },
    { value: 'emotional', label: t('prayerFeed.categories.emotional') },
    { value: 'decisions', label: t('prayerFeed.categories.decisions') },
    { value: 'other', label: t('prayerFeed.categories.other') },
  ];

  const isPastor = user?.role === 'pastor' || user?.role === 'admin';

  const fetchPrayers = async () => {
    setLoading(true);
    const endpoint = tab === 'answered' ? `${API_BASE}/api/prayers/answered` : `${API_BASE}/api/prayers`;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(endpoint, { headers });
      const data = await res.json();
      let result = data.prayers || [];
      if (user && !isPastor) {
        result = result.filter(p => p.author_id === user.id);
      }
      setPrayers(result);
    } catch {
      setPrayers(tab === 'answered' ? [] : (user ? [] : DEMO_PRAYERS));
    }
    setLoading(false);
  };

  useEffect(() => { fetchPrayers(); }, [tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    await fetch(`${API_BASE}/api/prayers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setForm({ title: '', content: '', category: 'other', is_urgent: false });
    setShowForm(false);
    fetchPrayers();
  };

  const handlePray = async (prayerId) => {
    if (prayerId.startsWith('demo-')) {
      setPrayers(prev => prev.map(p => p.id === prayerId ? { ...p, prayer_count: (p.prayer_count || 0) + 1 } : p));
      return;
    }
    await fetch(`${API_BASE}/api/prayers/${prayerId}/pray`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: '' }),
    });
    fetchPrayers();
  };

  return (
    <div>
      {!user && (
        <Link to="/cadastro" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #daa520, #f4d03f)', borderRadius: 12, padding: '0.75rem 1rem',
            marginBottom: '1rem', textAlign: 'center', color: '#1a0a3e', fontWeight: 600, fontSize: '0.9rem',
          }}>
            ✨ Crie sua conta para participar! <span style={{ textDecoration: 'underline' }}>Cadastre-se</span>
          </div>
        </Link>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ color: 'var(--green-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {tab === 'answered' ? <><Trophy size={24} /> {t('prayerFeed.victoryWall')}</> : <><HandHeart size={24} /> {t('prayerFeed.prayerRequests')}</>}
        </h2>
        {user && (
          <button className="btn btn-green" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {showForm ? <ChevronUp size={18} /> : <Plus size={18} />} {t('prayerFeed.newRequest')}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className={`btn ${tab === 'all' ? 'btn-green' : 'btn-outline'}`} style={tab !== 'all' ? { color: 'var(--green)', borderColor: 'var(--green)' } : {}} onClick={() => setTab('all')}>
          {t('prayerFeed.allRequests')}
        </button>
        <button className={`btn ${tab === 'answered' ? 'btn-primary' : 'btn-outline'}`} style={tab !== 'answered' ? { color: 'var(--gold-dark)', borderColor: 'var(--gold)' } : {}} onClick={() => setTab('answered')}>
          <Sparkles size={16} /> {t('prayerFeed.answeredPrayers')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--green-dark)', marginBottom: '1rem' }}>{t('prayerFeed.newPrayerRequest')}</h3>
          <div className="form-group">
            <label>{t('prayerFeed.titleOptional')}</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('prayerFeed.titlePlaceholder')} />
          </div>
          <div className="form-group">
            <label>{t('prayerFeed.yourRequest')}</label>
            <textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder={t('prayerFeed.requestPlaceholder')} required />
          </div>
          <div className="form-group">
            <label>{t('prayerFeed.category')}</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.is_urgent} onChange={(e) => setForm({ ...form, is_urgent: e.target.checked })} />
              <AlertTriangle size={16} style={{ color: 'var(--red)' }} /> {t('prayerFeed.urgentRequest')}
            </label>
          </div>
          <button type="submit" className="btn btn-green"><HandHeart size={18} /> {t('prayerFeed.submitRequest')}</button>
        </form>
      )}

      {/* Explanatory card about the power of prayer */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.97), rgba(232,245,233,0.95))',
        border: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, #4caf50, #81c784, #daa520) 1',
        borderRadius: 16,
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 15px rgba(76,175,80,0.12)',
      }}>
        <h3 style={{ fontSize: '1.05rem', color: '#2e7d32', margin: '0 0 0.6rem', textAlign: 'center' }}>
          ✨ O Poder da Oração
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#444', lineHeight: 1.7, margin: '0 0 0.6rem' }}>
          A oração é a nossa comunicação direta com Deus. Quando você compartilha seu pedido aqui, 
          irmãos de todo o mundo se unem em oração por você.
        </p>
        <p style={{ fontSize: '0.85rem', color: '#2e7d32', fontStyle: 'italic', margin: '0 0 0.8rem', textAlign: 'center', fontWeight: 500 }}>
          "Confessai as vossas culpas uns aos outros e orai uns pelos outros, para que sareis. 
          A oração feita por um justo pode muito em seus efeitos." — Tiago 5:16
        </p>
        <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
          <strong style={{ color: '#2e7d32' }}>Como funciona:</strong>
          <div style={{ marginTop: 4 }}>
            1️⃣ Escreva seu pedido com fé<br />
            2️⃣ Irmãos orarão por você<br />
            3️⃣ Quando Deus responder, compartilhe seu testemunho no Mural de Vitórias!
          </div>
        </div>
      </div>

      {user && !isPastor && (
        <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(102,126,234,0.1)', borderLeft: '3px solid var(--primary)' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-500)' }}>🔒 Seus pedidos de oração são privados. Somente você e os pastores podem ver.</p>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--gray-500)' }}>{t('prayerFeed.loading')}</p>
      ) : prayers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <HandHeart size={48} style={{ color: 'var(--gray-200)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--gray-500)' }}>{t('prayerFeed.noRequests')}</p>
        </div>
      ) : (
        prayers.map((prayer) => (
          <PrayerCard key={prayer.id} prayer={prayer} onPray={handlePray} user={user || { id: 'visitor' }} />
        ))
      )}
    </div>
  );
}
