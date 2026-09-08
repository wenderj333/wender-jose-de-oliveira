import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GAMES = [
  { title: 'Duelo Bíblico', cover: '/game-covers/duelo-biblico.png', path: '/duelo-biblico', description: 'Responda perguntas da Bíblia, desafie outro jogador e acompanhe o ranking.' },
  { title: 'Guardião da Palavra', cover: '/game-covers/guardiao-da-palavra.png', path: '/guardiao-da-palavra/', description: 'Proteja a Palavra, aprenda histórias bíblicas e avance por desafios de fé.' },
  { title: 'Mundo Bíblico', cover: '/game-covers/mundo-biblico.png', path: '/mundo-biblico/', description: 'Explore um mundo bíblico educativo com personagens, histórias e atividades.' },
];

export default function GamesHub() {
  const [openInfo, setOpenInfo] = useState(null);
  return <main style={{ minHeight: '100vh', padding: '28px 18px 64px', background: 'linear-gradient(145deg,#f8f6ff,#eef7f1)', color: '#21133e' }}>
    <section style={{ maxWidth: 980, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}><span style={{ color: '#638b75', fontWeight: 800, fontSize: 12, letterSpacing: 1.5 }}>SIGO COM FÉ</span><h1 style={{ margin: '6px 0', fontSize: 'clamp(2rem,5vw,3.2rem)' }}>Jogos</h1><p style={{ margin: 0, color: '#5d687d' }}>Escolha uma experiência e cresça na fé brincando.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
        {GAMES.map((game, index) => <article key={game.title} style={{ background: '#fff', border: '1px solid #e1dcef', borderRadius: 18, padding: 10, boxShadow: '0 10px 28px rgba(54,36,91,.1)' }}>
          <img src={game.cover} alt={`Capa de ${game.title}`} style={{ display: 'block', width: '100%', height: 110, objectFit: 'cover', borderRadius: 12 }} />
          <h2 style={{ fontSize: 18, margin: '12px 6px 8px' }}>{game.title}</h2>
          <div style={{ display: 'flex', gap: 8, margin: '0 6px 6px' }}><Link to={game.path} style={{ flex: 1, textAlign: 'center', padding: '9px 8px', borderRadius: 10, background: '#633da0', color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: 13 }}>Abrir jogo</Link><button type="button" onClick={() => setOpenInfo(openInfo === index ? null : index)} aria-expanded={openInfo === index} style={{ padding: '9px 11px', borderRadius: 10, border: '1px solid #d8ccea', background: '#fff', color: '#633da0', fontWeight: 800, cursor: 'pointer' }}>ⓘ</button></div>
          {openInfo === index && <p style={{ margin: '10px 6px 6px', padding: '10px', borderRadius: 10, background: '#f5f1fc', color: '#59627d', fontSize: 13, lineHeight: 1.5 }}>{game.description}</p>}
        </article>)}
      </div>
    </section>
  </main>;
}
