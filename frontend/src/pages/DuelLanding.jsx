import React, { useEffect } from 'react';
import { ArrowRight, BrainCircuit, Trophy, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DuelLanding() {
  useEffect(() => {
    const oldTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const oldDescription = description?.content;
    document.title = 'Duelo Bíblico Cristão Online | Sigo com Fé';
    if (description) description.content = 'Jogue Duelo Bíblico online com amigos ou contra o Bot Bíblico. Responda perguntas da Bíblia, desafie irmãos e celebre a sua vitória na Sigo com Fé.';
    return () => { document.title = oldTitle; if (description && oldDescription) description.content = oldDescription; };
  }, []);

  const trackCta = (name) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', { cta_name: name, page: 'duel_landing' });
    }
  };
  const play = () => { trackCta('play_duel'); window.location.href = 'https://duelo-biblico.vercel.app'; };
  const register = () => { trackCta('register_community'); };
  return <main style={{ minHeight: '100vh', padding: '20px 18px 64px', background: 'linear-gradient(150deg,#f8f5ff 0%,#eef5ff 60%,#fff 100%)', color: '#21133e' }}>
    <nav style={{ maxWidth: 1050, margin: '0 auto 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}><Link to="/" style={{ color: '#633da0', textDecoration: 'none', fontWeight: 900, fontSize: '1.35rem' }}>Sigo com Fé</Link><div style={{ display: 'flex', gap: 10 }}><Link to="/login" style={{ color: '#633da0', textDecoration: 'none', fontWeight: 800, padding: '10px 14px' }}>Entrar</Link><Link to="/register" onClick={register} style={{ background: '#633da0', borderRadius: 10, color: '#fff', textDecoration: 'none', fontWeight: 800, padding: '10px 14px' }}>Criar conta grátis</Link></div></nav>
    <section style={{ maxWidth: 830, margin: '0 auto', textAlign: 'center' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 999, background: '#eee5fa', color: '#633da0', fontWeight: 850, fontSize: 13 }}><Trophy size={16}/> Jogo cristão online</span>
      <h1 style={{ margin: '18px 0 13px', fontSize: 'clamp(2.2rem,6vw,4.4rem)', letterSpacing: '-.04em', lineHeight: 1.05 }}>Duelo Bíblico Cristão Online</h1>
      <p style={{ maxWidth: 640, margin: '0 auto', color: '#59627d', fontSize: '1.14rem', lineHeight: 1.65 }}>Responda perguntas da Bíblia, jogue com uma pessoa ou contra o Bot Bíblico e partilhe a sua vitória com a comunidade Sigo com Fé.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 28 }}><button onClick={play} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', background: '#633da0', color: '#fff', borderRadius: 12, padding: '14px 19px', fontWeight: 850, fontSize: 16 }}>Jogar o Duelo Bíblico <ArrowRight size={18}/></button><Link to="/register" onClick={register} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #d9cbea', color: '#633da0', background: '#fff', borderRadius: 12, padding: '14px 19px', textDecoration: 'none', fontWeight: 800 }}>Entrar na comunidade</Link></div>
    </section>
    <section className="duel-features" style={{ maxWidth: 900, margin: '58px auto 0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>{[[BrainCircuit,'Perguntas bíblicas','Aprenda e desafie a sua memória com perguntas da Palavra.'],[UsersRound,'Jogue acompanhado','Convide um amigo para uma partida ou escolha o Bot Bíblico.'],[Trophy,'Celebre a vitória','Veja os seus resultados e inspire outras pessoas a participar.']].map(([Icon,title,text]) => <article key={title} style={{ background: '#fff', border: '1px solid #e4dff0', borderRadius: 18, padding: 22, boxShadow: '0 8px 24px rgba(73,49,120,.08)' }}><Icon size={25} color="#633da0"/><h2 style={{ fontSize: '1.05rem' }}>{title}</h2><p style={{ marginBottom: 0, color: '#667085', lineHeight: 1.55 }}>{text}</p></article>)}</section>
    <style>{`@media(max-width:700px){.duel-features{grid-template-columns:1fr !important}}`}</style>
  </main>;
}
