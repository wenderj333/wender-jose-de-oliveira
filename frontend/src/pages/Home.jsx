import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import { HandHeart, Radio, MapPin, LayoutDashboard, Heart, BookOpen, Baby, Church, Newspaper, Sparkles, Users, CheckCircle } from 'lucide-react';

const versiculos = [
  { texto: "Porque onde estiverem dois ou três reunidos em meu nome, ali estou no meio deles.", ref: "Mateus 18:20" },
  { texto: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { texto: "O Senhor é o meu pastor; nada me faltará.", ref: "Salmos 23:1" },
  { texto: "Confie no Senhor de todo o seu coração e não se apoie no seu próprio entendimento.", ref: "Provérbios 3:5" },
  { texto: "Pois eu sei os planos que tenho para vocês, planos de dar a vocês esperança e um futuro.", ref: "Jeremias 29:11" },
  { texto: "Sejam fortes e corajosos. Não tenham medo, pois o Senhor estará com vocês.", ref: "Deuteronômio 31:6" },
  { texto: "A oração de um justo é poderosa e eficaz.", ref: "Tiago 5:16" },
];

function getVersiculoDoDia() {
  const hoje = new Date();
  const idx = (hoje.getFullYear() * 366 + hoje.getMonth() * 31 + hoje.getDate()) % versiculos.length;
  return versiculos[idx];
}

export default function Home() {
  const { totalChurchesPraying } = useWebSocket();
  const [loaded, setLoaded] = useState(false);
  const versiculo = getVersiculoDoDia();

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const iconStyle = { color: '#3b5998', strokeWidth: 1.5 };
  const goldIcon = { color: '#daa520', strokeWidth: 1.5 };

  return (
    <div>
      <section className={`hero ${loaded ? 'hero--loaded' : ''}`}>
        <div className="hero__particles">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="hero__particle" style={{
              left: `${8 + (i * 7.5) % 85}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + (i % 3) * 2}s`
            }} />
          ))}
        </div>

        <div className="hero__icon-glow">
          <BookOpen size={64} style={{ color: '#f4d03f', strokeWidth: 1.5 }} />
        </div>

        <h1 className="hero__title">Sigo com Fé</h1>
        <p className="hero__subtitle">Ore, conecte-se e fortaleça sua fé com milhares de irmãos ao redor do mundo.</p>

        <div className="hero__verse">
          <span className="hero__verse-text">"{versiculo.texto}"</span>
          <span className="hero__verse-ref">— {versiculo.ref}</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/cadastro" className="btn btn-primary btn-lg">Comece Agora</Link>
          <Link to="/oracoes" className="btn btn-outline btn-lg" style={{ borderColor: '#f4d03f', color: '#f4d03f' }}>
            Ver Pedidos de Oração
          </Link>
        </div>

        <div className="hero__stats">
          {totalChurchesPraying > 0 && (
            <div className="hero__stat">
              <Radio size={18} style={{ color: '#ff4444' }} />
              <strong>{totalChurchesPraying} {totalChurchesPraying === 1 ? 'igreja orando' : 'igrejas orando'} agora!</strong>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="card feature-card">
          <div className="feature-card__icon"><HandHeart size={48} style={iconStyle} /></div>
          <h3>Pedidos de Oração</h3>
          <p>Compartilhe seus pedidos e ore pelos irmãos. Veja o poder da oração coletiva e celebre as vitórias!</p>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><Radio size={48} style={{ color: '#e74c3c', strokeWidth: 1.5 }} /></div>
          <h3>Pastor Orando ao Vivo</h3>
          <p>Saiba quando seu pastor está orando em tempo real. Bolhas de oração sobem como incenso ao céu.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><MapPin size={48} style={iconStyle} /></div>
          <h3>Mapa de Igrejas</h3>
          <p>Encontre igrejas em qualquer cidade. Perfeito para viajantes e famílias em mudança.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><LayoutDashboard size={48} style={iconStyle} /></div>
          <h3>Dashboard Pastoral</h3>
          <p>Ferramentas completas de gestão para pastores: membros, finanças, campanhas e muito mais.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><Newspaper size={48} style={iconStyle} /></div>
          <h3>Mural da Comunidade</h3>
          <p>Compartilhe testemunhos, louvores e versículos com a comunidade cristã.</p>
          <Link to="/mural" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>Explorar</Link>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><Baby size={48} style={{ color: '#e74c3c', strokeWidth: 1.5 }} /></div>
          <h3>Cantinho Kids</h3>
          <p>Histórias bíblicas, quiz interativo e atividades para as crianças aprenderem sobre a Bíblia!</p>
          <Link to="/kids" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>Explorar</Link>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><Church size={48} style={goldIcon} /></div>
          <h3>Cadastre Sua Igreja</h3>
          <p>Registre sua igreja na plataforma e conecte-se com fiéis de todo o mundo.</p>
          <Link to="/cadastrar-igreja" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>Cadastrar</Link>
        </div>
      </section>
    </div>
  );
}
