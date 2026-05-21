import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PrayerCard from '../components/PrayerCard';
import { useAuth } from '../context/AuthContext';
import { HandHeart, Trophy, Plus, X, Camera, Image } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CATEGORY_CONFIG = {
  health:       { label: 'Saude',     color: '#e74c3c', icon: '❤️' },
  work_finance: { label: 'Trabalho',  color: '#f39c12', icon: '💼' },
  family:       { label: 'Familia',   color: '#3498db', icon: '👨‍👩‍👧' },
  studies:      { label: 'Estudos',   color: '#9b59b6', icon: '📚' },
  housing:      { label: 'Moradia',   color: '#1abc9c', icon: '🏠' },
  emotional:    { label: 'Emocional', color: '#5b8def', icon: '💜' },
  decisions:    { label: 'Decisoes',  color: '#e67e22', icon: '🤔' },
  other:        { label: 'Outro',     color: '#daa520', icon: '🙏' },
};

export default function PrayerFeed() {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [prayers, setPrayers] = useState([]);
  const [tab, setTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'other', is_urgent: false });
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoWall, setPhotoWall] = useState([]);
  const fileRef = useRef(null);
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

  // Carregar fotos do localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('prayer_photos') || '[]');
    setPhotoWall(saved);
  }, []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    // Guardar foto localmente se houver
    if (photoPreview) {
      const saved = JSON.parse(localStorage.getItem('prayer_photos') || '[]');
      const newPhoto = { id: Date.now(), photo: photoPreview, author: user?.full_name || 'Anonimo', date: new Date().toLocaleDateString(), prayers: 0 };
      saved.unshift(newPhoto);
      localStorage.setItem('prayer_photos', JSON.stringify(saved.slice(0, 20)));
      setPhotoWall(saved.slice(0, 20));
    }
    await fetch(API_BASE+'/api/prayers', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify(form) });
    setForm({ title: '', content: '', category: 'other', is_urgent: false });
    setPhotoFile(null); setPhotoPreview(null);
    setShowForm(false);
    fetchPrayers();
  };

  const handlePray = async (prayerId) => {
    await fetch(API_BASE+'/api/prayers/'+prayerId+'/pray', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify({ message: '' }) });
    fetchPrayers();
  };

  const prayForPhoto = (photoId) => {
    const saved = JSON.parse(localStorage.getItem('prayer_photos') || '[]');
    const updated = saved.map(p => p.id === photoId ? {...p, prayers: (p.prayers||0)+1} : p);
    localStorage.setItem('prayer_photos', JSON.stringify(updated));
    setPhotoWall(updated);
  };

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'0 0 80px', fontFamily:"'Segoe UI',sans-serif" }}>
      <style>{.pinput{width:100%;background:#f8f9ff;border:2px solid #e8e0f5;border-radius:12px;padding:12px 16px;color:#1a0a3e;font-size:.9rem;box-sizing:border-box;outline:none;transition:border 0.2s}.pinput:focus{border-color:#6C3FA0}}</style>

      {/* HERO */}
      <div style={{ background:'linear-gradient(135deg,#6C3FA0,#4A2270)', padding:'32px 24px 24px', borderRadius:'0 0 28px 28px', marginBottom:24, color:'white' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <h1 style={{ margin:0, fontSize:'1.6rem', fontWeight:900, display:'flex', alignItems:'center', gap:10 }}>
              🙏 {t('prayerFeed.prayerRequests','Pedidos de Oração')}
            </h1>
            <p style={{ margin:'6px 0 0', opacity:0.8, fontSize:'0.9rem' }}>{t('prayers.verse','"A oração feita por um justo pode muito" — Tiago 5:16')}</p>
          </div>
          {user && (
            <button onClick={() => setShowForm(!showForm)} style={{ background: showForm?'rgba(255,255,255,0.2)':'white', border:'none', color: showForm?'white':'#6C3FA0', borderRadius:50, padding:'10px 18px', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:6, fontSize:'0.9rem', flexShrink:0 }}>
              {showForm ? <><X size={16}/> Fechar</> : <><Plus size={16}/> {t('prayerFeed.newRequest','Novo Pedido')}</>}
            </button>
          )}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[['all',t('prayerFeed.allRequests','Todos')],['photos',t('prayerFeed.photoWall','Mural de Fotos')],['answered',t('prayerFeed.answeredPrayers','Respondidas')]].map(([val,label]) => (
            <button key={val} onClick={() => setTab(val)} style={{ flex:1, padding:'8px 4px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.78rem', background: tab===val?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.1)', color:'white', transition:'all 0.2s' }}>{label}</button>
          ))}
        </div>
      </div>

      {!user && (
        <Link to="/cadastro" style={{ textDecoration:'none', display:'block', margin:'0 16px 20px' }}>
          <div style={{ background:'linear-gradient(135deg,#f8f0ff,#ede0ff)', border:'2px solid #6C3FA0', borderRadius:16, padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div><p style={{ color:'#6C3FA0', fontWeight:700, margin:0 }}>Crie a sua conta para participar!</p><p style={{ color:'#888', fontSize:'0.8rem', margin:'4px 0 0' }}>Envie pedidos e ore pelos irmãos</p></div>
            <span style={{ color:'white', background:'#6C3FA0', padding:'8px 16px', borderRadius:20, fontWeight:700, fontSize:'0.85rem' }}>Entrar</span>
          </div>
        </Link>
      )}

      {/* FORMULARIO */}
      {showForm && (
        <div style={{ padding:'0 16px', marginBottom:24 }}>
          <form onSubmit={handleSubmit} style={{ background:'white', borderRadius:20, padding:24, boxShadow:'0 4px 20px rgba(108,63,160,0.1)', border:'1px solid #e8e0f5' }}>
            <h3 style={{ color:'#6C3FA0', margin:'0 0 20px', fontSize:'1.1rem' }}>✨ {t('prayerFeed.newPrayerRequest','Novo Pedido de Oração')}</h3>
            <input className="pinput" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder={t('prayerFeed.titlePlaceholder','Título (opcional)')} style={{ marginBottom:12 }} />
            <textarea className="pinput" rows={4} value={form.content} onChange={e => setForm({...form,content:e.target.value})} placeholder={t('prayerFeed.requestPlaceholder','Descreve o teu pedido de oração...')} required style={{ resize:'none', marginBottom:12 }} />
            
            {/* FOTO OPCIONAL */}
            <div style={{ marginBottom:16 }}>
              <p style={{ color:'#6C3FA0', fontWeight:700, fontSize:'0.85rem', margin:'0 0 8px' }}>📸 {t('prayerFeed.photoOptional','Foto (opcional)')}</p>
              <p style={{ color:'#888', fontSize:'0.78rem', margin:'0 0 10px' }}>{t('prayerFeed.photoDesc','Só tu e os pastores veem a foto — a comunidade ora sem ver detalhes')}</p>
              {photoPreview ? (
                <div style={{ position:'relative', display:'inline-block' }}>
                  <img src={photoPreview} style={{ width:120, height:120, borderRadius:12, objectFit:'cover', border:'2px solid #6C3FA0' }} />
                  <button type="button" onClick={()=>{setPhotoFile(null);setPhotoPreview(null);}} style={{ position:'absolute', top:-8, right:-8, background:'#e74c3c', border:'none', borderRadius:'50%', width:24, height:24, color:'white', cursor:'pointer', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                </div>
              ) : (
                <button type="button" onClick={()=>fileRef.current?.click()} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', borderRadius:12, border:'2px dashed #c0a0e0', background:'#f8f0ff', color:'#6C3FA0', cursor:'pointer', fontWeight:600, fontSize:'0.85rem' }}>
                  <Camera size={16}/> {t('prayerFeed.addPhoto','Adicionar foto')}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
              {Object.entries(CATEGORY_CONFIG).map(([val,cfg]) => (
                <button key={val} type="button" onClick={() => setForm({...form,category:val})} style={{ background: form.category===val ? cfg.color+'22' : '#f8f9ff', border: '1.5px solid '+(form.category===val ? cfg.color : '#e0e0e0'), color: form.category===val ? cfg.color : '#888', borderRadius:20, padding:'5px 12px', cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>{cfg.icon} {cfg.label}</button>
              ))}
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, cursor:'pointer' }}>
              <input type="checkbox" checked={form.is_urgent} onChange={e => setForm({...form,is_urgent:e.target.checked})} style={{ accentColor:'#e74c3c' }} />
              <span style={{ color:'#e74c3c', fontSize:'0.85rem', fontWeight:600 }}>🚨 {t('prayerFeed.urgentRequest','Pedido urgente')}</span>
            </label>
            <button type="submit" style={{ width:'100%', background:'linear-gradient(135deg,#6C3FA0,#4A2270)', border:'none', borderRadius:12, padding:14, color:'white', fontWeight:800, cursor:'pointer', fontSize:'1rem' }}>{t('prayerFeed.submitBtn','Enviar Pedido 🙏')}</button>
          </form>
        </div>
      )}

      {/* MURAL DE FOTOS */}
      {tab === 'photos' && (
        <div style={{ padding:'0 16px' }}>
          <div style={{ background:'linear-gradient(135deg,#f8f0ff,#ede0ff)', borderRadius:16, padding:'16px 20px', marginBottom:20, textAlign:'center' }}>
            <p style={{ color:'#6C3FA0', fontWeight:800, margin:'0 0 4px', fontSize:'1rem' }}>📸 {t('prayerFeed.prayerWall','Mural de Oração')}</p>
            <p style={{ color:'#888', fontSize:'0.82rem', margin:0 }}>{t('prayerFeed.prayerWallDesc','Ora pelas fotos dos teus irmãos — só quem postou sabe quem é')}</p>
          </div>
          {photoWall.length === 0 ? (
            <div style={{ textAlign:'center', padding:40, color:'#aaa' }}>
              <Image size={48} style={{ marginBottom:12, opacity:0.3 }} />
              <p>Ainda não há fotos. Sê o primeiro a partilhar!</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12 }}>
              {photoWall.map(p => (
                <div key={p.id} style={{ borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.1)', background:'white' }}>
                  <img src={p.photo} style={{ width:'100%', height:140, objectFit:'cover' }} />
                  <div style={{ padding:'10px 12px' }}>
                    <p style={{ margin:'0 0 6px', fontSize:'0.75rem', color:'#888' }}>🙏 {p.prayers||0} orações</p>
                    <button onClick={()=>prayForPhoto(p.id)} style={{ width:'100%', padding:'6px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#6C3FA0,#4A2270)', color:'white', cursor:'pointer', fontWeight:700, fontSize:'0.75rem' }}>{t('prayerFeed.prayForPhoto','Orar 🙏')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LISTA DE PEDIDOS */}
      {tab !== 'photos' && (
        <div style={{ padding:'0 16px' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:40, color:'#aaa' }}>A carregar...</div>
          ) : prayers.length === 0 ? (
            <div style={{ background:'#f8f9ff', borderRadius:16, padding:'40px 20px', textAlign:'center', border:'1px solid #e8e0f5' }}>
              <HandHeart size={48} style={{ color:'#c0a0e0', marginBottom:12 }} />
              <p style={{ color:'#aaa', margin:0 }}>{t('prayerFeed.noRequests','Nenhum pedido ainda.')}</p>
            </div>
          ) : prayers.map((prayer) => (
            <div key={prayer.id} style={{ marginBottom:12 }}>
              <PrayerCard prayer={prayer} onPray={handlePray} user={user || { id: 'visitor' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
