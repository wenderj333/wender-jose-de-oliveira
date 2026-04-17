import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSwitcher';

export default function Landing() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [online, setOnline] = useState(Math.floor(Math.random()*80)+100);
  const [prayer, setPrayer] = useState('');
  const [prayerSent, setPrayerSent] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setOnline(n => Math.max(80, n + Math.floor(Math.random()*5)-2)), 3000);
    return () => clearInterval(i);
  }, []);

  const sendPrayer = () => { if (prayer.trim()) setPrayerSent(true); };

  const benefits = [
    'Personas orando por ti en tiempo real',
    'Chat cristiano 24h',
    'Apoyo cuando mas lo necesitas',
    'Reflexiones que fortalecen tu fe',
    'Musica que conecta con Dios',
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9ff', fontFamily:"'Segoe UI',sans-serif" }}>
      <nav style={{ background:'white', padding:'12px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src='/logo-new.png' alt='Logo' style={{ height:36, width:36, borderRadius:8 }} />
          <span style={{ fontSize:20, fontWeight:800, color:'#6C3FA0' }}>Sigo com Fé</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <LanguageSelector />
          <button onClick={() => navigate('/login')} style={{ padding:'8px 18px', borderRadius:8, border:'1px solid #6C3FA0', background:'white', color:'#6C3FA0', fontWeight:600, cursor:'pointer' }}>{t('auth.login','Entrar')}</button>
          <button onClick={() => navigate('/register')} style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'#6C3FA0', color:'white', fontWeight:600, cursor:'pointer' }}>{t('landing.joinFree','Crear cuenta gratis')}</button>
        </div>
      </nav>
      <div style={{ background:'#e74c3c', padding:'10px 24px', textAlign:'center' }}>
        <span style={{ color:'white', fontSize:14, fontWeight:600 }}>+{online} {t('landing.praying','personas orando ahora mismo')}</span>
      </div>
      <div style={{ maxWidth:800, margin:'0 auto', padding:'70px 24px 50px', textAlign:'center' }}>
        <h1 style={{ fontSize:48, fontWeight:900, color:'#1a0a3e', lineHeight:1.15, margin:'0 0 20px' }}>
          {t('landing.title1','No camines solo en tu fe')}
        </h1>
        <p style={{ fontSize:20, color:'#555', lineHeight:1.7, margin:'0 0 32px', maxWidth:600, marginLeft:'auto', marginRight:'auto' }}>
          {t('landing.subtitle','Te has sentido solo? Aqui siempre hay alguien para ti.')}
        </p>
        <div style={{ background:'white', borderRadius:16, padding:24, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', maxWidth:500, margin:'0 auto 24px' }}>
          {!prayerSent ? (
            <div>
              <p style={{ fontWeight:700, color:'#6C3FA0', marginBottom:12 }}>{t('landing.prayerTitle','Escribe tu peticion de oracion')}</p>
              <textarea value={prayer} onChange={e => setPrayer(e.target.value)} placeholder={t('landing.prayerPlaceholder','Escribe tu peticion aqui...')} style={{ width:'100%', border:'2px solid #e0d0f0', borderRadius:10, padding:12, fontSize:14, resize:'none', height:80, outline:'none', boxSizing:'border-box' }}/>
              <button onClick={sendPrayer} style={{ width:'100%', marginTop:10, padding:'12px', borderRadius:10, border:'none', background:'#6C3FA0', color:'white', fontWeight:700, cursor:'pointer', fontSize:15 }}>{t('landing.sendPrayer','Enviar peticion')}</button>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'12px 0' }}>
              <p style={{ fontWeight:700, color:'#1a0a3e', fontSize:16, marginBottom:8 }}>{t('landing.prayerSent','Para ver respuestas, crea tu cuenta:')}</p>
              <button onClick={() => navigate('/register')} style={{ padding:'12px 28px', borderRadius:10, border:'none', background:'#27ae60', color:'white', fontWeight:700, cursor:'pointer', fontSize:15 }}>{t('landing.createAccount','Crear cuenta gratis')}</button>
            </div>
          )}
        </div>
        <button onClick={() => navigate('/register')} style={{ padding:'18px 40px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#6C3FA0,#4A2270)', color:'white', fontWeight:900, cursor:'pointer', fontSize:20, boxShadow:'0 6px 20px rgba(108,63,160,0.4)', display:'block', margin:'0 auto 12px' }}>
          {t('landing.cta1','Quiero entrar y no estar solo')}
        </button>
        <p style={{ fontSize:13, color:'#888' }}>{t('landing.free','Gratis')} - {t('landing.noCard','Sin tarjeta')} - {t('landing.instant','Acceso inmediato')}</p>
      </div>
      <div style={{ background:'white', padding:'50px 24px' }}>
        <h2 style={{ textAlign:'center', fontSize:28, fontWeight:800, color:'#1a0a3e', marginBottom:32 }}>{t('landing.benefitsTitle','Aqui no es solo una red social')}</h2>
        <div style={{ maxWidth:700, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
          {benefits.map((b,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:16, background:'#f8f9ff', borderRadius:12, padding:'16px 20px' }}>
              <span style={{ fontSize:16, fontWeight:600, color:'#1a0a3e' }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:'linear-gradient(135deg,#6C3FA0,#4A2270)', padding:'48px 24px', textAlign:'center' }}>
        <p style={{ color:'white', fontSize:22, fontWeight:700, marginBottom:20 }}>{t('landing.urgency','Ahora mismo hay personas esperando para orar contigo')}</p>
        <button onClick={() => navigate('/register')} style={{ padding:'16px 40px', borderRadius:12, border:'none', background:'#27ae60', color:'white', fontWeight:800, cursor:'pointer', fontSize:18 }}>{t('landing.joinNow','Unirme ahora')}</button>
      </div>
      <div style={{ background:'#1a0a3e', padding:'60px 24px', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:14, marginBottom:8 }}>{t('landing.notCasual','No llegaste aqui por casualidad')}</p>
        <h2 style={{ color:'white', fontSize:32, fontWeight:900, margin:'0 0 12px' }}>{t('landing.ctaFinalText','Dios puede usar este momento para cambiar algo en tu vida.')}</h2>
        <button onClick={() => navigate('/register')} style={{ padding:'18px 48px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#6C3FA0,#4A2270)', color:'white', fontWeight:900, cursor:'pointer', fontSize:20, marginTop:16 }}>{t('landing.ctaFinal','Crear cuenta gratis ahora')}</button>
      </div>
    </div>
  );
}