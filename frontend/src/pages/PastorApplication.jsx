import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Church, CheckCircle2, Clock3, Send, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com/api';

export default function PastorApplication() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({ church_name: '', city: '', country: '', address: '', phone: '', message: '' });
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return setLoading(false);
    fetch(`${API}/pastor-applications/mine`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setApplication(data.application); if (data.application) setForm(data.application); })
      .catch(() => setError('Não foi possível consultar o seu pedido agora.'))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async (event) => {
    event.preventDefault(); setError(''); setSuccess(''); setSending(true);
    try {
      const response = await fetch(`${API}/pastor-applications`, { method: 'POST', headers, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível enviar o pedido.');
      setApplication(data.application); setSuccess(data.message);
    } catch (err) { setError(err.message); } finally { setSending(false); }
  };

  if (!user) return <main style={styles.wrap}><section style={styles.card}><Church color="#6b3faf" size={38}/><h1>Registo de pastor</h1><p>Entre na sua conta primeiro para enviar o pedido da sua igreja.</p><Link style={styles.button} to="/login">Entrar</Link></section></main>;
  if (user.role === 'pastor' || user.role === 'admin') return <main style={styles.wrap}><section style={styles.card}><CheckCircle2 color="#218a52" size={42}/><h1>A sua conta já é de pastor</h1><p>Já tem acesso à organização da sua igreja.</p><Link style={styles.button} to="/sala-pastor">Abrir Sala do Pastor</Link></section></main>;

  return <main style={styles.wrap}><section style={styles.card}>
    <div style={styles.icon}><Church size={27}/></div><h1>Registar-me como pastor</h1>
    <p style={styles.lead}>Envie os dados básicos da sua igreja. A equipa analisa o pedido antes de libertar a Sala do Pastor.</p>
    {loading ? <p>A carregar…</p> : application?.status === 'pending' ? <div style={styles.pending}><Clock3 size={20}/><div><b>Pedido em análise</b><br/><span>Vamos avisar nesta conta quando estiver aprovado.</span></div></div> : <form onSubmit={submit} style={styles.form}>
      <label>Nome da igreja<input required value={form.church_name} onChange={e => setForm({...form, church_name:e.target.value})} placeholder="Ex.: Igreja Comunidade da Fé"/></label>
      <div style={styles.row}><label>Cidade<input required value={form.city} onChange={e => setForm({...form, city:e.target.value})}/></label><label>País<input required value={form.country} onChange={e => setForm({...form, country:e.target.value})}/></label></div>
      <label>Morada da igreja <small>(opcional)</small><input value={form.address || ''} onChange={e => setForm({...form, address:e.target.value})}/></label>
      <label>Telefone ou WhatsApp <small>(opcional)</small><input value={form.phone || ''} onChange={e => setForm({...form, phone:e.target.value})}/></label>
      <label>Conte-nos brevemente sobre a igreja <small>(opcional)</small><textarea rows="3" value={form.message || ''} onChange={e => setForm({...form, message:e.target.value})} placeholder="Denominação, horários ou como pretende usar a plataforma…"/></label>
      {error && <p style={styles.error}>{error}</p>}{success && <p style={styles.success}>{success}</p>}
      <button disabled={sending} style={styles.button}><Send size={17}/>{sending ? 'A enviar…' : application?.status === 'rejected' ? 'Enviar novamente' : 'Enviar pedido para análise'}</button>
    </form>}
    <p style={styles.safe}><ShieldCheck size={16}/> A aprovação protege os membros e as igrejas da comunidade.</p>
  </section></main>;
}

const styles = { wrap:{minHeight:'70vh',display:'grid',placeItems:'center',padding:'38px 18px',background:'#f6f5fb'}, card:{width:'min(100%,620px)',boxSizing:'border-box',background:'#fff',border:'1px solid #e6e0ef',borderRadius:24,padding:'clamp(25px,5vw,44px)',boxShadow:'0 18px 46px rgba(58,35,92,.10)',color:'#24203a'}, icon:{width:55,height:55,borderRadius:16,display:'grid',placeItems:'center',background:'#f0e8fb',color:'#6b3faf'}, lead:{color:'#687184',lineHeight:1.55}, form:{display:'grid',gap:14,marginTop:22}, row:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}, pending:{display:'flex',gap:12,alignItems:'flex-start',marginTop:22,padding:16,borderRadius:14,background:'#fff7df',color:'#6b4b09'}, button:{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:8,padding:'13px 17px',border:0,borderRadius:12,background:'#673da1',color:'#fff',fontWeight:800,textDecoration:'none',cursor:'pointer'}, error:{margin:0,color:'#b42318',fontWeight:650}, success:{margin:0,color:'#176d43',fontWeight:650}, safe:{display:'flex',alignItems:'center',gap:7,marginTop:24,color:'#607064',fontSize:13,lineHeight:1.4} };
