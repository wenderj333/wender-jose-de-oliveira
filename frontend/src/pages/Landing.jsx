import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSwitcher';

const FEATURES = [
  { emoji: '🙏', title: 'Pedidos de Oração', desc: 'Partilhe e receba oração da comunidade. Nunca ore sozinho.', color: '#6c47d4' },
  { emoji: '📖', title: 'IA Bíblica', desc: 'Tire dúvidas sobre a Bíblia com inteligência artificial cristã.', color: '#1a73e8' },
  { emoji: '🔥', title: 'Consagração & Jejum', desc: 'Comprometa-se com Deus. Registos de jejum e oração em comunidade.', color: '#e65c00' },
  { emoji: '💬', title: 'Chat Pastoral', desc: 'Fale diretamente com um pastor. Aconselhamento em tempo real.', color: '#0f9d58' },
  { emoji: '🎵', title: 'Música Cristã', desc: 'Biblioteca de louvor em vários idiomas. Adore onde estiver.', color: '#b8860b' },
  { emoji: '👥', title: 'Comunidade Global', desc: 'Conecte com cristãos de Brasil, Europa, África e mundo todo.', color: '#d4380d' },
];

const TESTIMONIALS = [
  { name: 'Maria S.', country: '🇧🇷', text: '"Esta plataforma mudou minha vida espiritual. Encontrei uma comunidade que me sustenta na fé!"', avatar: '🙏' },
  { name: 'João M.', country: '🇩🇪', text: '"Viver no exterior era difícil. Aqui encontrei irmãos que oram comigo todos os dias."', avatar: '✝️' },
  { name: 'Ana R.', country: '🇵🇹', text: '"O Chat Pastoral me ajudou num momento muito difícil. Gratidão a Deus por esta ferramenta!"', avatar: '💛' },
];

const STATS = [
  { num: '12+', label: 'Membros ativos' },
  { num: '7', label: 'Idiomas disponíveis' },
  { num: '∞', label: 'Orações enviadas' },
  { num: '24/7', label: 'Comunidade online' },
];

export default function Landing() {
  const { t } = useTranslation();
  const [animY, setAnimY] = useState(0);

  useEffect(() => {
    let frame;
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      setAnimY(Math.sin((ts - start) / 2000) * 8);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div style={{minHeight:'100vh',background:'#ffffff',fontFamily:"'Inter',system-ui,sans-serif",overflowX:'hidden'}}>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(10px)',borderBottom:'1px solid #e8f0fe',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 2px 12px rgba(26,115,232,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#1557b0,#1a73e8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',boxShadow:'0 2px 8px rgba(26,115,232,0.3)'}}>📖</div>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'1.2rem',fontWeight:700,color:'#1557b0',letterSpacing:'0.02em'}}>Sigo com Fé</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <LanguageSelector />
          <Link to="/login" style={{padding:'7px 18px',borderRadius:9,background:'transparent',border:'1.5px solid #1a73e8',color:'#1a73e8',textDecoration:'none',fontWeight:600,fontSize:'0.88rem',transition:'all 0.2s'}}>
            Entrar
          </Link>
          <Link to="/register" style={{padding:'7px 18px',borderRadius:9,background:'linear-gradient(135deg,#1557b0,#1a73e8)',color:'white',textDecoration:'none',fontWeight:600,fontSize:'0.88rem',boxShadow:'0 3px 10px rgba(26,115,232,0.35)'}}>
            Registar grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{paddingTop:100,paddingBottom:80,background:'linear-gradient(180deg,#f0f4ff 0%,#ffffff 100%)',textAlign:'center',position:'relative',overflow:'hidden'}}>

        {/* decorative circles */}
        <div style={{position:'absolute',top:-60,left:-60,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(26,115,232,0.08),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:40,right:-80,width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(184,134,11,0.07),transparent 70%)',pointerEvents:'none'}}/>

        {/* Logo floating */}
        <div style={{transform:`translateY(${animY}px)`,transition:'transform 0.1s',display:'inline-block',marginBottom:28}}>
          <div style={{width:90,height:90,borderRadius:'50%',background:'linear-gradient(135deg,#1557b0 0%,#1a73e8 50%,#42a5f5 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.8rem',boxShadow:'0 12px 40px rgba(26,115,232,0.35)',margin:'0 auto'}}>
            📖
          </div>
        </div>

        {/* Gold line */}
        <div style={{width:60,height:3,background:'linear-gradient(90deg,transparent,#b8860b,transparent)',margin:'0 auto 20px',borderRadius:2}}/>

        <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:'clamp(2.4rem,6vw,4rem)',fontWeight:700,color:'#1a1a2e',marginBottom:16,lineHeight:1.15,padding:'0 20px'}}>
          A rede social<br/>
          <span style={{background:'linear-gradient(135deg,#1557b0,#1a73e8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>cristã da sua fé</span>
        </h1>

        <p style={{fontSize:'clamp(1rem,2.5vw,1.25rem)',color:'#4a5568',maxWidth:520,margin:'0 auto 14px',lineHeight:1.7,padding:'0 24px'}}>
          Cresça espiritualmente, ore com irmãos do mundo inteiro, acesse a Bíblia com IA, e viva o evangelho — tudo num só lugar.
        </p>

        <p style={{fontSize:'0.9rem',color:'#b8860b',fontStyle:'italic',marginBottom:36,fontWeight:500}}>
          "Onde dois ou três estiverem reunidos em meu nome, ali estou no meio deles." — Mt 18:20
        </p>

        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',padding:'0 20px',marginBottom:50}}>
          <Link to="/register" style={{padding:'14px 36px',borderRadius:12,background:'linear-gradient(135deg,#1557b0,#1a73e8)',color:'white',textDecoration:'none',fontWeight:700,fontSize:'1.05rem',boxShadow:'0 6px 24px rgba(26,115,232,0.4)',letterSpacing:'0.02em'}}>
            ✨ Criar conta gratuita
          </Link>
          <Link to="/login" style={{padding:'14px 36px',borderRadius:12,background:'white',border:'2px solid #1a73e8',color:'#1a73e8',textDecoration:'none',fontWeight:700,fontSize:'1.05rem',boxShadow:'0 4px 12px rgba(26,115,232,0.1)'}}>
            Já tenho conta →
          </Link>
        </div>

        {/* Social proof */}
        <div style={{display:'flex',gap:32,justifyContent:'center',flexWrap:'wrap',padding:'0 20px'}}>
          {STATS.map(s => (
            <div key={s.label} style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2rem',fontWeight:700,color:'#1557b0',lineHeight:1}}>{s.num}</div>
              <div style={{fontSize:'0.75rem',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{padding:'80px 24px',background:'#ffffff'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:52}}>
            <p style={{fontSize:'0.78rem',color:'#b8860b',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8}}>FUNCIONALIDADES</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.8rem,4vw,2.8rem)',fontWeight:700,color:'#1a1a2e',lineHeight:1.2}}>
              Tudo o que precisa para<br/>crescer na fé
            </h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
            {FEATURES.map(f => (
              <div key={f.title} style={{background:'#f8faff',borderRadius:16,padding:28,border:'1px solid #e8f0fe',transition:'transform 0.2s,box-shadow 0.2s',cursor:'default'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(26,115,232,0.12)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                <div style={{width:52,height:52,borderRadius:14,background:`${f.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.7rem',marginBottom:16,border:`1px solid ${f.color}25`}}>
                  {f.emoji}
                </div>
                <h3 style={{fontSize:'1.05rem',fontWeight:700,color:'#1a1a2e',marginBottom:8}}>{f.title}</h3>
                <p style={{fontSize:'0.875rem',color:'#6b7280',lineHeight:1.6}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:'80px 24px',background:'linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 100%)'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <p style={{fontSize:'0.78rem',color:'#b8860b',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8}}>TESTEMUNHOS</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.8rem,4vw,2.6rem)',fontWeight:700,color:'#1a1a2e'}}>
              O que dizem os nossos irmãos
            </h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20}}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{background:'white',borderRadius:16,padding:28,border:'1px solid #dde3f0',boxShadow:'0 4px 16px rgba(26,115,232,0.06)'}}>
                <div style={{fontSize:'1.8rem',marginBottom:12}}>{t.avatar}</div>
                <p style={{fontSize:'0.9rem',color:'#374151',lineHeight:1.7,fontStyle:'italic',marginBottom:16}}>{t.text}</p>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#1557b0,#1a73e8)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'0.8rem',fontWeight:700}}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{fontSize:'0.85rem',fontWeight:600,color:'#1a1a2e',margin:0}}>{t.name} {t.country}</p>
                    <p style={{fontSize:'0.72rem',color:'#6b7280',margin:0}}>Membro da comunidade</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{padding:'80px 24px',background:'linear-gradient(135deg,#1557b0 0%,#1a73e8 50%,#2196f3 100%)',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,0.07)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-60,left:-30,width:250,height:250,borderRadius:'50%',background:'rgba(255,255,255,0.05)',pointerEvents:'none'}}/>

        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontSize:'3rem',marginBottom:16}}>✝️</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(2rem,5vw,3rem)',fontWeight:700,color:'white',marginBottom:16,lineHeight:1.2}}>
            Junte-se à comunidade cristã<br/>que cresce no amor de Deus
          </h2>
          <p style={{fontSize:'1.05rem',color:'rgba(255,255,255,0.85)',marginBottom:36,maxWidth:480,margin:'0 auto 36px'}}>
            Registe-se hoje. É grátis. É cristão. É para você.
          </p>
          <Link to="/register" style={{display:'inline-block',padding:'16px 48px',borderRadius:14,background:'white',color:'#1557b0',textDecoration:'none',fontWeight:700,fontSize:'1.1rem',boxShadow:'0 8px 28px rgba(0,0,0,0.2)',letterSpacing:'0.02em'}}>
            ✨ Criar minha conta grátis
          </Link>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:'0.82rem',marginTop:16}}>
            Sem cartão. Sem mensalidade. 100% gratuito.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#1a1a2e',padding:'28px 24px',textAlign:'center'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10}}>
          <span style={{fontSize:'1.3rem'}}>📖</span>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.1rem',fontWeight:700,color:'white'}}>Sigo com Fé</span>
        </div>
        <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.78rem'}}>
          A rede social cristã · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
