import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Heart, Users, BookOpen, ChevronRight } from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0a1833,#1a0a3e)',color:'white',fontFamily:"'Jost',sans-serif"}}>
      
      {/* Navbar */}
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 40px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,fontSize:'1.5rem',fontWeight:700,fontFamily:"'Cormorant Garamond',serif"}}>
          <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#fff,#E8C97A)',display:'flex',alignItems:'center',justifyContent:'center',color:'#1a0a3e',fontSize:'1.2rem'}}>📖</div>
          Sigo com Fé
        </div>
        <div style={{display:'flex',gap:20}}>
          <Link to="/login" style={{textDecoration:'none',color:'white',fontWeight:500,padding:'10px 20px'}}>Entrar</Link>
          <Link to="/register" style={{textDecoration:'none',background:'linear-gradient(135deg,#C9A84C,#E8C97A)',color:'#1a0a3e',fontWeight:700,padding:'10px 24px',borderRadius:30,boxShadow:'0 4px 14px rgba(201,168,76,0.3)'}}>
            Começar Agora
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header style={{textAlign:'center',padding:'80px 20px',maxWidth:800,margin:'0 auto'}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'3.5rem',fontWeight:700,marginBottom:20,lineHeight:1.1}}>
          Conecte-se com sua fé.<br/>
          <span style={{background:'linear-gradient(to right,#C9A84C,#E8C97A)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Onde você estiver.</span>
        </h1>
        <p style={{fontSize:'1.2rem',color:'rgba(255,255,255,0.7)',marginBottom:40,lineHeight:1.6}}>
          Uma rede social cristã completa para oração, comunhão e crescimento espiritual. Junte-se a milhares de fiéis ao redor do mundo.
        </p>
        <div style={{display:'flex',gap:16,justifyContent:'center'}}>
          <Link to="/register" style={{textDecoration:'none',background:'linear-gradient(135deg,#1877F2,#0D5FCC)',color:'white',fontWeight:700,padding:'14px 32px',borderRadius:30,fontSize:'1.1rem',boxShadow:'0 4px 20px rgba(24,119,242,0.4)',display:'flex',alignItems:'center',gap:8}}>
            Criar Conta Grátis <ChevronRight size={20}/>
          </Link>
        </div>
      </header>

      {/* Features */}
      <section style={{maxWidth:1100,margin:'0 auto',padding:'60px 20px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:30}}>
        <div style={{background:'rgba(255,255,255,0.05)',padding:30,borderRadius:20,border:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{width:50,height:50,borderRadius:14,background:'linear-gradient(135deg,#1877F2,#0D5FCC)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}><Users color="white"/></div>
          <h3 style={{fontSize:'1.3rem',fontWeight:600,marginBottom:10}}>Comunidade Global</h3>
          <p style={{color:'rgba(255,255,255,0.6)',lineHeight:1.5}}>Conecte-se com irmãos e irmãs de 7 países diferentes. Compartilhe testemunhos e cresça junto.</p>
        </div>
        <div style={{background:'rgba(255,255,255,0.05)',padding:30,borderRadius:20,border:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{width:50,height:50,borderRadius:14,background:'linear-gradient(135deg,#C9A84C,#E8C97A)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}><BookOpen color="#1a0a3e"/></div>
          <h3 style={{fontSize:'1.3rem',fontWeight:600,marginBottom:10}}>Estudo Bíblico & IA</h3>
          <p style={{color:'rgba(255,255,255,0.6)',lineHeight:1.5}}>Acesse nossa IA Bíblica para tirar dúvidas e siga jornadas de fé personalizadas.</p>
        </div>
        <div style={{background:'rgba(255,255,255,0.05)',padding:30,borderRadius:20,border:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{width:50,height:50,borderRadius:14,background:'linear-gradient(135deg,#F43F5E,#BE123C)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}><Heart color="white"/></div>
          <h3 style={{fontSize:'1.3rem',fontWeight:600,marginBottom:10}}>Oração & Apoio</h3>
          <p style={{color:'rgba(255,255,255,0.6)',lineHeight:1.5}}>Compartilhe pedidos de oração e receba apoio espiritual de pastores e membros.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{textAlign:'center',padding:'40px 20px',borderTop:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.4)',fontSize:'0.9rem'}}>
        <p>© 2026 Sigo com Fé. Todos os direitos reservados.</p>
      </footer>

    </div>
  );
}
