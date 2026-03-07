import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, BookOpen, Heart, ChevronRight } from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div style={{minHeight:'100vh',background:'#0A1128',color:'white',fontFamily:"'Jost',sans-serif"}}>
      
      {/* Navbar */}
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 40px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,fontSize:'1.5rem',fontWeight:700,fontFamily:"'Cormorant Garamond',serif"}}>
          <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#fff,#D4AF37)',display:'flex',alignItems:'center',justifyContent:'center',color:'#1A1A1A',fontSize:'1.2rem'}}>📖</div>
          Sigo com Fé
        </div>
        <div style={{display:'flex',gap:20}}>
          <Link to="/login" style={{textDecoration:'none',color:'white',fontWeight:500,padding:'10px 20px'}}>{t('nav.login', 'Entrar')}</Link>
          <Link to="/register" style={{textDecoration:'none',background:'linear-gradient(135deg,#D4AF37,#F3E5AB)',color:'#1A1A1A',fontWeight:700,padding:'10px 24px',borderRadius:30,boxShadow:'0 4px 14px rgba(212,175,55,0.3)'}}>
            {t('login.signUp', 'Começar Agora')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header style={{textAlign:'center',padding:'80px 20px',maxWidth:800,margin:'0 auto'}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'3.5rem',fontWeight:700,marginBottom:20,lineHeight:1.1}}>
          Conecte-se com sua fé.<br/>
          <span style={{background:'linear-gradient(to right,#D4AF37,#F3E5AB)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Onde você estiver.</span>
        </h1>
        <p style={{fontSize:'1.2rem',color:'rgba(255,255,255,0.7)',marginBottom:40,lineHeight:1.6}}>
          Uma rede social cristã completa para oração, comunhão e crescimento espiritual. Junte-se a milhares de fiéis ao redor do mundo.
        </p>
        <div style={{display:'flex',gap:16,justifyContent:'center'}}>
          <Link to="/register" style={{
            textDecoration:'none',background:'linear-gradient(135deg,#3B82F6,#1E3A8A)',color:'white',fontWeight:700,padding:'16px 40px',borderRadius:30,fontSize:'1.2rem',boxShadow:'0 8px 25px rgba(59,130,246,0.4)',display:'flex',alignItems:'center',gap:10,animation:'pulse 2s infinite'
          }}>
            {t('landing.createAccount', 'Criar Conta Gratuita')} <ChevronRight size={24}/>
          </Link>
          <style>{`@keyframes pulse { 0% { box-shadow: 0 8px 25px rgba(59,130,246,0.4); } 50% { box-shadow: 0 8px 35px rgba(59,130,246,0.6); } 100% { box-shadow: 0 8px 25px rgba(59,130,246,0.4); } }`}</style>
        </div>
      </header>

      {/* Features */}
      <section style={{maxWidth:1100,margin:'0 auto',padding:'60px 20px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:30}}>
        <div style={{background:'rgba(255,255,255,0.05)',padding:30,borderRadius:20,border:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{width:50,height:50,borderRadius:14,background:'linear-gradient(135deg,#3B82F6,#1E3A8A)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}><Users color="white"/></div>
          <h3 style={{fontSize:'1.3rem',fontWeight:600,marginBottom:10}}>{t('landing.globalCommunityTitle', 'Comunidade Cristã Global')}</h3>
          <p style={{color:'rgba(255,255,255,0.6)',lineHeight:1.5}}>{t('landing.globalCommunityDesc', 'Conecte-se com irmãos e irmãs de fé ao redor do mundo.')}</p>
        </div>
        <div style={{background:'rgba(255,255,255,0.05)',padding:30,borderRadius:20,border:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{width:50,height:50,borderRadius:14,background:'linear-gradient(135deg,#D4AF37,#F3E5AB)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}><BookOpen color="#1A1A1A"/></div>
          <h3 style={{fontSize:'1.3rem',fontWeight:600,marginBottom:10}}>{t('landing.bibleAITitle', 'Bíblia Inteligente')}</h3>
          <p style={{color:'rgba(255,255,255,0.6)',lineHeight:1.5}}>{t('landing.bibleAIDesc', 'Tire dúvidas bíblicas e aprofunde seu estudo.')}</p>
        </div>
        <div style={{background:'rgba(255,255,255,0.05)',padding:30,borderRadius:20,border:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{width:50,height:50,borderRadius:14,background:'linear-gradient(135deg,#3B82F6,#1E3A8A)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}><Heart color="white"/></div>
          <h3 style={{fontSize:'1.3rem',fontWeight:600,marginBottom:10}}>{t('landing.prayerRequestsTitle', 'Pedidos de Oração')}</h3>
          <p style={{color:'rgba(255,255,255,0.6)',lineHeight:1.5}}>{t('landing.prayerRequestsDesc', 'Compartilhe suas necessidades e receba apoio espiritual.')}</p>
        </div>
      </section>

      {/* Agora na Rede - NEW SECTION */}
      <section style={{maxWidth:1100,margin:'0 auto',padding:'60px 20px',background:'rgba(255,255,255,0.02)',borderRadius:20,border:'1px solid rgba(255,255,255,0.08)',marginBottom:40}}>
        <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:700,marginBottom:30,background:'linear-gradient(to right,#D4AF37,#F3E5AB)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>🔥 {t('landing.nowOnNetwork', 'Agora na Rede')}</h2>
        
        <div style={{display:'grid',gridTemplateColumns:'1fr',gap:20}}>
          <div style={{background:'rgba(255,255,255,0.08)',padding:20,borderRadius:16,border:'1px solid rgba(255,255,255,0.12)',display:'flex',alignItems:'center',gap:15}}>
            <Heart size={30} color="#F43F5E" style={{flexShrink:0}}/>
            <div>
              <p style={{fontSize:'1.1rem',fontWeight:600,margin:0}}>{t('landing.activity1Title', 'Maria pediu oração pela família')}</p>
              <p style={{fontSize:'0.9rem',color:'rgba(255,255,255,0.6)',margin:'5px 0 0'}}>🙏 {t('landing.activity1Count', '23 pessoas já oraram')}</p>
            </div>
          </div>
          <div style={{background:'rgba(255,255,255,0.08)',padding:20,borderRadius:16,border:'1px solid rgba(255,255,255,0.12)',display:'flex',alignItems:'center',gap:15}}>
            <BookOpen size={30} color="#D4AF37" style={{flexShrink:0}}/>
            <div>
              <p style={{fontSize:'1.1rem',fontWeight:600,margin:0}}>{t('landing.activity2Title', 'João compartilhou um testemunho')}</p>
              <p style={{fontSize:'0.9rem',color:'rgba(255,255,255,0.6)',margin:'5px 0 0'}}>❤️ {t('landing.activity2Count', '120 pessoas foram tocadas')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Frase Espiritual Forte - NEW SECTION */}
      <section style={{textAlign:'center',padding:'60px 20px',maxWidth:800,margin:'0 auto'}}>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2rem',fontStyle:'italic',lineHeight:1.4,color:'rgba(255,255,255,0.9)'}}>
          "{t('landing.spiritualQuote', 'Onde dois ou três estiverem reunidos em meu nome, ali estou no meio deles.')}"
        </p>
        <p style={{fontSize:'1.1rem',color:'rgba(255,255,255,0.6)',marginTop:15}}>— {t('landing.spiritualQuoteRef', 'Mateus 18:20')}</p>
      </section>

      {/* Footer */}
      <footer style={{textAlign:'center',padding:'40px 20px',borderTop:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.4)',fontSize:'0.9rem'}}>
        <p>© 2026 {t('brand', 'Sigo com Fé')}. {t('footer.allRightsReserved', 'Todos os direitos reservados.')}</p>
      </footer>

    </div>
  );
}
