import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Users, Heart, BookOpen, MessageCircle, DollarSign, Calendar, ArrowLeft, Megaphone, HandHeart, BarChart3, Settings, Plus, Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const PURPLE = '#6C3FA0';
const PURPLE_DARK = '#4A2270';
const GOLD = '#D4A843';
const GOLD_LIGHT = '#F5E6C8';
const BG = '#F5F0FF';

const formatCurrency = (v) => {
  const n = Number(v) || 0;
  return '€ ' + n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('pt-PT');
};

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const monthOptions = () => {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    opts.push({ val, label });
  }
  return opts;
};

const verses = [
  '"Apascenta as minhas ovelhas." — João 21:17',
  '"Eu sou o bom pastor; o bom pastor dá a sua vida pelas ovelhas." — João 10:11',
  '"Lembrai-vos dos vossos pastores." — Hebreus 13:7',
  '"E eu vos darei pastores segundo o meu coração." — Jeremias 3:15',
];

const styles = {
  page: { minHeight: '100vh', background: BG, fontFamily: "'Segoe UI', sans-serif" },
  container: { maxWidth: 650, margin: '0 auto', padding: '16px 12px 80px' },
  header: { textAlign: 'center', padding: '20px 0 8px', background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`, borderRadius: '0 0 24px 24px', color: '#fff', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  verse: { fontSize: 13, color: GOLD_LIGHT, fontStyle: 'italic', padding: '8px 16px', marginTop: 4 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 },
  card: (active) => ({ background: active ? `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})` : '#fff', borderRadius: 16, padding: '18px 10px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: active ? 'none' : '1px solid #eee', color: active ? '#fff' : '#333', transition: 'all 0.2s' }),
  cardIcon: { fontSize: 28, marginBottom: 4 },
  cardLabel: { fontSize: 12, fontWeight: 600 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 },
  statCard: { background: '#fff', borderRadius: 14, padding: 16, textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
  statNum: { fontSize: 24, fontWeight: 700, color: PURPLE },
  statLabel: { fontSize: 12, color: '#777', marginTop: 2 },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: PURPLE, fontWeight: 600, cursor: 'pointer', fontSize: 14, padding: '8px 0', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: PURPLE_DARK, marginBottom: 12 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid #ddd`, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 8 },
  select: { width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid #ddd`, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 8, background: '#fff' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid #ddd`, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 8, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' },
  btn: (bg = PURPLE) => ({ background: bg, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }),
  label: { fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 2, display: 'block' },
  listItem: { background: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  empty: { textAlign: 'center', color: '#999', padding: 32, fontSize: 14 },
  loading: { textAlign: 'center', color: PURPLE, padding: 32, fontSize: 15 },
  error: { textAlign: 'center', color: '#c0392b', padding: 16, fontSize: 14 },
  badge: (bg = GOLD) => ({ display: 'inline-block', background: bg, color: '#fff', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginLeft: 6 }),
  summaryRow: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  summaryCard: (bg = '#fff') => ({ flex: 1, minWidth: 90, background: bg, borderRadius: 12, padding: '12px 8px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }),
};

function PastorDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [section, setSection] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const apiFetch = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API_BASE}${path}`, { headers, ...opts });
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
  }, [token]);

  useEffect(() => {
    apiFetch('/api/pastor/overview').then(setOverview).catch(() => {}).finally(() => setLoadingOverview(false));
  }, []);

  const verse = verses[Math.floor(Math.random() * verses.length)];

  const sections = [
    { id: 'minha-igreja', icon: '🏛️', label: 'Minha Igreja', Ico: ShieldCheck },
    { id: 'membros', icon: '👥', label: 'Membros', Ico: Users },
    { id: 'dizimos', icon: '💰', label: 'Dízimos', Ico: DollarSign },
    { id: 'oracoes', icon: '🙏', label: 'Orações', Ico: Heart },
    { id: 'chat', icon: '💬', label: 'Chat', Ico: MessageCircle },
    { id: 'despesas', icon: '⚙️', label: 'Despesas', Ico: Settings },
    { id: 'estudos', icon: '📖', label: 'Estudos', Ico: BookOpen },
    { id: 'comunicados', icon: '📢', label: 'Comunicados', Ico: Megaphone },
    { id: 'agenda', icon: '📅', label: 'Agenda', Ico: Calendar },
    { id: 'relatorios', icon: '📊', label: 'Relatórios', Ico: BarChart3 },
  ];

  const handleSection = (id) => {
    if (id === 'oracoes') return navigate('/oracoes');
    if (id === 'chat') return navigate('/chat-pastoral');
    setSection(id);
  };

  const stats = overview?.stats;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerTitle}><ShieldCheck size={24} /> {t('pastorDashboard.title')}</div>
        <div style={styles.verse}>{verse}</div>
        {overview?.church && <div style={{ fontSize: 13, opacity: 0.8, paddingBottom: 8 }}>{overview.church}</div>}
      </div>
      <div style={styles.container}>
        {!section && (
          <>
            {loadingOverview ? <div style={styles.loading}>{t('pastorDashboard.loading')}</div> : stats && (
              <div style={styles.statGrid}>
                <div style={styles.statCard}><div style={styles.statNum}>{stats.members ?? 0}</div><div style={styles.statLabel}>{t('pastorDashboard.membersCount')}</div></div>
                <div style={styles.statCard}><div style={styles.statNum}>{stats.prayers ?? 0}</div><div style={styles.statLabel}>{t('pastorDashboard.prayersCount')}</div></div>
                <div style={styles.statCard}><div style={{ ...styles.statNum, color: GOLD }}>{formatCurrency((stats.tithesTotal || 0) + (stats.offeringsTotal || 0))}</div><div style={styles.statLabel}>{t('pastorDashboard.monthlyIncome')}</div></div>
                <div style={styles.statCard}><div style={styles.statNum}>{stats.activeChats ?? 0}</div><div style={styles.statLabel}>{t('pastorDashboard.activeChats')}</div></div>
              </div>
            )}
            
            {/* Pastor Dashboard Welcome */}
            <div style={{ background: 'linear-gradient(135deg, rgba(108,63,160,0.08), rgba(212,168,67,0.1))', border: '1px solid rgba(108,63,160,0.2)', borderRadius: 16, padding: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#4A2270', margin: '0 0 0.5rem' }}>{t('pastorDashboard.welcomeTitle')}</h3>
              <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.5, margin: '0 0 0.5rem' }}>
                {t('pastorDashboard.welcomeText')}
              </p>
              <div style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.6 }}>
                {t('pastorDashboard.welcomeMembers')}<br/>
                {t('pastorDashboard.welcomeTithes')}<br/>
                {t('pastorDashboard.welcomePrayers')}<br/>
                {t('pastorDashboard.welcomeChat')}<br/>
                {t('pastorDashboard.welcomeExpenses')}<br/>
                📖 <strong>Estudos</strong> — crie e compartilhe estudos bíblicos<br/>
                📢 <strong>Comunicados</strong> — envie avisos para toda a igreja<br/>
                📅 <strong>Agenda</strong> — organize eventos e cultos<br/>
                📊 <strong>Relat\u00f3rios</strong> — veja resumos financeiros e de atividades
              </div>
            </div>
            <div style={styles.grid}>
              {sections.map(s => (
                <div key={s.id} style={styles.card(false)} onClick={() => handleSection(s.id)}>
                  <div style={styles.cardIcon}>{s.icon}</div>
                  <div style={styles.cardLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {section && (
          <>
            <button style={styles.backBtn} onClick={() => setSection(null)}><ArrowLeft size={16} /> Voltar</button>
            {section === 'minha-igreja' && <MinhaIgrejaSection apiFetch={apiFetch} headers={headers} token={token} />}
            {section === 'membros' && <MembrosSection apiFetch={apiFetch} />}
            {section === 'dizimos' && <DizimosSection apiFetch={apiFetch} headers={headers} />}
            {section === 'despesas' && <DespesasSection apiFetch={apiFetch} headers={headers} />}
            {section === 'estudos' && <EstudosSection apiFetch={apiFetch} headers={headers} />}
            {section === 'comunicados' && <ComunicadosSection apiFetch={apiFetch} headers={headers} />}
            {section === 'agenda' && <AgendaSection apiFetch={apiFetch} headers={headers} />}
            {section === 'relatorios' && <RelatoriosSection apiFetch={apiFetch} />}
          </>
        )}
      </div>
    </div>
  );
}


/* =================== SECTION HELP =================== */
function SectionHelp({ title, steps }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(108,63,160,0.06), rgba(212,168,67,0.08))', border: '1px solid rgba(108,63,160,0.15)', borderRadius: 14, padding: '0.8rem 1rem', marginBottom: '1rem' }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#4A2270' }}>{title}</span>
        <span style={{ fontSize: '0.8rem', color: '#888' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ marginTop: 8 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#6C3FA0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: '0.82rem', color: '#444', lineHeight: 1.4 }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =================== MEMBROS =================== */
function MembrosSection({ apiFetch }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/api/pastor/members')
      .then(d => setMembers(d.members || []))
      .catch(e => setError(e.message === 'Erro 404' ? 'Cadastre sua igreja primeiro' : 'Erro ao carregar membros'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Carregando...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!members.length) return <div style={styles.empty}>Nenhum membro encontrado. Convide pessoas para a sua igreja! 🙌</div>;

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const roleLabel = (r) => ({ pastor: 'Pastor', leader: 'Líder', member: 'Membro' }[r] || r || 'Membro');

  return (
    <div>
      <div style={styles.sectionTitle}>👥 Membros ({members.length})</div>
      <SectionHelp title="❓ Como funciona a se\u00e7ão Membros?" steps={[
        'Aqui você vê todos os membros cadastrados na sua igreja.',
        'Cada membro mostra nome, email e papel (Pastor/Líder/Membro).',
        'Para adicionar membros: eles precisam se registrar no Sigo com Fé e buscar sua igreja.',
        'Você pode acompanhar quando cada membro esteve ativo pela última vez.',
      ]} />
      {members.map(m => (
        <div key={m.id} style={{ ...styles.listItem, display: 'flex', alignItems: 'center', gap: 12 }}>
          {m.avatar_url ? (
            <img src={m.avatar_url} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${PURPLE}, ${GOLD})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>{initials(m.full_name)}</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{m.full_name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{m.email}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={styles.badge(PURPLE)}>{roleLabel(m.role_type)}</span>
            {m.last_seen_at && <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Visto: {formatDate(m.last_seen_at)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =================== DÍZIMOS =================== */
function DizimosSection({ apiFetch, headers }) {
  const [month, setMonth] = useState(currentMonth());
  const [tithes, setTithes] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ amount: '', type: 'dízimo', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(`/api/pastor/tithes?month=${month}`)
      .then(d => { setTithes(d.tithes || []); setSummary(d.summary || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/pastor/tithes`, { method: 'POST', headers, body: JSON.stringify({ amount: parseFloat(form.amount), type: form.type, description: form.description }) });
      setForm({ amount: '', type: 'dízimo', description: '' });
      setShowForm(false);
      load();
    } catch {}
    setSubmitting(false);
  };

  return (
    <div>
      <div style={styles.sectionTitle}>💰 Dízimos e Ofertas</div>
      <SectionHelp title="❓ Como funciona Dízimos e Ofertas?" steps={[
        'Selecione o mês no seletor para ver os lançamentos.',
        'Clique em "+ Novo Lançamento" para registrar um dízimo ou oferta.',
        'Preencha o valor, tipo (dízimo ou oferta) e uma descrição opcional.',
        'O resumo do mês mostra o total de dízimos, ofertas e o valor geral.',
        'Use os relatórios para acompanhar a evolução mensal.',
      ]} />
      <div style={{ marginBottom: 12 }}>
        <select style={{ ...styles.select, width: 'auto' }} value={month} onChange={e => setMonth(e.target.value)}>
          {monthOptions().map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
      </div>
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard()}><div style={{ fontSize: 18, fontWeight: 700, color: PURPLE }}>{formatCurrency(summary.total_tithes)}</div><div style={{ fontSize: 11, color: '#888' }}>Dízimos</div></div>
        <div style={styles.summaryCard()}><div style={{ fontSize: 18, fontWeight: 700, color: GOLD }}>{formatCurrency(summary.total_offerings)}</div><div style={{ fontSize: 11, color: '#888' }}>Ofertas</div></div>
        <div style={styles.summaryCard(`linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`)}><div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{formatCurrency(summary.grand_total)}</div><div style={{ fontSize: 11, color: GOLD_LIGHT }}>Total</div></div>
      </div>

      <button style={styles.btn(GOLD)} onClick={() => setShowForm(!showForm)}><Plus size={16} /> {showForm ? 'Fechar' : 'Registrar'}</button>

      {showForm && (
        <form onSubmit={submit} style={{ marginTop: 12, background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          <label style={styles.label}>Valor (€)</label>
          <input style={styles.input} type="number" step="0.01" min="0" placeholder="0,00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          <label style={styles.label}>Tipo</label>
          <select style={styles.select} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="dízimo">Dízimo</option>
            <option value="oferta">Oferta</option>
            <option value="especial">Especial</option>
          </select>
          <label style={styles.label}>Descrição</label>
          <input style={styles.input} placeholder="Opcional" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <button type="submit" style={styles.btn(PURPLE)} disabled={submitting}><Send size={14} /> {submitting ? 'Salvando...' : 'Salvar'}</button>
        </form>
      )}

      {loading ? <div style={styles.loading}>Carregando...</div> : !tithes.length ? <div style={styles.empty}>Nenhum dízimo registrado ainda. Comece agora! 🙏</div> : (
        <div style={{ marginTop: 16 }}>
          {tithes.map((t, i) => (
            <div key={t.id || i} style={styles.listItem}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(t.amount)}</span>
                  <span style={styles.badge(t.type === 'dízimo' ? PURPLE : GOLD)}>{t.type}</span>
                </div>
                <span style={{ fontSize: 12, color: '#999' }}>{formatDate(t.created_at)}</span>
              </div>
              {t.description && <div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>{t.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =================== DESPESAS =================== */
function DespesasSection({ apiFetch, headers }) {
  const [month, setMonth] = useState(currentMonth());
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: 'aluguel', amount: '', description: '', expense_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const categories = ['aluguel', 'água', 'luz', 'internet', 'manutenção', 'outros'];
  const catColors = { aluguel: '#8e44ad', água: '#2980b9', luz: '#f39c12', internet: '#27ae60', manutenção: '#e67e22', outros: '#95a5a6' };

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(`/api/pastor/expenses?month=${month}`)
      .then(d => { setExpenses(d.expenses || []); setSummary(d.summary || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/pastor/expenses`, { method: 'POST', headers, body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }) });
      setForm({ category: 'aluguel', amount: '', description: '', expense_date: '' });
      setShowForm(false);
      load();
    } catch {}
    setSubmitting(false);
  };

  const byCat = summary.by_category || {};

  return (
    <div>
      <div style={styles.sectionTitle}>⚙️ Gestão de Despesas</div>
      <SectionHelp title={'❓ Como funciona Despesas?'} steps={[
        'Registre todas as despesas da igreja (aluguel, água, luz, materiais, etc.).',
        'Clique em "+ Nova Despesa" para adicionar.',
        'Preencha o valor, categoria e descri\u00e7ão.',
        'Compare despesas com entradas nos Relat\u00f3rios para manter as finanças saudáveis.',
      ]} />
      <select style={{ ...styles.select, width: 'auto', marginBottom: 12 }} value={month} onChange={e => setMonth(e.target.value)}>
        {monthOptions().map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
      </select>

      <div style={styles.summaryRow}>
        {categories.filter(c => byCat[c]).map(c => (
          <div key={c} style={{ ...styles.summaryCard(), minWidth: 80 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: catColors[c] || '#555' }}>{formatCurrency(byCat[c])}</div>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'capitalize' }}>{c}</div>
          </div>
        ))}
        <div style={styles.summaryCard(`linear-gradient(135deg, #c0392b, #96281b)`)}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{formatCurrency(summary.total)}</div>
          <div style={{ fontSize: 11, color: '#fdd' }}>Total</div>
        </div>
      </div>

      <button style={styles.btn('#c0392b')} onClick={() => setShowForm(!showForm)}><Plus size={16} /> {showForm ? 'Fechar' : 'Nova Despesa'}</button>

      {showForm && (
        <form onSubmit={submit} style={{ marginTop: 12, background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          <label style={styles.label}>Categoria</label>
          <select style={styles.select} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <label style={styles.label}>Valor (€)</label>
          <input style={styles.input} type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          <label style={styles.label}>Descrição</label>
          <input style={styles.input} placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <label style={styles.label}>Data</label>
          <input style={styles.input} type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} />
          <button type="submit" style={styles.btn(PURPLE)} disabled={submitting}><Send size={14} /> {submitting ? 'Salvando...' : 'Salvar'}</button>
        </form>
      )}

      {loading ? <div style={styles.loading}>Carregando...</div> : !expenses.length ? <div style={styles.empty}>Nenhuma despesa registrada este mês. 📋</div> : (
        <div style={{ marginTop: 16 }}>
          {expenses.map((e, i) => (
            <div key={e.id || i} style={styles.listItem}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(e.amount)}</span>
                  <span style={styles.badge(catColors[e.category] || '#888')}>{e.category}</span>
                </div>
                <span style={{ fontSize: 12, color: '#999' }}>{formatDate(e.expense_date || e.created_at)}</span>
              </div>
              {e.description && <div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>{e.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =================== ESTUDOS =================== */
function EstudosSection({ apiFetch, headers }) {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', bible_references: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch('/api/pastor/studies').then(d => setStudies(d.studies || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/pastor/studies`, { method: 'POST', headers, body: JSON.stringify(form) });
      setForm({ title: '', content: '', bible_references: '' });
      setShowForm(false);
      load();
    } catch {}
    setSubmitting(false);
  };

  return (
    <div>
      <div style={styles.sectionTitle}>📖 Estudos Bíblicos</div>
      <SectionHelp title="❓ Como funciona Estúdos Bíblicos?" steps={[
        'Crie estudos bíblicos para compartilhar com seus membros.',
        'Clique em "+ Novo Estudo" e preencha título e conteúdo.',
        'Os estudos ficam disponíveis para todos os membros da sua igreja.',
        'Use para preparar cultos, células e momentos de ensino.',
      ]} />
      <button style={styles.btn(PURPLE)} onClick={() => setShowForm(!showForm)}><Plus size={16} /> {showForm ? 'Fechar' : 'Novo Estudo'}</button>

      {showForm && (
        <form onSubmit={submit} style={{ marginTop: 12, background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          <label style={styles.label}>Título</label>
          <input style={styles.input} placeholder="Título do estudo" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <label style={styles.label}>Conteúdo</label>
          <textarea style={styles.textarea} placeholder="Escreva o conteúdo do estudo..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
          <label style={styles.label}>Referências Bíblicas</label>
          <input style={styles.input} placeholder="Ex: João 3:16, Salmos 23" value={form.bible_references} onChange={e => setForm({ ...form, bible_references: e.target.value })} />
          <button type="submit" style={styles.btn(PURPLE)} disabled={submitting}><Send size={14} /> {submitting ? 'Salvando...' : 'Publicar'}</button>
        </form>
      )}

      {loading ? <div style={styles.loading}>Carregando...</div> : !studies.length ? <div style={styles.empty}>Nenhum estudo publicado ainda. Compartilhe a Palavra! 📖</div> : (
        <div style={{ marginTop: 16 }}>
          {studies.map((s, i) => (
            <div key={s.id || i} style={styles.listItem}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>{formatDate(s.created_at)} {s.bible_references && <span style={{ color: GOLD }}>• {s.bible_references}</span>}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{(s.content || '').substring(0, 150)}{(s.content || '').length > 150 ? '...' : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =================== COMUNICADOS =================== */
function ComunicadosSection({ apiFetch, headers }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch('/api/pastor/announcements').then(d => setAnnouncements(d.announcements || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/pastor/announcements`, { method: 'POST', headers, body: JSON.stringify(form) });
      setForm({ title: '', content: '', priority: 'normal' });
      setShowForm(false);
      load();
    } catch {}
    setSubmitting(false);
  };

  return (
    <div>
      <div style={styles.sectionTitle}>📢 Comunicados</div>
      <SectionHelp title="❓ Como funciona Comunicados?" steps={[
        'Envie avisos e comunicados para todos os membros da igreja.',
        'Clique em "+ Novo Comunicado" para criar.',
        'Escreva o título e a mensagem do comunicado.',
        'Todos os membros verão o comunicado ao acessar a plataforma.',
      ]} />
      <button style={styles.btn(GOLD)} onClick={() => setShowForm(!showForm)}><Plus size={16} /> {showForm ? 'Fechar' : 'Novo Comunicado'}</button>

      {showForm && (
        <form onSubmit={submit} style={{ marginTop: 12, background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          <label style={styles.label}>Título</label>
          <input style={styles.input} placeholder="Título do comunicado" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <label style={styles.label}>Conteúdo</label>
          <textarea style={styles.textarea} placeholder="Mensagem para a igreja..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
          <label style={styles.label}>Prioridade</label>
          <select style={styles.select} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="normal">Normal</option>
            <option value="urgente">Urgente</option>
          </select>
          <button type="submit" style={styles.btn(PURPLE)} disabled={submitting}><Send size={14} /> {submitting ? 'Enviando...' : 'Enviar'}</button>
        </form>
      )}

      {loading ? <div style={styles.loading}>Carregando...</div> : !announcements.length ? <div style={styles.empty}>Nenhum comunicado enviado ainda. Fale com a sua igreja! 📢</div> : (
        <div style={{ marginTop: 16 }}>
          {announcements.map((a, i) => (
            <div key={a.id || i} style={styles.listItem}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{a.title}</span>
                {a.priority === 'urgente' && <span style={styles.badge('#c0392b')}>URGENTE</span>}
              </div>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>{formatDate(a.created_at)} {a.recipients_count != null && <span>• {a.recipients_count} membros</span>}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{a.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =================== AGENDA =================== */
function AgendaSection({ apiFetch, headers }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', event_date: '', event_time: '', event_type: 'culto' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const types = ['culto', 'célula', 'ensaio', 'reunião', 'evento'];
  const typeColors = { culto: PURPLE, célula: '#27ae60', ensaio: '#e67e22', reunião: '#2980b9', evento: GOLD };

  const load = () => {
    setLoading(true);
    apiFetch('/api/pastor/events').then(d => setEvents((d.events || []).sort((a, b) => new Date(a.event_date) - new Date(b.event_date)))).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.event_date) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/pastor/events`, { method: 'POST', headers, body: JSON.stringify(form) });
      setForm({ title: '', description: '', event_date: '', event_time: '', event_type: 'culto' });
      setShowForm(false);
      load();
    } catch {}
    setSubmitting(false);
  };

  return (
    <div>
      <div style={styles.sectionTitle}>📅 Agenda</div>
      <SectionHelp title="❓ Como funciona a Agenda?" steps={[
        'Organize todos os eventos da igreja: cultos, reuni\u00f5es, retiros, etc.',
        'Clique em "+ Novo Evento" para adicionar.',
        'Preencha título, data, horário e descri\u00e7ão.',
        'Os membros poderão ver os pr\u00f3ximos eventos da igreja.',
      ]} />
      <button style={styles.btn(PURPLE)} onClick={() => setShowForm(!showForm)}><Plus size={16} /> {showForm ? 'Fechar' : 'Novo Evento'}</button>

      {showForm && (
        <form onSubmit={submit} style={{ marginTop: 12, background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          <label style={styles.label}>Título</label>
          <input style={styles.input} placeholder="Nome do evento" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <label style={styles.label}>Descrição</label>
          <input style={styles.input} placeholder="Descrição (opcional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><label style={styles.label}>Data</label><input style={styles.input} type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} required /></div>
            <div style={{ flex: 1 }}><label style={styles.label}>Hora</label><input style={styles.input} type="time" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })} /></div>
          </div>
          <label style={styles.label}>Tipo</label>
          <select style={styles.select} value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })}>
            {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <button type="submit" style={styles.btn(PURPLE)} disabled={submitting}><Send size={14} /> {submitting ? 'Salvando...' : 'Criar Evento'}</button>
        </form>
      )}

      {loading ? <div style={styles.loading}>Carregando...</div> : !events.length ? <div style={styles.empty}>Nenhum evento agendado. Crie o primeiro! 📅</div> : (
        <div style={{ marginTop: 16 }}>
          {events.map((ev, i) => (
            <div key={ev.id || i} style={{ ...styles.listItem, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ background: typeColors[ev.event_type] || PURPLE, color: '#fff', borderRadius: 10, padding: '8px 10px', textAlign: 'center', minWidth: 50 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{ev.event_date ? new Date(ev.event_date).getDate() : '?'}</div>
                <div style={{ fontSize: 10 }}>{ev.event_date ? new Date(ev.event_date).toLocaleDateString('pt-PT', { month: 'short' }) : ''}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{ev.title} <span style={styles.badge(typeColors[ev.event_type] || PURPLE)}>{ev.event_type}</span></div>
                {ev.event_time && <div style={{ fontSize: 12, color: '#888' }}>🕐 {ev.event_time}</div>}
                {ev.description && <div style={{ fontSize: 13, color: '#777', marginTop: 2 }}>{ev.description}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =================== RELATÓRIOS =================== */
function RelatoriosSection({ apiFetch }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/pastor/reports').then(setReport).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Carregando...</div>;
  if (!report) return <div style={styles.error}>Não foi possível carregar os relatórios.</div>;

  const fin = report.financial || {};

  return (
    <div>
      <div style={styles.sectionTitle}>📊 Relatórios</div>
      <SectionHelp title="❓ Como funciona Relat\u00f3rios?" steps={[
        'Veja um resumo completo das finanças e atividades da igreja.',
        'Acompanhe entradas (dízimos + ofertas) vs despesas mês a mês.',
        'Visualize o crescimento de membros e orações.',
        'Use os dados para planejar e prestar contas à congrega\u00e7ão.',
      ]} />
      <div style={styles.statGrid}>
        <div style={styles.statCard}><div style={styles.statNum}>{report.members_count ?? 0}</div><div style={styles.statLabel}>Membros</div></div>
        <div style={styles.statCard}><div style={styles.statNum}>{report.prayers_total ?? 0}</div><div style={styles.statLabel}>Orações</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, fontSize: 18, color: '#27ae60' }}>{report.prayers_answered ?? 0}</div><div style={styles.statLabel}>Respondidas</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, fontSize: 16 }}>{report.prayers_total ? Math.round((report.prayers_answered / report.prayers_total) * 100) : 0}%</div><div style={styles.statLabel}>Taxa Resposta</div></div>
      </div>

      <div style={{ ...styles.sectionTitle, fontSize: 15, marginTop: 8 }}>💰 Financeiro</div>
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard()}><div style={{ fontSize: 16, fontWeight: 700, color: '#27ae60' }}>{formatCurrency(fin.tithes)}</div><div style={{ fontSize: 11, color: '#888' }}>Dízimos</div></div>
        <div style={styles.summaryCard()}><div style={{ fontSize: 16, fontWeight: 700, color: GOLD }}>{formatCurrency(fin.offerings)}</div><div style={{ fontSize: 11, color: '#888' }}>Ofertas</div></div>
      </div>
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard()}><div style={{ fontSize: 16, fontWeight: 700, color: '#c0392b' }}>{formatCurrency(fin.expenses)}</div><div style={{ fontSize: 11, color: '#888' }}>Despesas</div></div>
        <div style={styles.summaryCard(fin.balance >= 0 ? '#e8f5e9' : '#fde8e8')}><div style={{ fontSize: 18, fontWeight: 700, color: fin.balance >= 0 ? '#27ae60' : '#c0392b' }}>{formatCurrency(fin.balance)}</div><div style={{ fontSize: 11, color: '#888' }}>Saldo</div></div>
      </div>

      {report.recent_events?.length > 0 && (
        <>
          <div style={{ ...styles.sectionTitle, fontSize: 15, marginTop: 8 }}>📅 Próximos Eventos</div>
          {report.recent_events.map((ev, i) => (
            <div key={i} style={styles.listItem}>
              <span style={{ fontWeight: 600 }}>{ev.title}</span>
              <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>{formatDate(ev.event_date)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default PastorDashboard;

/* =================== MINHA IGREJA =================== */

const API_BASE_CHURCH = import.meta.env.VITE_API_URL || '';
const PURPLE_C = '#6C3FA0';
const GOLD_C = '#D4A843';

function MinhaIgrejaSection({ apiFetch, headers, token }) {
  const [tab, setTab] = useState('igreja');
  const [church, setChurch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [members, setMembers] = useState([]);
  const [memberFilter, setMemberFilter] = useState('');
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', event_type: 'culto', event_date: '', event_time: '', description: '' });
  const [churchForm, setChurchForm] = useState({ name: '', description: '', city: '', country: '', location: '', pastor_name: '' });

  const loadChurch = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_CHURCH}/api/churches/my/church`, { headers });
      const data = await res.json();
      setChurch(data.church || null);
      if (data.church) {
        setChurchForm({
          name: data.church.name || '',
          description: data.church.description || '',
          city: data.church.city || '',
          country: data.church.country || '',
          location: data.church.address || '',
          pastor_name: data.church.pastor_name || '',
        });
      }
    } catch {}
    setLoading(false);
  }, [headers]);

  const loadMembers = React.useCallback(async (statusFilter) => {
    if (!church) return;
    try {
      const url = `${API_BASE_CHURCH}/api/churches/${church.id}/members${statusFilter ? `?status=${statusFilter}` : ''}`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      setMembers(data.members || []);
    } catch {}
  }, [church, headers]);

  const loadEvents = React.useCallback(async () => {
    if (!church) return;
    try {
      const res = await fetch(`${API_BASE_CHURCH}/api/churches/${church.id}/events`, { headers });
      const data = await res.json();
      setEvents(data.events || []);
    } catch {}
  }, [church, headers]);

  useEffect(() => { loadChurch(); }, [loadChurch]);
  useEffect(() => { if (tab === 'membros' && church) loadMembers(memberFilter); }, [tab, church, memberFilter]);
  useEffect(() => { if (tab === 'agenda' && church) loadEvents(); }, [tab, church]);

  const saveChurch = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const method = church ? 'PATCH' : 'POST';
      const url = church ? `${API_BASE_CHURCH}/api/churches/${church.id}` : `${API_BASE_CHURCH}/api/churches`;
      const res = await fetch(url, { method, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(churchForm) });
      const data = await res.json();
      if (data.church) {
        setMsg('✅ Igreja guardada com sucesso!');
        setChurch(data.church);
      } else {
        setMsg('⚠️ ' + (data.error || 'Erro ao guardar'));
      }
    } catch { setMsg('⚠️ Erro de rede'); }
    setSaving(false);
  };

  const handleMemberAction = async (userId, action, tag) => {
    await fetch(`${API_BASE_CHURCH}/api/churches/${church.id}/members/${userId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, tag }),
    });
    loadMembers(memberFilter);
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_CHURCH}/api/churches/${church.id}/events`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm),
      });
      const data = await res.json();
      if (data.event) {
        setShowEventModal(false);
        setEventForm({ title: '', event_type: 'culto', event_date: '', event_time: '', description: '' });
        loadEvents();
      }
    } catch {}
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('Apagar este evento?')) return;
    await fetch(`${API_BASE_CHURCH}/api/churches/${church.id}/events/${eventId}`, { method: 'DELETE', headers });
    loadEvents();
  };

  const tabs = [
    { id: 'igreja', label: '🏛️ Igreja' },
    { id: 'membros', label: '👥 Membros' },
    { id: 'agenda', label: '📅 Agenda' },
  ];

  const cs = {
    tab: (active) => ({
      padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
      background: active ? PURPLE_C : '#f0f0f0', color: active ? '#fff' : '#555',
    }),
    input: { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 13, boxSizing: 'border-box', marginBottom: 8 },
    textarea: { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 13, boxSizing: 'border-box', marginBottom: 8, minHeight: 72, resize: 'vertical', fontFamily: 'inherit' },
    select: { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 13, boxSizing: 'border-box', marginBottom: 8, background: '#fff' },
    btn: (bg) => ({ background: bg || PURPLE_C, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }),
    label: { fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 2 },
    memberRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
    badge: (bg) => ({ background: bg, color: '#fff', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 600 }),
    eventRow: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
    modal: { background: '#fff', borderRadius: 18, padding: 24, width: '100%', maxWidth: 420 },
  };

  if (loading) return <div style={{ textAlign: 'center', color: PURPLE_C, padding: 32 }}>🏛️ Carregando...</div>;

  return (
    <div>
      <div style={styles.sectionTitle}>🏛️ Minha Igreja</div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} style={cs.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ── Tab Igreja ── */}
      {tab === 'igreja' && (
        <div>
          {!church && <div style={{ background: '#fff8e8', border: '1px solid #f0c040', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 13, color: '#a07820' }}>
            Ainda não tens uma igreja registada. Preenche abaixo para criar a tua.
          </div>}
          <form onSubmit={saveChurch}>
            <label style={cs.label}>Nome da Igreja *</label>
            <input style={cs.input} value={churchForm.name} onChange={e => setChurchForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex: Igreja Vida Nova" />
            <label style={cs.label}>Nome do Pastor</label>
            <input style={cs.input} value={churchForm.pastor_name} onChange={e => setChurchForm(f => ({ ...f, pastor_name: e.target.value }))} placeholder="Nome do pastor responsável" />
            <label style={cs.label}>Descrição</label>
            <textarea style={cs.textarea} value={churchForm.description} onChange={e => setChurchForm(f => ({ ...f, description: e.target.value }))} placeholder="Apresenta a tua igreja..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={cs.label}>Cidade</label>
                <input style={cs.input} value={churchForm.city} onChange={e => setChurchForm(f => ({ ...f, city: e.target.value }))} placeholder="Ex: Madrid" />
              </div>
              <div>
                <label style={cs.label}>País</label>
                <input style={cs.input} value={churchForm.country} onChange={e => setChurchForm(f => ({ ...f, country: e.target.value }))} placeholder="Ex: Espanha" />
              </div>
            </div>
            <label style={cs.label}>Morada / Localização</label>
            <input style={cs.input} value={churchForm.location} onChange={e => setChurchForm(f => ({ ...f, location: e.target.value }))} placeholder="Rua, número, bairro..." />
            {msg && <div style={{ marginBottom: 8, fontSize: 13, color: msg.startsWith('✅') ? '#27ae60' : '#c0392b' }}>{msg}</div>}
            <button type="submit" style={cs.btn()} disabled={saving}>
              {saving ? 'Guardando...' : church ? '💾 Guardar Alterações' : '✨ Criar Igreja'}
            </button>
          </form>

          {church && (
            <div style={{ marginTop: 16, padding: 12, background: '#f8f8ff', borderRadius: 12, fontSize: 13, color: '#555' }}>
              <strong>Igreja registada:</strong> {church.name} — {church.city || '—'}<br />
              <strong>Membros ativos:</strong> {church.member_count || 0} · <strong>Pedidos:</strong> {church.pending_count || 0}
            </div>
          )}
        </div>
      )}

      {/* ── Tab Membros ── */}
      {tab === 'membros' && (
        <div>
          {!church ? (
            <div style={{ textAlign: 'center', color: '#999', padding: 32 }}>Cria uma igreja primeiro.</div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {[
                  { val: '', label: 'Todos' },
                  { val: 'pending', label: '⏳ Pedidos pendentes' },
                  { val: 'active', label: '✅ Membros ativos' },
                ].map(f => (
                  <button key={f.val} style={cs.tab(memberFilter === f.val)} onClick={() => setMemberFilter(f.val)}>{f.label}</button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                {church.member_count || 0} membros · {church.pending_count || 0} pedidos pendentes
              </div>
              {members.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>Nenhum membro encontrado.</div>
              ) : members.map(m => (
                <div key={m.id} style={cs.memberRow}>
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${PURPLE_C}, ${GOLD_C})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                      {(m.full_name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.full_name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{m.email}</div>
                  </div>
                  <span style={cs.badge(m.status === 'active' ? '#27ae60' : GOLD_C)}>{m.member_tag || 'member'}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {m.status === 'pending' && (
                      <>
                        <button style={cs.btn('#27ae60')} onClick={() => handleMemberAction(m.user_id, 'approve')}>✅</button>
                        <button style={cs.btn('#c0392b')} onClick={() => handleMemberAction(m.user_id, 'reject')}>❌</button>
                      </>
                    )}
                    {m.status === 'active' && (
                      <>
                        <select style={{ ...cs.select, width: 'auto', marginBottom: 0, fontSize: 11 }}
                          value={m.member_tag || 'member'}
                          onChange={e => handleMemberAction(m.user_id, 'set_tag', e.target.value)}>
                          <option value="member">Membro</option>
                          <option value="visitor">Visitante</option>
                          <option value="new_convert">Novo Convertido</option>
                          <option value="leader">Líder</option>
                        </select>
                        <button style={cs.btn('#c0392b')} onClick={() => handleMemberAction(m.user_id, 'remove')}>🗑️</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Tab Agenda ── */}
      {tab === 'agenda' && (
        <div>
          {!church ? (
            <div style={{ textAlign: 'center', color: '#999', padding: 32 }}>Cria uma igreja primeiro.</div>
          ) : (
            <>
              <button style={{ ...cs.btn(), marginBottom: 16 }} onClick={() => setShowEventModal(true)}>+ Criar Evento</button>

              {events.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>Sem eventos programados.</div>
              ) : events.map(ev => {
                const typeLabel = { culto: '🕊️ Culto', campanha: '📢 Campanha', reuniao: '🤝 Reunião', outro: '📅 Evento' }[ev.event_type] || '📅 Evento';
                const typeColor = { culto: '#2980b9', campanha: GOLD_C, reuniao: '#27ae60', outro: '#888' }[ev.event_type] || '#888';
                return (
                  <div key={ev.id} style={cs.eventRow}>
                    <span style={cs.badge(typeColor)}>{typeLabel}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>
                        {new Date(ev.event_date).toLocaleDateString('pt-PT')}
                        {ev.event_time ? ` · ${ev.event_time.slice(0, 5)}` : ''}
                      </div>
                      {ev.description && <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{ev.description}</div>}
                    </div>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: 16 }} onClick={() => deleteEvent(ev.id)}>🗑️</button>
                  </div>
                );
              })}

              {/* Modal criar evento */}
              {showEventModal && (
                <div style={cs.overlay} onClick={() => setShowEventModal(false)}>
                  <div style={cs.modal} onClick={e => e.stopPropagation()}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: PURPLE_C, marginBottom: 16 }}>📅 Criar Evento</div>
                    <form onSubmit={createEvent}>
                      <label style={cs.label}>Título *</label>
                      <input style={cs.input} value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} required placeholder="Ex: Culto de Domingo" />
                      <label style={cs.label}>Tipo</label>
                      <select style={cs.select} value={eventForm.event_type} onChange={e => setEventForm(f => ({ ...f, event_type: e.target.value }))}>
                        <option value="culto">🕊️ Culto</option>
                        <option value="campanha">📢 Campanha</option>
                        <option value="reuniao">🤝 Reunião</option>
                        <option value="outro">📅 Outro</option>
                      </select>
                      <label style={cs.label}>Data *</label>
                      <input style={cs.input} type="date" value={eventForm.event_date} onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))} required />
                      <label style={cs.label}>Hora</label>
                      <input style={cs.input} type="time" value={eventForm.event_time} onChange={e => setEventForm(f => ({ ...f, event_time: e.target.value }))} />
                      <label style={cs.label}>Descrição</label>
                      <textarea style={cs.textarea} value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalhes do evento..." />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" style={cs.btn()}>✨ Criar</button>
                        <button type="button" style={cs.btn('#999')} onClick={() => setShowEventModal(false)}>Cancelar</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
