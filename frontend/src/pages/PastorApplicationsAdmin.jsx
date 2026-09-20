import React, { useEffect, useState } from 'react';
import { Check, Church, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com/api';

export default function PastorApplicationsAdmin() {
  const { token } = useAuth();
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [working, setWorking] = useState('');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const load = () => fetch(`${API}/pastor-applications`, { headers }).then(r => r.ok ? r.json() : Promise.reject()).then(d => setItems(d.applications || [])).catch(() => setError('Não foi possível carregar os pedidos.')).finally(() => setLoading(false));
  useEffect(load, [token]);
  const review = async (id, status) => { setWorking(id + status); setError(''); try { const r = await fetch(`${API}/pastor-applications/${id}/review`, { method:'PATCH', headers, body:JSON.stringify({ status }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error); setItems(current => current.map(x => x.id === id ? { ...x, status } : x)); } catch (e) { setError(e.message || 'Não foi possível concluir.'); } finally { setWorking(''); } };
  return <main style={{maxWidth:920,margin:'0 auto',padding:'32px 20px'}}><h1 style={{display:'flex',gap:10,alignItems:'center'}}><Church color="#6b3faf"/> Pedidos de registo de pastor</h1><p style={{color:'#617080'}}>Aprove somente igrejas e pastores que você confirmou. Ao aprovar, a conta recebe acesso à Sala do Pastor.</p>{error && <p style={{color:'#b42318'}}>{error}</p>}{loading ? <p>A carregar…</p> : !items.length ? <div style={empty}>Ainda não há pedidos.</div> : <div style={{display:'grid',gap:14}}>{items.map(item => <article key={item.id} style={card}><div style={{flex:1}}><b style={{fontSize:18}}>{item.church_name}</b><span style={badge(item.status)}>{item.status === 'pending' ? 'Em análise' : item.status === 'approved' ? 'Aprovado' : 'Recusado'}</span><p style={{margin:'8px 0'}}><b>{item.full_name}</b> · {item.email}<br/>{item.city}, {item.country}{item.phone ? ` · ${item.phone}` : ''}</p>{item.address && <p style={{margin:'6px 0',color:'#617080'}}>Morada: {item.address}</p>}{item.message && <p style={{margin:'6px 0',color:'#617080'}}>Mensagem: {item.message}</p>}</div>{item.status === 'pending' && <div style={{display:'flex',gap:8,alignItems:'center'}}><button disabled={!!working} onClick={() => review(item.id,'approved')} style={approve}><Check size={16}/> Aprovar</button><button disabled={!!working} onClick={() => review(item.id,'rejected')} style={reject}><X size={16}/> Recusar</button></div>}</article>)}</div>}</main>;
}
const card={display:'flex',gap:16,padding:20,border:'1px solid #e5e7eb',borderRadius:16,background:'#fff',boxShadow:'0 6px 18px rgba(25,35,50,.05)'};
const empty={padding:25,borderRadius:14,background:'#f6f7fb',color:'#607080'};
const badge=(status)=>({display:'inline-block',marginLeft:10,padding:'4px 8px',borderRadius:99,fontSize:12,fontWeight:800,background:status==='pending'?'#fff4d6':status==='approved'?'#e5f7ec':'#fde8e8',color:status==='pending'?'#785700':status==='approved'?'#197344':'#a52a2a'});
const approve={display:'inline-flex',alignItems:'center',gap:5,border:0,borderRadius:9,padding:'10px 12px',background:'#217a49',color:'#fff',fontWeight:800,cursor:'pointer'};
const reject={display:'inline-flex',alignItems:'center',gap:5,border:'1px solid #edbaba',borderRadius:9,padding:'10px 12px',background:'#fff',color:'#a52a2a',fontWeight:800,cursor:'pointer'};
