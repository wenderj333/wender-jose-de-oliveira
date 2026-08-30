import React, { useEffect } from 'react';
import { ArrowRight, BrainCircuit, ShieldCheck, Trophy, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DuelLanding() {
  useEffect(() => {
    const oldTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const oldDescription = description?.content;
    document.title = 'Duelo Bíblico Cristão Online | Sigo com Fé';
    if (description) description.content = 'Conheça o Duelo Bíblico online. Crie a sua conta grátis na Sigo com Fé para jogar com amigos, participar no ranking e celebrar a sua vitória.';
    return () => { document.title = oldTitle; if (description && oldDescription) description.content = oldDescription; };
  }, []);

  const trackCta = (name) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', { cta_name: name, page: 'duel_landing' });
    }
  };
  const register = () => { trackCta('register_to_play_duel'); };
  return <main style={{ minHeight: '100vh', padding: '20px 18px 64px', background: 'linear-gradient(150deg,#f8f5ff 0%,#eef5ff 60%,#fff 100%)', color: '#21133e' }}>
    <nav style={{ maxWidth: 1050, margin: '0 auto 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}><Link to="/" style={{ color: '#633da0', textDecoration: 'none', fontWeight: 900, fontSize: '1.35rem' }}>Sigo com Fé</Link><div style={{ display: 'flex', gap: 10 }}><Link to="/login" style={{ color: '#633da0', textDecoration: 'none', fontWeight: 800, padding: '10px 14px' }}>Entrar</Link><Link to="/register" onClick={register} style={{ background: '#633da0', borderRadius: 10, color: '#fff', textDecoration: 'none', fontWeight: 800, padding: '10px 14px' }}>Criar conta grátis</Link></div></nav>
    <section style={{ maxWidth: 830, margin: '0 auto', textAlign: 'center' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 999, background: '#eee5fa', color: '#633da0', fontWeight: 850, fontSize: 13 }}><Trophy size={16}/> Jogo cristão online</span>
      <h1 style={{ margin: '18px 0 13px', fontSize: 'clamp(2.2rem,6vw,4.4rem)', letterSpacing: '-.04em', lineHeight: 1.05 }}>Duelo Bíblico Cristão Online</h1>
      <p style={{ maxWidth: 640, margin: '0 auto', color: '#59627d', fontSize: '1.14rem', lineHeight: 1.65 }}>Responda perguntas da Bíblia, desafie irmãos e celebre a sua vitória. Para jogar, crie a sua conta gratuita na comunidade Sigo com Fé.</p>
      <figure style={{ position: 'relative', margin: '28px auto 0', maxWidth: 830, overflow: 'hidden', borderRadius: 22, boxShadow: '0 18px 42px rgba(56,31,91,.22)', border: '1px solid #d9cbea', background: '#2e174f' }}>
        <img src="/duelo-biblico-perguntas-realista.png" alt="Dois irmãos participando de um duelo de perguntas bíblicas" style={{ display: 'block', width: '100%', height: 'auto' }} />
        <div aria-label="Exemplo de pergunta bíblica" style={{ position: 'absolute', top: '23%', left: '29%', right: '34%', bottom: '31%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff', textAlign: 'center', pointerEvents: 'none' }}>
          <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '34%', padding: '3px 7px', fontSize: 'clamp(8px,1.3vw,16px)', lineHeight: 1.25, textShadow: '0 1px 5px #1d0c38' }}>Qual é o primeiro livro da Bíblia?</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '4%', height: '48%', alignContent: 'end' }}>
            {['Génesis', 'Êxodo', 'Salmos', 'Mateus'].map((answer, index) => <span key={answer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px', borderRadius: 7, fontSize: 'clamp(7px,1vw,13px)', fontWeight: 800, background: index === 0 ? 'rgba(245,202,94,.28)' : 'rgba(255,255,255,.08)', border: index === 0 ? '1px solid rgba(255,222,130,.8)' : '1px solid rgba(255,255,255,.22)', textShadow: '0 1px 4px #1d0c38' }}>{answer}</span>)}
          </div>
        </div>
      </figure>
      <div style={{ maxWidth: 540, margin: '22px auto 0', padding: '13px 16px', borderRadius: 13, background: '#fff', border: '1px solid #ded1ef', color: '#53337e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontWeight: 700, fontSize: 14 }}><ShieldCheck size={19}/> A conta protege o seu resultado e permite jogar com outros irmãos.</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 22 }}><Link to="/register" onClick={register} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#633da0', color: '#fff', borderRadius: 12, padding: '14px 19px', textDecoration: 'none', fontWeight: 850, fontSize: 16 }}>Criar conta grátis para jogar <ArrowRight size={18}/></Link><Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #d9cbea', color: '#633da0', background: '#fff', borderRadius: 12, padding: '14px 19px', textDecoration: 'none', fontWeight: 800 }}>Já tenho uma conta</Link></div>
    </section>
    <section className="duel-features" style={{ maxWidth: 900, margin: '58px auto 0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>{[[BrainCircuit,'Perguntas bíblicas','Aprenda e desafie a sua memória com perguntas da Palavra.'],[UsersRound,'Jogue acompanhado','Convide um amigo para uma partida ou escolha o Bot Bíblico.'],[Trophy,'Celebre a vitória','Veja os seus resultados e inspire outras pessoas a participar.']].map(([Icon,title,text]) => <article key={title} style={{ background: '#fff', border: '1px solid #e4dff0', borderRadius: 18, padding: 22, boxShadow: '0 8px 24px rgba(73,49,120,.08)' }}><Icon size={25} color="#633da0"/><h2 style={{ fontSize: '1.05rem' }}>{title}</h2><p style={{ marginBottom: 0, color: '#667085', lineHeight: 1.55 }}>{text}</p></article>)}</section>
    <style>{`@media(max-width:700px){.duel-features{grid-template-columns:1fr !important}}`}</style>
  </main>;
}
