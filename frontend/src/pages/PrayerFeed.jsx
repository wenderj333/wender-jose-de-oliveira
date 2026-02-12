import React, { useState, useEffect } from 'react';
import PrayerCard from '../components/PrayerCard';
import { useAuth } from '../context/AuthContext';
import { HandHeart, Trophy, Sparkles, AlertTriangle, Plus } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CATEGORIES = [
  { value: '', label: 'Todas' },
  { value: 'health', label: 'Saúde' },
  { value: 'work_finance', label: 'Trabalho/Finanças' },
  { value: 'family', label: 'Família' },
  { value: 'studies', label: 'Estudos' },
  { value: 'housing', label: 'Moradia' },
  { value: 'emotional', label: 'Emocional' },
  { value: 'decisions', label: 'Decisões' },
  { value: 'other', label: 'Outros' },
];

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
  const [prayers, setPrayers] = useState([]);
  const [tab, setTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'other', is_urgent: false });
  const [loading, setLoading] = useState(true);

  const fetchPrayers = async () => {
    setLoading(true);
    const endpoint = tab === 'answered' ? `${API_BASE}/api/prayers/answered` : `${API_BASE}/api/prayers`;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setPrayers(data.prayers || []);
    } catch {
      // Use demo data if API unavailable
      setPrayers(tab === 'answered' ? [] : DEMO_PRAYERS);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ color: 'var(--green-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {tab === 'answered' ? <><Trophy size={24} /> Mural de Vitórias</> : <><HandHeart size={24} /> Pedidos de Oração</>}
        </h2>
        {user && (
          <button className="btn btn-green" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> Novo Pedido
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className={`btn ${tab === 'all' ? 'btn-green' : 'btn-outline'}`} style={tab !== 'all' ? { color: 'var(--green)', borderColor: 'var(--green)' } : {}} onClick={() => setTab('all')}>
          Todos os Pedidos
        </button>
        <button className={`btn ${tab === 'answered' ? 'btn-primary' : 'btn-outline'}`} style={tab !== 'answered' ? { color: 'var(--gold-dark)', borderColor: 'var(--gold)' } : {}} onClick={() => setTab('answered')}>
          <Sparkles size={16} /> Orações Respondidas
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--green-dark)', marginBottom: '1rem' }}>Novo Pedido de Oração</h3>
          <div className="form-group">
            <label>Título (opcional)</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Oração pela minha família" />
          </div>
          <div className="form-group">
            <label>Seu pedido *</label>
            <textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Compartilhe seu pedido de oração..." required />
          </div>
          <div className="form-group">
            <label>Categoria</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.is_urgent} onChange={(e) => setForm({ ...form, is_urgent: e.target.checked })} />
              <AlertTriangle size={16} style={{ color: 'var(--red)' }} /> Pedido urgente
            </label>
          </div>
          <button type="submit" className="btn btn-green"><HandHeart size={18} /> Enviar Pedido</button>
        </form>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--gray-500)' }}>Carregando orações...</p>
      ) : prayers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <HandHeart size={48} style={{ color: 'var(--gray-200)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--gray-500)' }}>Nenhum pedido de oração ainda. Seja o primeiro!</p>
        </div>
      ) : (
        prayers.map((prayer) => (
          <PrayerCard key={prayer.id} prayer={prayer} onPray={handlePray} user={user || { id: 'visitor' }} />
        ))
      )}
    </div>
  );
}
