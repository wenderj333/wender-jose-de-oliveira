import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AudioLines, HeartHandshake, Radio, Video } from 'lucide-react';

const cards = [
  { Icon: Video, title: 'Oração em vídeo', text: 'Participe de momentos de oração conduzidos pelo pastor, onde quer que esteja.' },
  { Icon: Radio, title: 'Modo rádio', text: 'Ouça a oração somente em áudio, com menos uso de internet.' },
  { Icon: HeartHandshake, title: 'Comunhão com respeito', text: 'Uma sala preparada para irmãos que desejam buscar a Deus juntos.' },
];

export default function LivePrayerLanding() {
  useEffect(() => {
    const previous = {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      ogTitle: document.querySelector('meta[property="og:title"]')?.content,
      ogDescription: document.querySelector('meta[property="og:description"]')?.content,
    };
    const description = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    document.title = 'Oração ao Vivo Online | Sigo com Fé';
    if (description) description.content = 'Participe de oração ao vivo online, em vídeo ou modo rádio, na comunidade cristã Sigo com Fé. Crie a sua conta gratuita.';
    if (canonical) canonical.href = `${window.location.origin}/oracao-ao-vivo`;
    if (ogTitle) ogTitle.content = 'Oração ao Vivo Online | Sigo com Fé';
    if (ogDescription) ogDescription.content = 'Ore junto com a comunidade cristã em vídeo ou modo rádio.';
    return () => {
      document.title = previous.title;
      if (description && previous.description) description.content = previous.description;
      if (canonical && previous.canonical) canonical.href = previous.canonical;
      if (ogTitle && previous.ogTitle) ogTitle.content = previous.ogTitle;
      if (ogDescription && previous.ogDescription) ogDescription.content = previous.ogDescription;
    };
  }, []);

  return <main style={{ minHeight: '100vh', padding: '20px 18px 72px', color: '#fff', background: 'radial-gradient(circle at 22% 8%,#583985 0%,#211332 42%,#100c1d 100%)' }}>
    <nav style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 900, fontSize: 21 }}>Sigo com Fé</Link>
      <div style={{ display: 'flex', gap: 10 }}><Link to="/login" style={login}>Entrar</Link><Link to="/register" style={register}>Criar conta grátis</Link></div>
    </nav>
    <section style={{ maxWidth: 860, margin: '72px auto 0', textAlign: 'center' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 99, background: 'rgba(245,207,98,.16)', border: '1px solid rgba(245,207,98,.35)', color: '#f5cf62', fontSize: 13, fontWeight: 850 }}><Radio size={16} /> ORAÇÃO AO VIVO ONLINE</span>
      <h1 style={{ margin: '18px 0 14px', fontSize: 'clamp(2.5rem,7vw,4.8rem)', lineHeight: 1.02, letterSpacing: '-.045em' }}>Ore ao vivo com a comunidade</h1>
      <p style={{ maxWidth: 650, margin: '0 auto', color: '#ddd0ef', fontSize: 18, lineHeight: 1.65 }}>Na Sala de Oração do Sigo com Fé, o pastor pode transmitir em vídeo ou áudio e os irmãos participam onde estiverem.</p>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
        <Link to="/register" style={{ ...register, padding: '15px 20px', fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}>Entrar para orar ao vivo <ArrowRight size={18} /></Link>
        <Link to="/login" style={{ ...login, padding: '15px 20px', fontSize: 16 }}>Já tenho uma conta</Link>
      </div>
    </section>
    <section style={{ maxWidth: 1010, margin: '70px auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(235px,1fr))', gap: 16 }}>
      {cards.map(({ Icon, title, text }) => <article key={title} style={{ padding: 25, borderRadius: 20, background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.15)', boxShadow: '0 16px 40px rgba(0,0,0,.18)' }}><Icon color="#f5cf62" size={28} /><h2 style={{ fontSize: 19, margin: '16px 0 8px' }}>{title}</h2><p style={{ margin: 0, color: '#d9cce8', lineHeight: 1.58 }}>{text}</p></article>)}
    </section>
    <p style={{ maxWidth: 700, margin: '42px auto 0', textAlign: 'center', color: '#c5b6d9', lineHeight: 1.55 }}>A participação é gratuita. É preciso criar uma conta para entrar na sala e manter este espaço seguro para todos.</p>
  </main>;
}

const login = { color: '#fff', textDecoration: 'none', fontWeight: 800, padding: '10px 13px', border: '1px solid rgba(255,255,255,.34)', borderRadius: 11 };
const register = { color: '#251432', background: '#f5cf62', textDecoration: 'none', fontWeight: 850, padding: '10px 13px', borderRadius: 11 };
