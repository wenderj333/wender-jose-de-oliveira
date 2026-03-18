import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSwitcher';

export default function Landing() {
  const { t } = useTranslation();
  const [animY, setAnimY] = useState(0);

  useEffect(() => {
    let frame;
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      setAnimY(Math.sin((ts - start) / 2000) * 7);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const trustBullets = [
    { icon: '🚫', text: t('landing.trust1') },
    { icon: '✝️', text: t('landing.trust2') },
    { icon: '🙏', text: t('landing.trust3') },
    { icon: '📖', text: t('landing.trust4') },
  ];

  const features = [
    { emoji: '🙏', title: t('landing.f1title'), desc: t('landing.f1desc'), color: '#6c47d4' },
    { emoji: '📖', title: t('landing.f2title'), desc: t('landing.f2desc'), color: '#4a80d4' },
    { emoji: '🔥', title: t('landing.f3title'), desc: t('landing.f3desc'), color: '#e65c00' },
    { emoji: '💬', title: t('landing.f4title'), desc: t('landing.f4desc'), color: '#0f9d58' },
    { emoji: '🎵', title: t('landing.f5title'), desc: t('landing.f5desc'), color: '#a07820' },
    { emoji: '👥', title: t('landing.f6title'), desc: t('landing.f6desc'), color: '#d4380d' },
  ];

  const testimonials = [
    { name: 'Maria S.', country: '🇧🇷', text: '"Esta plataforma mudou minha vida espiritual. Encontrei uma comunidade que me sustenta na fé!"', avatar: '🙏' },
    { name: 'Johann M.', country: '🇩🇪', text: '"Hier fand ich Geschwister, die täglich für mich beten. Gott sei Dank für diese Plattform!"', avatar: '✝️' },
    { name: 'Ana R.', country: '🇵🇹', text: '"O Chat Pastoral ajudou-me num momento muito difícil. Gratidão a Deus por esta ferramenta!"', avatar: '💛' },
  ];

  const stats = [
    { num: '12+', label: t('landing.memberCount') },
    { num: '7', label: t('landing.languagesCount') },
    { num: '∞', label: t('landing.prayersCount') },
    { num: '24/7', label: t('landing.communityCount') },
  ];

  return (
    <div style={{minHeight:'100vh',background:'#ffffff',fontFamily:"'Inter',system-ui,sans-serif",overflowX:'hidden'}}>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(255,255,255,0.96)',backdropFilter:'blur(10px)',borderBottom:'1px solid #e0e6f5',padding:'0 24px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 2px 12px rgba(74,128,212,0.07)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#3568b8,#4a80d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',boxShadow:'0 2px 8px rgba(74,128,212,0.3)'}}>📖</div>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.2rem',fontWeight:700,color:'#3568b8',letterSpacing:'0.02em'}}>Sigo com Fé</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <LanguageSelector />
          <Link to="/login" style={{padding:'7px 18px',borderRadius:9,background:'transparent',border:'1.5px solid #4a80d4',color:'#4a80d4',textDecoration:'none',fontWeight:600,fontSize:'0.88rem'}}>
            {t('landing.loginShort')}
          </Link>
          <Link to="/register" style={{padding:'7px 18px',borderRadius:9,background:'linear-gradient(135deg,#3568b8,#4a80d4)',color:'white',textDecoration:'none',fontWeight:600,fontSize:'0.88rem',boxShadow:'0 3px 10px rgba(74,128,212,0.3)'}}>
            {t('landing.joinNow')}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{paddingTop:100,paddingBottom:60,background:'linear-gradient(180deg,#f0f5ff 0%,#ffffff 100%)',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-60,left:-60,width:320,height:320,borderRadius:'50%',background:'radial-gradient(circle,rgba(74,128,212,0.07),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:40,right:-80,width:420,height:420,borderRadius:'50%',background:'radial-gradient(circle,rgba(160,120,32,0.06),transparent 70%)',pointerEvents:'none'}}/>

        {/* Floating logo */}
        <div style={{transform:`translateY(${animY}px)`,transition:'transform 0.1s',display:'inline-block',marginBottom:20}}>
          <div style={{width:84,height:84,borderRadius:'50%',background:'linear-gradient(135deg,#3568b8 0%,#4a80d4 55%,#6a9ade 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem',boxShadow:'0 12px 36px rgba(74,128,212,0.28)',margin:'0 auto'}}>📖</div>
        </div>

        <div style={{width:56,height:3,background:'linear-gradient(90deg,transparent,#a07820,transparent)',margin:'0 auto 16px',borderRadius:2}}/>

        {/* Strong headline */}
        <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'clamp(2rem,5.5vw,3.5rem)',fontWeight:700,color:'#1e2240',marginBottom:12,lineHeight:1.15,padding:'0 20px'}}>
          {t('landing.headline1')}<br/>
          <span style={{background:'linear-gradient(135deg,#3568b8,#4a80d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
            {t('landing.headline2')}
          </span>
        </h1>

        <p style={{fontSize:'clamp(0.95rem,2.2vw,1.1rem)',color:'#4a5568',maxWidth:500,margin:'0 auto 8px',lineHeight:1.75,padding:'0 24px'}}>
          {t('landing.subtitle')}
        </p>

        <p style={{fontSize:'0.85rem',color:'#a07820',fontStyle:'italic',marginBottom:28,fontWeight:500,padding:'0 24px'}}>
          {t('landing.verse')}
        </p>

        {/* Trust bullets */}
        <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',padding:'0 20px',marginBottom:30}}>
          {trustBullets.map(b => (
            <div key={b.text} style={{display:'flex',alignItems:'center',gap:6,background:'#f0f5ff',border:'1px solid #dde8fa',borderRadius:20,padding:'6px 14px',fontSize:'0.82rem',color:'#2d4a7a',fontWeight:500}}>
              <span>{b.icon}</span> {b.text}
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',padding:'0 20px',marginBottom:44}}>
          <Link to="/register" style={{padding:'14px 36px',borderRadius:12,background:'linear-gradient(135deg,#3568b8,#4a80d4)',color:'white',textDecoration:'none',fontWeight:700,fontSize:'1rem',boxShadow:'0 6px 22px rgba(74,128,212,0.38)',letterSpacing:'0.01em'}}>
            {t('landing.ctaJoin')}
          </Link>
          <Link to="/login" style={{padding:'14px 36px',borderRadius:12,background:'white',border:'2px solid #4a80d4',color:'#4a80d4',textDecoration:'none',fontWeight:700,fontSize:'1rem',boxShadow:'0 4px 12px rgba(74,128,212,0.1)'}}>
            {t('landing.haveAccount')}
          </Link>
        </div>

        {/* Stats */}
        <div style={{display:'flex',gap:28,justifyContent:'center',flexWrap:'wrap',padding:'0 20px'}}>
          {stats.map(s => (
            <div key={s.label} style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.9rem',fontWeight:700,color:'#3568b8',lineHeight:1}}>{s.num}</div>
              <div style={{fontSize:'0.72rem',color:'#7b83a6',textTransform:'uppercase',letterSpacing:'0.08em',marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* "WHY US" — the differentiator */}
      <section style={{padding:'56px 24px',background:'linear-gradient(135deg,#1e2240 0%,#2a3060 100%)',color:'white',textAlign:'center'}}>
        <div style={{maxWidth:680,margin:'0 auto'}}>
          <p style={{fontSize:'0.7rem',color:'#f0c040',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:8}}>PORQUÊ O SIGO COM FÉ?</p>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:700,marginBottom:16,lineHeight:1.3}}>
            {t('landing.whyTitle')}
          </h2>
          <p style={{color:'rgba(255,255,255,0.65)',fontSize:'0.95rem',lineHeight:1.75,marginBottom:32}}>
            {t('landing.whySubtitle')}
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,textAlign:'left'}}>
            {[
              { icon:'🚫', title:t('landing.why1title'), desc:t('landing.why1desc') },
              { icon:'🙏', title:t('landing.why2title'), desc:t('landing.why2desc') },
              { icon:'💬', title:t('landing.why3title'), desc:t('landing.why3desc') },
              { icon:'🌍', title:t('landing.why4title'), desc:t('landing.why4desc') },
            ].map(w => (
              <div key={w.title} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(240,192,64,0.2)',borderRadius:14,padding:18}}>
                <div style={{fontSize:'1.4rem',marginBottom:8}}>{w.icon}</div>
                <h3 style={{fontSize:'0.9rem',fontWeight:700,color:'#f0c040',marginBottom:6}}>{w.title}</h3>
                <p style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.6)',lineHeight:1.6}}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{padding:'68px 24px',background:'#ffffff'}}>
        <div style={{maxWidth:980,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:44}}>
            <p style={{fontSize:'0.72rem',color:'#a07820',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:8}}>{t('landing.featuresSection')}</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.7rem,4vw,2.6rem)',fontWeight:700,color:'#1e2240',lineHeight:1.25}}>
              {t('landing.featuresTitle')}
            </h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:16}}>
            {features.map(f => (
              <div key={f.title} style={{background:'#f8faff',borderRadius:16,padding:24,border:'1px solid #e0e6f5',cursor:'default',transition:'transform 0.2s,box-shadow 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(74,128,212,0.1)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                <div style={{width:48,height:48,borderRadius:12,background:`${f.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',marginBottom:12,border:`1px solid ${f.color}20`}}>
                  {f.emoji}
                </div>
                <h3 style={{fontSize:'0.95rem',fontWeight:700,color:'#1e2240',marginBottom:6}}>{f.title}</h3>
                <p style={{fontSize:'0.83rem',color:'#6b7280',lineHeight:1.65}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:'68px 24px',background:'linear-gradient(135deg,#f0f5ff 0%,#e8eeff 100%)'}}>
        <div style={{maxWidth:880,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <p style={{fontSize:'0.72rem',color:'#a07820',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:8}}>{t('landing.testimoniesSection')}</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.7rem,4vw,2.5rem)',fontWeight:700,color:'#1e2240'}}>
              {t('landing.testimoniesTitle')}
            </h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:16}}>
            {testimonials.map(t2 => (
              <div key={t2.name} style={{background:'white',borderRadius:16,padding:24,border:'1px solid #dde3f0',boxShadow:'0 4px 14px rgba(74,128,212,0.06)'}}>
                <div style={{fontSize:'1.6rem',marginBottom:10}}>{t2.avatar}</div>
                <p style={{fontSize:'0.875rem',color:'#374151',lineHeight:1.7,fontStyle:'italic',marginBottom:14}}>{t2.text}</p>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#3568b8,#4a80d4)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'0.78rem',fontWeight:700,flexShrink:0}}>
                    {t2.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{fontSize:'0.82rem',fontWeight:600,color:'#1e2240',margin:0}}>{t2.name} {t2.country}</p>
                    <p style={{fontSize:'0.7rem',color:'#7b83a6',margin:0}}>{t('landing.tagline')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{padding:'72px 24px',background:'linear-gradient(135deg,#3568b8 0%,#4a80d4 55%,#6a9ade 100%)',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,0.07)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-50,left:-30,width:240,height:240,borderRadius:'50%',background:'rgba(255,255,255,0.05)',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontSize:'2.5rem',marginBottom:12}}>✝️</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.8rem,4.5vw,2.8rem)',fontWeight:700,color:'white',marginBottom:12,lineHeight:1.25,padding:'0 20px'}}>
            {t('landing.ctaTitle')}
          </h2>
          <p style={{fontSize:'1rem',color:'rgba(255,255,255,0.8)',marginBottom:30,maxWidth:440,margin:'0 auto 30px',padding:'0 20px'}}>
            {t('landing.ctaSubtitle')}
          </p>
          {/* Strong CTA button */}
          <Link to="/register" style={{display:'inline-block',padding:'16px 52px',borderRadius:14,background:'white',color:'#3568b8',textDecoration:'none',fontWeight:700,fontSize:'1.08rem',boxShadow:'0 8px 24px rgba(0,0,0,0.2)',letterSpacing:'0.01em'}}>
            {t('landing.ctaButton')}
          </Link>
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.78rem',marginTop:14}}>
            {t('landing.ctaFree')}
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#1e2240',padding:'24px',textAlign:'center'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:6}}>
          <span style={{fontSize:'1.1rem'}}>📖</span>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1rem',fontWeight:700,color:'white'}}>Sigo com Fé</span>
        </div>
        <p style={{color:'rgba(255,255,255,0.3)',fontSize:'0.72rem'}}>
          {t('landing.tagline')} · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
