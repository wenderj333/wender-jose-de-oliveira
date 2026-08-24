import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Eye, Loader2, ShieldAlert, UserRoundX, UserRoundCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';
const reasonLabels = { inappropriate: 'Conteúdo impróprio', disrespectful: 'Desrespeito', spam: 'Spam', harassment: 'Assédio', other: 'Outro' };

export default function SafetyCenter() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_BASE}/api/reports`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível carregar as denúncias.');
      setReports(data.reports || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);
  const act = async (id, status, accountAction) => {
    try {
      const response = await fetch(`${API_BASE}/api/reports/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status, accountAction }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar.');
      await load();
    } catch (err) { setError(err.message); }
  };
  const visible = reports.filter(report => filter === 'all' || report.status === filter);
  const pending = reports.filter(report => report.status === 'pending').length;

  return <div style={{ maxWidth: 980, margin: '0 auto', padding: '26px 14px 48px', color: '#1e2240' }}>
    <header style={{ background: 'linear-gradient(120deg,#203a64,#3568b8)', color: '#fff', padding: '26px', borderRadius: 20, boxShadow: '0 12px 28px rgba(35,71,125,.18)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800 }}><ShieldAlert size={21}/> SEGURANÇA DA COMUNIDADE</div>
      <h1 style={{ margin: '10px 0 6px', fontSize: 'clamp(1.65rem,4vw,2.25rem)' }}>Central de Moderação</h1>
      <p style={{ margin: 0, opacity: .9 }}>Analise denúncias e mantenha a comunidade segura e respeitosa.</p>
    </header>
    <section style={{ margin: '18px 0', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ background: pending ? '#fff3dc' : '#eaf7ef', border: `1px solid ${pending ? '#f0cd8e' : '#bde4ca'}`, color: pending ? '#935e00' : '#287a4b', borderRadius: 14, padding: '12px 15px', fontWeight: 800 }}><AlertTriangle size={17} style={{ verticalAlign: 'middle', marginRight: 7 }}/>{pending} pendente{pending === 1 ? '' : 's'}</div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 7, flexWrap: 'wrap' }}>{[['pending', 'Pendentes'], ['reviewed', 'Analisadas'], ['dismissed', 'Arquivadas'], ['all', 'Todas']].map(([value, label]) => <button key={value} onClick={() => setFilter(value)} style={{ border: filter === value ? '1px solid #3568b8' : '1px solid #d9e1ef', color: filter === value ? '#fff' : '#52617d', background: filter === value ? '#3568b8' : '#fff', borderRadius: 999, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}>{label}</button>)}</div>
    </section>
    {error && <p style={{ color: '#b42318', background: '#fff0ef', padding: 12, borderRadius: 10 }}>{error}</p>}
    {loading ? <div style={{ textAlign: 'center', padding: 70, color: '#667085' }}><Loader2 className="spin"/> A carregar denúncias...</div> : !visible.length ? <div style={{ background: '#fff', border: '1px solid #e0e6f5', borderRadius: 18, textAlign: 'center', padding: 55, color: '#667085' }}><CheckCircle2 size={38} color="#2f8d58"/><h2 style={{ color: '#1e2240' }}>Tudo tranquilo</h2><p>Não há denúncias nesta lista.</p></div> : <div style={{ display: 'grid', gap: 12 }}>{visible.map(report => <article key={report.id} style={{ background: '#fff', border: '1px solid #e0e6f5', borderRadius: 16, padding: 18, boxShadow: '0 5px 18px rgba(50,76,125,.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><span style={{ background: report.status === 'pending' ? '#fff3dc' : '#edf4ff', color: report.status === 'pending' ? '#935e00' : '#3568b8', borderRadius: 999, padding: '5px 9px', fontSize: 12, fontWeight: 800 }}>{report.status === 'pending' ? 'PENDENTE' : report.status.toUpperCase()}</span><h2 style={{ margin: '10px 0 4px', fontSize: '1.05rem' }}>{reasonLabels[report.reason] || report.reason}</h2><p style={{ margin: 0, color: '#667085', fontSize: 13 }}>{new Date(report.created_at).toLocaleString('pt-PT')}</p></div><div style={{ color: '#59627d', fontSize: 13, textAlign: 'right' }}>Enviada por<br/><strong>{report.reporter_name || 'Membro'}</strong></div></div>
      {report.description && <p style={{ margin: '16px 0', lineHeight: 1.5, background: '#f7f9fd', padding: 12, borderRadius: 10 }}>{report.description}</p>}
      <div style={{ borderTop: '1px solid #e8edf6', paddingTop: 13, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><div style={{ flex: 1, minWidth: 180 }}><strong>{report.reported_name || 'Publicação denunciada'}</strong><div style={{ color: '#667085', fontSize: 13 }}>{report.reported_email || 'Sem perfil associado'}</div></div>{report.reported_user_id && <Link to={`/perfil/${report.reported_user_id}`} style={{ color: '#3568b8', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}><Eye size={15} style={{ verticalAlign: 'middle' }}/> Ver perfil</Link>}{report.status === 'pending' && <button onClick={() => act(report.id, 'reviewed')} style={buttonStyle('#3568b8')}><CheckCircle2 size={15}/> Marcar analisada</button>}{report.reported_user_id && (report.is_suspended ? <button onClick={() => act(report.id, 'resolved', 'restore')} style={buttonStyle('#2f8d58')}><UserRoundCheck size={15}/> Desbloquear</button> : <button onClick={() => { if (window.confirm(`Suspender a conta de ${report.reported_name}?`)) act(report.id, 'resolved', 'suspend'); }} style={buttonStyle('#c73c3c')}><UserRoundX size={15}/> Suspender conta</button>)}</div>
    </article>)}</div>}
    <style>{`.spin{animation:spin 1s linear infinite;vertical-align:middle;margin-right:8px}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>;
}

function buttonStyle(background) { return { display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, borderRadius: 10, padding: '9px 11px', color: '#fff', background, cursor: 'pointer', fontWeight: 800, fontSize: 13 }; }
