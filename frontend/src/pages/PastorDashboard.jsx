import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div style={styles.headerTitle}><ShieldCheck size={24} /> Painel do Pastor</div>
        <div style={styles.verse}>{verse}</div>
        {overview?.church && <div style={{ fontSize: 13, opacity: 0.8, paddingBottom: 8 }}>{overview.church}</div>}
      </div>
      <div style={styles.container}>
        {!section && (
          <>
            {loadingOverview ? <div style={styles.loading}>Carregando...</div> : stats && (
              <div style={styles.statGrid}>
                <div style={styles.statCard}><div style={styles.statNum}>{stats.members ?? 0}</div><div style={styles.statLabel}>Membros</div></div>
                <div style={styles.statCard}><div style={styles.statNum}>{stats.prayers ?? 0}</div><div style={styles.statLabel}>Orações</div></div>
                <div style={styles.statCard}><div style={{ ...styles.statNum, color: GOLD }}>{formatCurrency((stats.tithesTotal || 0) + (stats.offeringsTotal || 0))}</div><div style={styles.statLabel}>Entradas do Mês</div></div>
                <div style={styles.statCard}><div style={styles.statNum}>{stats.activeChats ?? 0}</div><div style={styles.statLabel}>Chats Ativos</div></div>
              </div>
            )}
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
