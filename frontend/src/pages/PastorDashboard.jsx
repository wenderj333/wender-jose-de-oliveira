import React, { useState, useEffect, useCallback } from 'react';


import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Users, Heart, BookOpen, MessageCircle, DollarSign, Calendar, ArrowLeft, Megaphone, HandHeart, BarChart3, Settings, Plus, Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sigo_com_fe';
async function uploadToCloudinary(file) {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload', { method: 'POST', body: form });
  const data = await res.json();
  return data.secure_url;
}

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
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f5f0ff 100%)', fontFamily: "'Segoe UI', sans-serif" },
  container: { maxWidth: 1120, margin: '0 auto', padding: '16px 20px 80px', boxSizing: 'border-box' },
  header: { maxWidth: 1120, margin: '18px auto 16px', textAlign: 'center', padding: '24px 20px 14px', background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`, borderRadius: 24, color: '#fff', boxShadow: '0 18px 45px rgba(74,34,112,.2)' },
  headerTitle: { fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  verse: { fontSize: 13, color: GOLD_LIGHT, fontStyle: 'italic', padding: '8px 16px', marginTop: 4 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 12, marginTop: 12 },
  card: (active) => ({ background: active ? `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})` : 'rgba(255,255,255,.95)', borderRadius: 16, padding: '18px 10px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 5px 18px rgba(47,27,78,0.08)', border: active ? 'none' : '1px solid #ebe4f4', color: active ? '#fff' : '#333', transition: 'transform .2s, box-shadow .2s' }),
  cardIcon: { fontSize: 28, marginBottom: 4 },
  cardLabel: { fontSize: 12, fontWeight: 600 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 18 },
  statCard: { background: '#fff', borderRadius: 16, padding: 18, textAlign: 'center', boxShadow: '0 6px 20px rgba(47,27,78,0.08)', border: '1px solid #eee7f5' },
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
  const location = useLocation();
  const { user, token } = useAuth();
  const [section, setSection] = useState(() => new URLSearchParams(location.search).get('secao') || null);
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const apiFetch = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API_BASE}${path}`, { headers, ...opts });
    if (!res.ok) return null;
    return res.json();
  }, [token]);

  useEffect(() => {
    apiFetch('/api/pastor/overview').then(d => setOverview(d || {})).catch(() => setOverview({})).finally(() => setLoadingOverview(false));
  }, []);

  const verse = verses[Math.floor(Math.random() * verses.length)];

  const sections = [
    { id: 'minha-igreja', label: 'Minha igreja', Ico: ShieldCheck },
    { id: 'membros', label: 'Membros', Ico: Users },
    { id: 'oracoes', label: 'Orações', Ico: Heart },
    { id: 'chat', label: 'Conversas', Ico: MessageCircle },
    { id: 'comunicados', label: 'Comunicados', Ico: Megaphone },
    { id: 'agenda', label: 'Agenda', Ico: Calendar },
    { id: 'estudos', label: 'Estudos', Ico: BookOpen },
    { id: 'dizimos', label: 'Registos', Ico: DollarSign },
    { id: 'despesas', label: 'Despesas', Ico: Settings },
    { id: 'relatorios', label: 'Relatórios', Ico: BarChart3 },
  ];

  const handleSection = (id) => {
    if (id === 'oracoes') return setSection('oracoes');
    if (id === 'chat') return navigate('/chat-pastoral');
    setSection(id);
  };

  const stats = overview?.stats || {};

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerTitle}><ShieldCheck size={24} /> Sala do Pastor</div>
        <div style={styles.verse}>{verse}</div>
        {overview?.church && <div style={{ fontSize: 13, opacity: 0.8, paddingBottom: 8 }}>{overview.church?.name || overview.church}</div>}
      </div>
      <div style={styles.container}>
        {!section && (
          <>
            {loadingOverview ? <div style={styles.loading}>{t('pastorDashboard.loading')}</div> : stats && (
              <div style={styles.statGrid}>
                <div style={styles.statCard}><Users size={20} color={PURPLE} /><div style={styles.statNum}>{stats.members ?? 0}</div><div style={styles.statLabel}>Membros ativos</div></div>
                <div style={styles.statCard}><Heart size={20} color="#c2417b" /><div style={styles.statNum}>{stats.prayers ?? 0}</div><div style={styles.statLabel}>Pedidos de oração</div></div>
                <div style={styles.statCard}><DollarSign size={20} color={GOLD} /><div style={{ ...styles.statNum, color: GOLD }}>{formatCurrency((stats.tithesTotal || 0) + (stats.offeringsTotal || 0))}</div><div style={styles.statLabel}>Registos do mês</div></div>
                <div style={styles.statCard}><MessageCircle size={20} color="#2563eb" /><div style={styles.statNum}>{stats.activeChats ?? 0}</div><div style={styles.statLabel}>Conversas ativas</div></div>
              </div>
            )}
            <div style={{ background: '#fff', border: '1px solid #ebe4f4', borderRadius: 18, padding: '20px', marginBottom: '18px', boxShadow: '0 6px 20px rgba(47,27,78,.06)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}><ShieldCheck size={21} color={PURPLE} /><h3 style={{ fontSize:'1.05rem', color:PURPLE_DARK, margin:0 }}>Comece a organizar a sua comunidade</h3></div>
              <p style={{ fontSize:'0.88rem', color:'#64748b', lineHeight:1.55, margin:'0 0 14px' }}>A Sala do Pastor reúne a sua igreja num único lugar. Os pagamentos não estão ativos: a área financeira serve apenas para registos internos.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:10 }}>
                <button onClick={()=>setSection('minha-igreja')} style={{ textAlign:'left', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:12, cursor:'pointer', color:'#334155' }}><b>1. Complete a igreja</b><br/><span style={{fontSize:12}}>Dados, morada e página pública</span></button>
                <button onClick={()=>setSection('membros')} style={{ textAlign:'left', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:12, cursor:'pointer', color:'#334155' }}><b>2. Convide membros</b><br/><span style={{fontSize:12}}>Veja quem escolheu seguir a igreja</span></button>
                <button onClick={()=>setSection('comunicados')} style={{ textAlign:'left', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:12, cursor:'pointer', color:'#334155' }}><b>3. Publique um comunicado</b><br/><span style={{fontSize:12}}>Partilhe cultos, eventos e avisos</span></button>
              </div>
            </div>
            <div style={styles.grid}>
              {sections.map(s => (
                <button key={s.id} type="button" style={{ ...styles.card(false), fontFamily:'inherit' }} onClick={() => handleSection(s.id)}>
                  <div style={styles.cardIcon}><s.Ico size={27} color={PURPLE} /></div>
                  <div style={styles.cardLabel}>{s.label}</div>
                </button>
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
            {section === 'oracoes' && <OracoesSection apiFetch={apiFetch} />}
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
      {(members || []).map(m => (
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
          {(tithes || []).map((t, i) => (
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
          {(expenses || []).map((e, i) => (
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

/* =================== ORAÇÕES =================== */
function OracoesSection({ apiFetch }) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    apiFetch('/api/help-posts/pastor/requests')
      .then(d => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString();
  };
  const confirmPrayer = async (id) => {
    const response = await apiFetch(`/api/help-posts/${id}/church-praying`, { method: 'POST' });
    if (response?.acknowledged) setPosts(current => current.map(post => post.id === id ? { ...post, acknowledged: true, church_ack_count: Number(post.church_ack_count || 0) + 1 } : post));
  };
  const sendPastoralReply = async (id) => {
    const content = replyText.trim();
    if (!content) return;
    const response = await apiFetch(`/api/help-posts/${id}/pastoral-reply`, { method: 'POST', body: JSON.stringify({ content }) });
    if (response?.reply) {
      setPosts(current => current.map(post => post.id === id ? { ...post, pastoral_reply: response.reply.content, pastoral_reply_church: response.reply.church_name } : post));
      setReplyText(''); setReplyingId(null);
    }
  };

  return (
    <div>
      <div style={styles.sectionTitle}>🙏 {t('pastorDashboard.prayerRequests', 'Pedidos de Oração')}</div>
      <SectionHelp title="❓ Pedidos enviados à tua igreja" steps={[
        'Aqui aparecem apenas pedidos que escolheram a tua igreja na Praça Mundial de Oração.',
        'Ao confirmar, a pessoa recebe uma notificação de que a tua igreja está a orar.',
        'Nunca partilhes o pedido fora da equipa autorizada da tua igreja.',
      ]} />

      {loading ? (
        <div style={styles.loading}>{t('common.loading', 'Carregando...')}</div>
      ) : !posts.length ? (
        <div style={styles.empty}>🕊️ Ainda não há pedidos enviados à tua igreja.</div>
      ) : (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(posts || []).map((p, i) => (
            <div key={p.id || i} style={{ ...styles.listItem, borderLeft: '4px solid #6c47d4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#6c47d4' }}>
                  {p.post_type === 'testimony' ? '💛 Testemunho' : p.post_type === 'offer' ? '❤️ Ajuda' : '🙏 Pedido'}
                </span>
                <span style={{ fontSize: 11, color: '#aaa' }}>{formatDate(p.created_at)}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                {p.is_anonymous ? t('ajudaProximo.anonymous', 'Anónimo') : (p.author_name || 'Membro')}
              </div>
              <div style={{ fontSize: 11, color: '#29805b', fontWeight: 700, marginBottom: 5 }}>⛪ Enviado para {p.church_name}</div>
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{p.content}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
                🙏 {p.prayer_count || 0} {t('ajudaProximo.peoplePreyed', 'pessoas oraram')}
              </div>
              <button disabled={p.acknowledged} onClick={() => confirmPrayer(p.id)} style={{ ...styles.btn(p.acknowledged ? '#9ab6a5' : '#258357'), marginTop: 10, opacity: p.acknowledged ? .8 : 1 }}>
                {p.acknowledged ? '✓ A tua igreja já confirmou oração' : '🙏 A nossa igreja está a orar'}
              </button>
              {p.pastoral_reply ? <div style={{ marginTop: 10, padding: 10, borderRadius: 9, background: '#edf8f0', color: '#236346', fontSize: 13 }}><b>Resposta enviada pela tua igreja:</b><br/>{p.pastoral_reply}</div> : replyingId === p.id ? <div style={{ marginTop: 10 }}><textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} placeholder="Escreve uma palavra de apoio e oração..." style={{ width: '100%', boxSizing: 'border-box', padding: 9, borderRadius: 8, border: '1px solid #cfe0d5' }}/><div style={{ display: 'flex', gap: 8, marginTop: 7 }}><button onClick={() => sendPastoralReply(p.id)} style={styles.btn('#6c47d4')}>Enviar resposta</button><button onClick={() => { setReplyingId(null); setReplyText(''); }} style={styles.btn('#98a4a0')}>Cancelar</button></div></div> : <button onClick={() => { setReplyingId(p.id); setReplyText(''); }} style={{ ...styles.btn('#6c47d4'), marginTop: 8 }}>💬 Responder à pessoa</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =================== ESTUDOS =================== */
function EstudosSection({ apiFetch, headers }) {
  const { t } = useTranslation();
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
      <div style={styles.sectionTitle}>📖 {t('pastorDashboard.biblicalStudies', 'Estudos Bíblicos')}</div>
      <SectionHelp title={t('pastorDashboard.studiesHelpTitle', '❓ Como funcionam os Estudos Bíblicos?')} steps={[
        t('pastorDashboard.studiesHelp1', 'Crie estudos bíblicos para compartilhar com seus membros.'),
        t('pastorDashboard.studiesHelp2', 'Clique em "+ Novo Estudo" e preencha título e conteúdo.'),
        t('pastorDashboard.studiesHelp3', 'Os estudos ficam disponíveis para todos os membros da sua igreja.'),
        t('pastorDashboard.studiesHelp4', 'Use para preparar cultos, células e momentos de ensino.'),
      ]} />
      <button style={styles.btn(PURPLE)} onClick={() => setShowForm(!showForm)}><Plus size={16} /> {showForm ? t('common.close', 'Fechar') : t('pastorDashboard.newStudy', 'Novo Estudo')}</button>

      {showForm && (
        <form onSubmit={submit} style={{ marginTop: 12, background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          <label style={styles.label}>{t('pastorDashboard.studyTitle', 'Título')}</label>
          <input style={styles.input} placeholder={t('pastorDashboard.studyTitlePlaceholder', 'Título do estudo')} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <label style={styles.label}>{t('pastorDashboard.studyContent', 'Conteúdo')}</label>
          <textarea style={styles.textarea} placeholder={t('pastorDashboard.studyContentPlaceholder', 'Escreva o conteúdo do estudo...')} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
          <label style={styles.label}>{t('pastorDashboard.studyReferences', 'Referências Bíblicas')}</label>
          <input style={styles.input} placeholder="Ex: João 3:16, Salmos 23" value={form.bible_references} onChange={e => setForm({ ...form, bible_references: e.target.value })} />
          <button type="submit" style={styles.btn(PURPLE)} disabled={submitting}><Send size={14} /> {submitting ? t('common.saving', 'Salvando...') : t('pastorDashboard.publish', 'Publicar')}</button>
        </form>
      )}

      {loading ? <div style={styles.loading}>{t('common.loading', 'Carregando...')}</div> : !studies.length ? <div style={styles.empty}>{t('pastorDashboard.noStudies', 'Nenhum estudo publicado ainda. Compartilhe a Palavra!')} 📖</div> : (
        <div style={{ marginTop: 16 }}>
          {(studies || []).map((s, i) => (
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
          {(announcements || []).map((a, i) => (
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
          {(events || []).map((ev, i) => (
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
          {report.recent_(events || []).map((ev, i) => (
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
