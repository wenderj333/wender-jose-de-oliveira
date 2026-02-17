import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Users, Heart, Church, BookOpen, MessageCircle,
  DollarSign, FileText, Calendar, ArrowLeft, Megaphone, HandHeart,
  Lightbulb, BarChart3, Settings, Droplets, Home, ClipboardList
} from 'lucide-react';

export default function PastorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);

  const isPastor = user?.role === 'pastor' || user?.role === 'admin';

  if (!isPastor) {
    return (
      <div style={{ maxWidth: 500, margin: '3rem auto', textAlign: 'center', padding: '2rem' }}>
        <ShieldCheck size={64} style={{ color: '#e74c3c', marginBottom: '1rem' }} />
        <h2 style={{ color: '#1a0a3e' }}>🔒 Acesso Restrito</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Esta área é exclusiva para pastores e líderes de igreja.
          Se você é pastor, faça login com sua conta pastoral.
        </p>
        <button onClick={() => navigate('/')} style={{
          marginTop: '1rem', padding: '0.7rem 2rem', borderRadius: 25, border: 'none',
          background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff',
          fontWeight: 700, cursor: 'pointer',
        }}>
          Voltar ao Início
        </button>
      </div>
    );
  }

  const sections = [
    {
      id: 'membros',
      icon: <Users size={28} color="#fff" />,
      title: '👥 Membros da Igreja',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      desc: 'Veja e gerencie os membros conectados à sua igreja',
      content: (
        <div>
          <h3 style={{ color: '#1a0a3e', marginBottom: '1rem' }}>👥 Membros da Igreja</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Aqui você verá todos os membros conectados à sua igreja. Acompanhe quem está ativo,
            envie mensagens e fortaleça sua comunidade.
          </p>
          <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
            <Users size={40} style={{ color: '#ccc', marginBottom: '0.5rem' }} />
            <p style={{ color: '#999', fontSize: '0.85rem' }}>
              Os membros da sua igreja aparecerão aqui quando estiverem conectados.
            </p>
            <p style={{ color: '#667eea', fontSize: '0.8rem', fontStyle: 'italic' }}>
              🔧 Funcionalidade em desenvolvimento — em breve!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'dizimos',
      icon: <DollarSign size={28} color="#fff" />,
      title: '💰 Dízimos e Ofertas',
      gradient: 'linear-gradient(135deg, #daa520, #b8860b)',
      desc: 'Gerencie dízimos, ofertas e relatórios financeiros',
      content: (
        <div>
          <h3 style={{ color: '#1a0a3e', marginBottom: '1rem' }}>💰 Dízimos e Ofertas</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Registre e acompanhe os dízimos e ofertas da sua igreja. Gere relatórios
            e mantenha a transparência financeira com sua comunidade.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #daa520, #f4c542)', borderRadius: 14, padding: '1rem', color: '#fff', textAlign: 'center' }}>
              <DollarSign size={24} />
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>R$ 0</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>Dízimos este mês</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #4caf50, #66bb6a)', borderRadius: 14, padding: '1rem', color: '#fff', textAlign: 'center' }}>
              <Heart size={24} />
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>R$ 0</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>Ofertas este mês</div>
            </div>
          </div>
          <p style={{ color: '#667eea', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center' }}>
            🔧 Funcionalidade em desenvolvimento — em breve!
          </p>
        </div>
      ),
    },
    {
      id: 'oracoes',
      icon: <HandHeart size={28} color="#fff" />,
      title: '🙏 Pedidos de Oração',
      gradient: 'linear-gradient(135deg, #4caf50, #2e7d32)',
      desc: 'Acompanhe e responda pedidos de oração dos membros',
      content: (
        <div>
          <h3 style={{ color: '#1a0a3e', marginBottom: '1rem' }}>🙏 Pedidos de Oração</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Veja todos os pedidos de oração dos membros da sua igreja.
            Ore por eles, marque como respondidos e acompanhe as vitórias!
          </p>
          <button onClick={() => navigate('/oracoes')} style={{
            width: '100%', padding: '0.8rem', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #4caf50, #2e7d32)', color: '#fff',
            fontWeight: 700, cursor: 'pointer',
          }}>
            Ver Pedidos de Oração →
          </button>
        </div>
      ),
    },
    {
      id: 'chat',
      icon: <MessageCircle size={28} color="#fff" />,
      title: '💬 Chat Pastoral',
      gradient: 'linear-gradient(135deg, #8e44ad, #6c3483)',
      desc: 'Converse com membros que precisam de orientação',
      content: (
        <div>
          <h3 style={{ color: '#1a0a3e', marginBottom: '1rem' }}>💬 Chat Pastoral</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Atenda pessoas que precisam de uma palavra de conforto e orientação.
            O chat é traduzido automaticamente para que você possa ajudar qualquer pessoa no mundo.
          </p>
          <button onClick={() => navigate('/chat-pastoral')} style={{
            width: '100%', padding: '0.8rem', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #8e44ad, #6c3483)', color: '#fff',
            fontWeight: 700, cursor: 'pointer',
          }}>
            Abrir Chat Pastoral →
          </button>
        </div>
      ),
    },
    {
      id: 'gestao',
      icon: <Settings size={28} color="#fff" />,
      title: '⚙️ Gestão da Igreja',
      gradient: 'linear-gradient(135deg, #34495e, #2c3e50)',
      desc: 'Aluguel, contas, água, luz e administração geral',
      content: (
        <div>
          <h3 style={{ color: '#1a0a3e', marginBottom: '1rem' }}>⚙️ Gestão da Igreja</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Gerencie todas as despesas e necessidades da sua igreja em um só lugar.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: <Home size={20} />, label: 'Aluguel', color: '#e74c3c' },
              { icon: <Droplets size={20} />, label: 'Água', color: '#3498db' },
              { icon: <Lightbulb size={20} />, label: 'Luz', color: '#f39c12' },
              { icon: <ClipboardList size={20} />, label: 'Outras Despesas', color: '#27ae60' },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#f8f9fa', borderRadius: 12, padding: '1rem', textAlign: 'center',
                border: `2px solid ${item.color}22`,
              }}>
                <div style={{ color: item.color, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#333' }}>{item.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#999' }}>R$ 0,00</div>
              </div>
            ))}
          </div>
          <p style={{ color: '#667eea', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' }}>
            🔧 Funcionalidade em desenvolvimento — em breve!
          </p>
        </div>
      ),
    },
    {
      id: 'estudos',
      icon: <BookOpen size={28} color="#fff" />,
      title: '📖 Estudos Bíblicos',
      gradient: 'linear-gradient(135deg, #1a0a3e, #4a1a8e)',
      desc: 'Crie e compartilhe estudos bíblicos com sua igreja',
      content: (
        <div>
          <h3 style={{ color: '#1a0a3e', marginBottom: '1rem' }}>📖 Estudos Bíblicos</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Prepare estudos bíblicos interativos para sua congregação.
            Compartilhe planos de leitura, devocional e conteúdo para crescimento espiritual.
          </p>
          <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
            <BookOpen size={40} style={{ color: '#ccc', marginBottom: '0.5rem' }} />
            <p style={{ color: '#999', fontSize: '0.85rem' }}>
              Crie estudos bíblicos e compartilhe com sua comunidade.
            </p>
            <p style={{ color: '#667eea', fontSize: '0.8rem', fontStyle: 'italic' }}>
              🔧 Funcionalidade em desenvolvimento — em breve!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'comunicados',
      icon: <Megaphone size={28} color="#fff" />,
      title: '📢 Comunicados',
      gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      desc: 'Envie avisos e comunicados para os membros',
      content: (
        <div>
          <h3 style={{ color: '#1a0a3e', marginBottom: '1rem' }}>📢 Comunicados</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Envie comunicados importantes para todos os membros da sua igreja.
            Avisos de cultos, eventos especiais, campanhas de oração e muito mais.
          </p>
          <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
            <Megaphone size={40} style={{ color: '#ccc', marginBottom: '0.5rem' }} />
            <p style={{ color: '#667eea', fontSize: '0.8rem', fontStyle: 'italic' }}>
              🔧 Funcionalidade em desenvolvimento — em breve!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'agenda',
      icon: <Calendar size={28} color="#fff" />,
      title: '📅 Agenda da Igreja',
      gradient: 'linear-gradient(135deg, #00bcd4, #0097a7)',
      desc: 'Organize cultos, eventos e reuniões',
      content: (
        <div>
          <h3 style={{ color: '#1a0a3e', marginBottom: '1rem' }}>📅 Agenda da Igreja</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Organize a programação da sua igreja. Cultos, células, ensaios, reuniões de liderança
            e eventos especiais — tudo em um calendário.
          </p>
          <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
            <Calendar size={40} style={{ color: '#ccc', marginBottom: '0.5rem' }} />
            <p style={{ color: '#667eea', fontSize: '0.8rem', fontStyle: 'italic' }}>
              🔧 Funcionalidade em desenvolvimento — em breve!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'relatorios',
      icon: <BarChart3 size={28} color="#fff" />,
      title: '📊 Relatórios',
      gradient: 'linear-gradient(135deg, #ff9800, #f57c00)',
      desc: 'Veja estatísticas e relatórios da sua igreja',
      content: (
        <div>
          <h3 style={{ color: '#1a0a3e', marginBottom: '1rem' }}>📊 Relatórios</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Acompanhe o crescimento da sua igreja com relatórios detalhados.
            Membros ativos, frequência, dízimos, ofertas e muito mais.
          </p>
          <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
            <BarChart3 size={40} style={{ color: '#ccc', marginBottom: '0.5rem' }} />
            <p style={{ color: '#667eea', fontSize: '0.8rem', fontStyle: 'italic' }}>
              🔧 Funcionalidade em desenvolvimento — em breve!
            </p>
          </div>
        </div>
      ),
    },
  ];

  const activeData = sections.find(s => s.id === activeSection);

  return (
    <div style={{ maxWidth: 650, margin: '0 auto', padding: '1rem 0.5rem', minHeight: '80vh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a3e 0%, #2d1b69 50%, #4a1a8e 100%)',
        borderRadius: 20, padding: '1.5rem', color: '#fff', marginBottom: '1.5rem',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(218,165,32,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -15, left: -15, width: 60, height: 60, borderRadius: '50%', background: 'rgba(102,126,234,0.1)' }} />
        <ShieldCheck size={36} color="#daa520" style={{ marginBottom: '0.5rem' }} />
        <h1 style={{ margin: '0 0 0.3rem', fontSize: '1.3rem', fontWeight: 800 }}>
          Sala de Gestão do Pastor
        </h1>
        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
          Bem-vindo(a), Pastor(a) {user?.full_name?.split(' ')[0]}! 🙏
        </p>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', opacity: 0.6 }}>
          Gerencie sua igreja com sabedoria e amor
        </p>
      </div>

      {/* Versículo */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(218,165,32,0.08), rgba(102,126,234,0.08))',
        borderRadius: 14, padding: '1rem', marginBottom: '1.5rem', textAlign: 'center',
        border: '1px solid rgba(218,165,32,0.2)',
      }}>
        <p style={{ fontSize: '0.82rem', color: '#555', fontStyle: 'italic', margin: 0 }}>
          📖 "Apascentai o rebanho de Deus que está entre vós, tendo cuidado dele,
          não por força, mas voluntariamente; nem por torpe ganância, mas de ânimo pronto." — 1 Pedro 5:2
        </p>
      </div>

      {/* Section detail or grid */}
      {activeSection && activeData ? (
        <div>
          <button onClick={() => setActiveSection(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 6, marginBottom: '1rem', color: '#667eea', fontWeight: 600,
          }}>
            <ArrowLeft size={18} /> Voltar
          </button>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '1.5rem',
            border: '1px solid #eee', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}>
            {activeData.content}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {sections.map(section => (
            <div key={section.id} onClick={() => setActiveSection(section.id)} style={{
              background: '#fff', borderRadius: 16, padding: '1rem', cursor: 'pointer',
              border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: section.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem',
              }}>
                {section.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', marginBottom: 4 }}>
                {section.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#888', lineHeight: 1.4 }}>
                {section.desc}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exit button */}
      <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/dashboard')} style={{
          padding: '0.7rem 2rem', borderRadius: 25, border: '2px solid #e74c3c',
          background: 'transparent', color: '#e74c3c', fontWeight: 700, fontSize: '0.9rem',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <ArrowLeft size={18} /> Sair da Sala de Gestão
        </button>
      </div>
    </div>
  );
}
