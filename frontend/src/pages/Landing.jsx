import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSwitcher';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0b1120 0%,#0d1b38 50%,#0b1120 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px',textAlign:'center',position:'relative',overflow:'hidden'}}>
      
      {/* Background glow */}
      <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(30,80,200,0.15) 0%,transparent 70%)',pointerEvents:'none'}}/>

      {/* Language selector */}
      <div style={{position:'absolute',top:20,right:20}}>
        <LanguageSelector />
      </div>

      {/* Logo */}
      <div style={{marginBottom:30}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#fff 0%,#c9a84c 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem',margin:'0 auto 16px',boxShadow:'0 8px 32px rgba(30,80,200,0.4)'}}>📖</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(2rem,6vw,3.5rem)',fontWeight:700,color:'white',marginBottom:8,lineHeight:1.1}}>
          Sigo com Fé
        </h1>
        <p style={{fontSize:'clamp(1rem,3vw,1.3rem)',color:'rgba(255,255,255,0.6)',maxWidth:480,margin:'0 auto',lineHeight:1.6}}>
          {t('landing.subtitle', 'A rede social cristã para crescer na fé, conectar com irmãos e viver o evangelho.')}
        </p>
      </div>

      {/* Features */}
      <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:12,marginBottom:40,maxWidth:560}}>
        {['🙏 Pedidos de Oração','📖 IA Bíblica','🔥 Consagração','💬 Chat Pastoral','🎵 Música Cristã','👥 Comunidade'].map(f => (
          <span key={f} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:20,padding:'6px 14px',fontSize:'0.85rem',color:'rgba(255,255,255,0.8)'}}>
            {f}
          </span>
        ))}
      </div>

      {/* CTA Buttons */}
      <div style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center'}}>
        <Link to="/register" style={{padding:'14px 32px',borderRadius:12,background:'linear-gradient(135deg,#1e50c8,#1440a8)',color:'white',textDecoration:'none',fontWeight:600,fontSize:'1rem',boxShadow:'0 4px 20px rgba(30,80,200,0.5)',transition:'transform 0.2s'}}>
          {t('landing.register', 'Criar conta gratuita')}
        </Link>
        <Link to="/login" style={{padding:'14px 32px',borderRadius:12,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.2)',color:'white',textDecoration:'none',fontWeight:600,fontSize:'1rem'}}>
          {t('landing.login', 'Entrar')}
        </Link>
      </div>

      {/* Quote */}
      <p style={{marginTop:50,fontFamily:"'Cormorant Garamond',serif",fontSize:'1rem',color:'rgba(255,255,255,0.35)',fontStyle:'italic',maxWidth:400}}>
        "Onde dois ou três estiverem reunidos em meu nome, ali estou no meio deles." — Mt 18:20
      </p>
    </div>
  );
}
