import React from 'react';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import { HandHeart, Radio, MapPin, LayoutDashboard, Heart, BookOpen, Baby, Church, Newspaper } from 'lucide-react';

export default function Home() {
  const { totalChurchesPraying } = useWebSocket();

  const iconStyle = { color: '#3b5998', strokeWidth: 1.5 };
  const goldIcon = { color: '#daa520', strokeWidth: 1.5 };

  return (
    <div>
      <section className="hero">
        <BookOpen size={56} style={{ color: '#f4d03f', strokeWidth: 1.5, marginBottom: '0.5rem' }} />
        <h1>Sigo com Fé</h1>
        <p>A rede social cristã que conecta igrejas, fortalece a fé e coloca a tecnologia a serviço do Reino.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/cadastro" className="btn btn-primary btn-lg">Comece Agora</Link>
          <Link to="/oracoes" className="btn btn-outline btn-lg" style={{ borderColor: '#f4d03f', color: '#f4d03f' }}>
            Ver Pedidos de Oração
          </Link>
        </div>
        {totalChurchesPraying > 0 && (
          <p style={{ marginTop: '2rem', fontSize: '1.1rem' }}>
            <Radio size={18} style={{ color: '#ff4444', verticalAlign: 'middle' }} />
            {' '}<strong>{totalChurchesPraying} {totalChurchesPraying === 1 ? 'igreja orando' : 'igrejas orando'} neste momento!</strong>
          </p>
        )}
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
