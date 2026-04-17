import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSwitcher';

export default function Landing() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [online, setOnline] = React.useState(Math.floor(Math.random()*80)+100);

  React.useEffect(() => {
    const i = setInterval(() => setOnline(n => Math.max(80, n + Math.floor(Math.random()*5)-2)), 3000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9ff', fontFamily:"'Segoe UI',sans-serif" }}>
      <nav style={{ background:'white', padding:'12px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src='/logo-new.png' alt='Logo' style={{ height:36, width:36, borderRadius:8 }} />
          <span style={{ fontSize:20, fontWeight:800, color:'#6C3FA0' }}>Sigo com Fé</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <LanguageSelector />
          <span style={{ fontSize:13, color:'#27ae60', fontWeight:600 }}>🟢 {online} {t('landing.online','online')}</span>
          <button onClick={() => navigate('/login')} style={{ padding:'8px 18px', borderRadius:8, border:'1px solid #6C3FA0', background:'white', color:'#6C3FA0', fontWeight:600, cursor:'pointer', fontSize:14 }}>{t('auth.login','Entrar')}</button>
          <button onClick={() => navigate('/register')} style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'#6C3FA0', color:'white', fontWeight:600, cursor:'pointer', fontSize:14 }}>{t('landing.joinFree','Unirme gratis')}</button>
        </div>
      </nav>
      <div style={{ background:'#e74c3c', padding:'8px 24px', textAlign:'center' }}>
        <span style={{ color:'white', fontSize:14, fontWeight:600 }}>🔴 {t('landing.urgent','Comunidad activa ahora')} — {online} {t('landing.praying','personas orando')}</span>
      </div>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 24px 40px' }}>
        <h1 style={{ fontSize:44, fontWeight:900, color:'#1a0a3e', textAlign:'center', marginBottom:16 }}>
          🙏 {t('landing.title1','No camines solo en tu fe')}
        </h1>
        <p style={{ fontSize:18, color:'#444', lineHeight:1.7, textAlign:'center', maxWidth:700, margin:'0 auto 24px' }}>
          {t('landing.subtitle','Conecta con cristianos que oran contigo cada dia. Ora, comparte, recibe apoyo y crece espiritualmente — 24h en vivo.')}
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:16 }}>
          <button onClick={() => navigate('/register')} style={{ padding:'16px 36px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#6C3FA0,#4A2270)', color:'white', fontWeight:800, cursor:'pointer', fontSize:18 }}>{t('landing.cta1','Entrar ahora y comenzar')}</button>
          <button onClick={() => navigate('/login')} style={{ padding:'16px 36px', borderRadius:12, border:'2px solid #6C3FA0', background:'white', color:'#6C3FA0', fontWeight:700, cursor:'pointer', fontSize:16 }}>{t('auth.login','Entrar')}</button>
        </div>
        <div style={{ display:'flex', gap:16, fontSize:13, color:'#666', justifyContent:'center', marginBottom:40 }}>
          <span>✔ {t('landing.free','Gratis para siempre')}</span>
          <span>✔ {t('landing.noCard','Sin tarjeta')}</span>
          <span>✔ {t('landing.instant','Acceso inmediato')}</span>
        </div>
      </div>
      <div style={{ background:'linear-gradient(135deg,#1a0a3e,#6C3FA0)', padding:'60px 24px', textAlign:'center' }}>
        <h2 style={{ color:'white', fontSize:34, fontWeight:900, margin:'0 0 8px' }}>{t('landing.ctaTitle','Empieza gratis. Sin compromiso.')}</h2>
        <p style={{ color:'rgba(255,255,255,0.8)', fontSize:16, margin:'0 0 32px' }}>{t('landing.ctaSubtitle','Juntate a miles de cristianos')}</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/register')} style={{ padding:'16px 36px', borderRadius:12, border:'none', background:'#27ae60', color:'white', fontWeight:700, cursor:'pointer', fontSize:16 }}>{t('landing.createAccount','Criar conta gratis')}</button>
          <button onClick={loginWithGoogle} style={{ padding:'16px 36px', borderRadius:12, border:'none', background:'white', color:'#333', fontWeight:700, cursor:'pointer', fontSize:16 }}>G {t('landing.google','Continuar com Google')}</button>
          <button onClick={() => navigate('/comunidade-ao-vivo')} style={{ padding:'16px 36px', borderRadius:12, border:'2px solid rgba(255,255,255,0.5)', background:'transparent', color:'white', fontWeight:600, cursor:'pointer', fontSize:15 }}>👀 {t('landing.guest','Entrar como visitante')}</button>
        </div>
      </div>
    </div>
  );
}