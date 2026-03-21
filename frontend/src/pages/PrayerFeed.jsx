import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PrayerCard from '../components/PrayerCard';
import { useAuth } from '../context/AuthContext';
import { HandHeart, Trophy, AlertTriangle, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Demo prayers removidos

const CATEGORY_CONFIG = {
  health:       { label: 'Saude',     color: '#e74c3c' },
  work_finance: { label: 'Trabalho',  color: '#f39c12' },
  family:       { label: 'Familia',   color: '#3498db' },
  studies:      { label: 'Estudos',   color: '#9b59b6' },
  housing:      { label: 'Moradia',   color: '#1abc9c' },
  emotional:    { label: 'Emocional', color: '#5b8def' },
  decisions:    { label: 'Decisoes',  color: '#e67e22' },
  other:        { label: 'Outro',     color: '#daa520' },
};

export default function PrayerFeed() {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [prayers, setPrayers] = useState([]);
  const [tab, setTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'other', is_urgent: false });
  const [loading, setLoading] = useState(true);
  const isPastor = user?.role === 'pastor' || user?.role === 'admin';

  const fetchPrayers = async () => {
    setLoading(true);
    const endpoint = tab === 'answered' ? API_BASE+'/api/prayers/answered' : API_BASE+'/api/prayers';
    try {
      const headers = token ? { Authorization: 'Bearer '+token } : {};
      const res = await fetch(endpoint, { headers });
      const data = await res.json();
      let result = data.prayers || [];
      if (user && !isPastor) result = result.filter(p => p.author_id === user.id);
      setPrayers(result);
    } catch { setPrayers([]); }
    setLoading(false);
  };

  useEffect(() => { fetchPrayers(); }, [tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    await fetch(API_BASE+'/api/prayers', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify(form) });
    setForm({ title: '', content: '', category: 'other', is_urgent: false });
    setShowForm(false);
    fetchPrayers();
  };

  const handlePray = async (prayerId) => {
    if (prayerId.startsWith('demo-')) { setPrayers(prev => prev.map(p => p.id === prayerId ? {...p, prayer_count: (p.prayer_count||0)+1} : p)); return; }
    await fetch(API_BASE+'/api/prayers/'+prayerId+'/pray', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify({ message: '' }) });
    fetchPrayers();
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 0 80px' }}>
      <style>{'.pinput{width:100%;background:#0f0f1a;border:1px solid #333;border-radius:10px;padding:10px 14px;color:#fff;font-size:.9rem;box-sizing:border-box;outline:none}.pinput:focus{border-color:#daa520}'}</style>

      <div style={{ background:'linear-gradient(135deg,#0f0f1a,#1a1a2e)', borderRadius:'0 0 24px 24px', padding:'28px 20px 20px', marginBottom:20, borderBottom:'1px solid rgba(218,165,32,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <h2 style={{ color:'#daa520', margin:0, fontSize:'1.5rem', display:'flex', alignItems:'center', gap:8 }}>
              {tab === 'answered' ? <><Trophy size={24} /> Mural de Vitorias</> : <><HandHeart size={24} /> Pedidos de Oracao</>}
            </h2>
            <p style={{ color:'rgba(255,255,255,0.5)', margin:'4px 0 0', fontSize:'0.85rem' }}>Ore pelos seus irmaos na fe</p>
          </div>
          {user && (
            <button onClick={() => setShowForm(!showForm)} style={{ background: showForm ? 'rgba(218,165,32,0.2)' : 'linear-gradient(135deg,#daa520,#f4d03f)', border: showForm ? '1px solid #daa520' : 'none', color: showForm ? '#daa520' : '#0f0f1a', borderRadius:50, padding:'10px 18px', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:6, fontSize:'0.9rem' }}>
              {showForm ? <><X size={16} /> Fechar</> : <><Plus size={16} /> Novo Pedido</>}
            </button>
          )}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[['all','Todos os Pedidos'],['answered','Oracoes Respondidas']].map(([val,label]) => (
            <button key={val} onClick={() => setTab(val)} style={{ flex:1, padding:'10px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.85rem', background: tab===val ? 'rgba(218,165,32,0.2)' : 'rgba(255,255,255,0.05)', color: tab===val ? '#daa520' : 'rgba(255,255,255,0.5)', borderBottom: tab===val ? '2px solid #daa520' : '2px solid transparent' }}>{label}</button>
          ))}
        </div>
      </div>

      {!user && (
        <Link to="/cadastro" style={{ textDecoration:'none', display:'block', margin:'0 16px 16px' }}>
          <div style={{ background:'rgba(218,165,32,0.1)', border:'1px solid rgba(218,165,32,0.4)', borderRadius:14, padding:'14px 16px', display:'flex', justifyContent:'space-between' }}>
            <span style={{ color:'#daa520', fontWeight:600 }}>Crie sua conta para participar!</span>
            <span style={{ color:'#daa520' }}>Cadastrar</span>
          </div>
        </Link>
      )}

      {showForm && (
        <div style={{ padding:'0 16px', marginBottom:20 }}>
          <form onSubmit={handleSubmit} style={{ background:'linear-gradient(135deg,#1a1a2e,#16213e)', borderRadius:20, padding:24, border:'1px solid rgba(218,165,32,0.2)' }}>
            <h3 style={{ color:'#daa520', margin:'0 0 20px' }}>Novo Pedido de Oracao</h3>
            <input className="pinput" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Titulo (opcional)" style={{ marginBottom:10 }} />
            <textarea className="pinput" rows={4} value={form.content} onChange={e => setForm({...form,content:e.target.value})} placeholder="Descreva seu pedido..." required style={{ resize:'none', marginBottom:12 }} />
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
              {Object.entries(CATEGORY_CONFIG).map(([val,cfg]) => (
                <button key={val} type="button" onClick={() => setForm({...form,category:val})} style={{ background: form.category===val ? cfg.color+'33' : 'rgba(255,255,255,0.05)', border: '1px solid '+(form.category===val ? cfg.color : '#333'), color: form.category===val ? cfg.color : 'rgba(255,255,255,0.5)', borderRadius:20, padding:'4px 12px', cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>{cfg.label}</button>
              ))}
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, cursor:'pointer' }}>
              <input type="checkbox" checked={form.is_urgent} onChange={e => setForm({...form,is_urgent:e.target.checked})} style={{ accentColor:'#e74c3c' }} />
              <span style={{ color:'#e74c3c', fontSize:'0.85rem' }}>Pedido urgente</span>
            </label>
            <button type="submit" style={{ width:'100%', background:'linear-gradient(135deg,#daa520,#f4d03f)', border:'none', borderRadius:12, padding:14, color:'#0f0f1a', fontWeight:800, cursor:'pointer', fontSize:'1rem' }}>Enviar Pedido de Oracao</button>
          </form>
        </div>
      )}

      <div style={{ padding:'0 16px', marginBottom:20 }}>
        <div style={{ background:'rgba(39,174,96,0.1)', border:'1px solid rgba(39,174,96,0.3)', borderRadius:16, padding:'16px 20px', textAlign:'center' }}>
          <p style={{ color:'#27ae60', fontWeight:600, margin:'0 0 6px' }}>O Poder da Oracao</p>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem', fontStyle:'italic', margin:0 }}>"A oracao feita por um justo pode muito em seus efeitos." — Tiago 5:16</p>
        </div>
      </div>

      {user && !isPastor && (
        <div style={{ padding:'0 16px', marginBottom:16 }}>
          <div style={{ background:'rgba(91,141,239,0.1)', border:'1px solid rgba(91,141,239,0.3)', borderRadius:12, padding:'10px 14px' }}>
            <p style={{ margin:0, fontSize:'0.82rem', color:'rgba(255,255,255,0.6)' }}>Seus pedidos sao privados. Somente voce e os pastores podem ver.</p>
          </div>
        </div>
      )}

      <div style={{ padding:'0 16px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.4)' }}>A carregar...</div>
        ) : prayers.length === 0 ? (
          <div style={{ background:'#1a1a2e', borderRadius:16, padding:'40px 20px', textAlign:'center', border:'1px solid #333' }}>
            <HandHeart size={48} style={{ color:'rgba(255,255,255,0.2)', marginBottom:12 }} />
            <p style={{ color:'rgba(255,255,255,0.4)', margin:0 }}>Nenhum pedido ainda.</p>
          </div>
        ) : prayers.map((prayer) => (
          <div key={prayer.id} style={{ marginBottom:12 }}>
            <PrayerCard prayer={prayer} onPray={handlePray} user={user || { id: 'visitor' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
