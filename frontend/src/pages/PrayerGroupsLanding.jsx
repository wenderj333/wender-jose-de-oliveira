import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Heart, ShieldCheck, Users } from 'lucide-react';

const features = [
  { icon: Heart, title: 'Pedidos de oração', text: 'Partilhe um pedido e ore com pessoas que caminham na mesma fé.' },
  { icon: Users, title: 'Comunhão cristã', text: 'Crie ou encontre um grupo para a sua igreja, família, jovens ou estudo bíblico.' },
  { icon: BookOpen, title: 'Palavra e crescimento', text: 'Converse sobre a Bíblia, publique reflexões e fortaleça a sua jornada com Deus.' },
  { icon: ShieldCheck, title: 'Espaços com privacidade', text: 'Cada grupo pode ser público ou privado e ter aprovação de novos membros.' },
];

export default function PrayerGroupsLanding() {
  useEffect(() => {
    document.title = 'Grupos de Oração Online | Sigo com Fé';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', 'Encontre grupos de oração online e comunidades cristãs no Sigo com Fé. Ore, partilhe pedidos e cresça na Palavra de Deus.');
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f7faf7 0%, #edf4ee 100%)', color: '#254338' }}>
      <header style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18 }}>
        <Link to="/" style={{ color: '#244d41', textDecoration: 'none', fontWeight: 850, fontSize: 21 }}>Sigo com Fé</Link>
        <Link to="/login" style={{ color: '#416758', textDecoration: 'none', fontWeight: 750, fontSize: 14 }}>Entrar</Link>
      </header>

      <section style={{ maxWidth: 880, margin: '28px auto 0', padding: '46px 22px 52px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#708a73', fontSize: 13, fontWeight: 850, letterSpacing: '.12em', textTransform: 'uppercase' }}>Comunidade cristã online</p>
        <h1 style={{ maxWidth: 760, margin: '16px auto', fontSize: 'clamp(34px, 6vw, 58px)', lineHeight: 1.06, letterSpacing: '-.04em' }}>Grupos de oração para caminhar juntos na fé</h1>
        <p style={{ maxWidth: 620, margin: '0 auto', fontSize: 18, lineHeight: 1.65, color: '#61766a' }}>No Sigo com Fé pode encontrar irmãos, criar um grupo de oração e partilhar pedidos, reflexões e a Palavra de Deus com segurança.</p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 20px', borderRadius: 12, background: '#4f7b62', color: '#fff', textDecoration: 'none', fontWeight: 800 }}>Criar a minha conta <ArrowRight size={17} /></Link>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 20px', borderRadius: 12, border: '1px solid #bcd0bf', color: '#38604b', textDecoration: 'none', fontWeight: 800 }}>Conhecer a comunidade</Link>
        </div>
      </section>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 22px 64px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 15 }}>
        {features.map(({ icon: Icon, title, text }) => <article key={title} style={{ background: '#fff', border: '1px solid #dce9de', borderRadius: 18, padding: 22, boxShadow: '0 10px 28px rgba(49, 80, 60, .06)' }}>
          <Icon size={25} color="#5c8468" strokeWidth={2} />
          <h2 style={{ margin: '15px 0 7px', fontSize: 17 }}>{title}</h2>
          <p style={{ margin: 0, color: '#66776c', fontSize: 14, lineHeight: 1.55 }}>{text}</p>
        </article>)}
      </section>
    </main>
  );
}
