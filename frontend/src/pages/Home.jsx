import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import { HandHeart, Radio, Users, ShieldAlert, MessageCircle, BookOpen, Music, Flame, ArrowRight, Check } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

const FEATURES = [
  { emoji: '🙏', label: 'Orações', path: '/oracoes', color: '#daa520' },
  { emoji: '🔴', label: 'Ao Vivo', path: '/ao-vivo', color: '#e74c3c' },
  { emoji: '💬', label: 'Chat Pastoral', path: '/chat-pastoral', color: '#8e44ad' },
  { emoji: '📖', label: 'IA Bíblica', path: '/ia-biblica', color: '#3498db' },
  { emoji: '🎵', label: 'Música', path: '/musica', color: '#9b59b6' },
  { emoji: '🔥', label: 'Consagração', path: '/consagracao', color: '#e67e22' },
  { emoji: '👥', label: 'Grupos', path: '/grupos', color: '#1abc9c' },
  { emoji: '📸', label: 'Mural', path: '/mural', color: '#f39c12' },
];

const TESTIMONIES_DEMO = [
  {
    id: '1',
    author_name: 'Maria Silva',
    content: 'Encontrei paz e comunidade nesta plataforma. Minhas orações foram ouvidas e respondidas.',
    avatar_url: 'https://i.pravatar.cc/100?u=maria',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    author_name: 'João Santos',
    content: 'A IA Bíblica me ajudou a entender melhor as escrituras e fortalecer minha fé diariamente.',
    avatar_url: 'https://i.pravatar.cc/100?u=joao',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '3',
    author_name: 'Ana Costa',
    content: 'Encontrei minha igreja local e agora sou membro ativo da comunidade cristã online e presencial.',
    avatar_url: 'https://i.pravatar.cc/100?u=ana',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { liveStreams } = useWebSocket();
  const [dailyVerse, setDailyVerse] = useState(null);
  const [recentTestimonies, setRecentTestimonies] = useState(TESTIMONIES_DEMO);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpPhase, setHelpPhase] = useState('initial');

  useEffect(() => {
    // Get verse of the day
    const verses = [
      { text: 'Onde dois ou três estiverem reunidos em meu nome, ali estou eu no meio deles.', ref: 'Mateus 18:20' },
      { text: 'Tudo posso naquele que me fortalece.', ref: 'Filipenses 4:13' },
      { text: 'O Senhor é meu pastor; nada me faltará.', ref: 'Salmos 23:1' },
      { text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.', ref: 'João 3:16' },
      { text: 'Confie no Senhor de todo o seu coração e não se apoie no seu próprio entendimento.', ref: 'Provérbios 3:5' },
    ];
    const today = new Date().getDate();
    setDailyVerse(verses[today % verses.length]);

    // Fetch recent testimonies
    fetchRecentTestimonies();
  }, []);

  const fetchRecentTestimonies = async () => {
    try {
      const res = await fetch(`${API}/feed?limit=3&category=testemunho`);
      const data = await res.json();
      if (data.posts && data.posts.length > 0) {
        setRecentTestimonies(data.posts);
      }
    } catch (err) {
      console.error('Error fetching testimonies:', err);
    }
  };

  const handleHelpRequest = (phase) => {
    setHelpPhase(phase);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)', minHeight: '100vh', color: '#fff', paddingBottom: '2rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #daa520 0%, #f4c542 50%, #c0981f 100%)',
        padding: '3rem 1rem',
        textAlign: 'center',
        color: '#1a0a3e',
      }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 700, margin: '0 0 1rem 0', textShadow: '0 2px 4px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>
          {String.fromCharCode(128591)} Sigo com Fé
        </h1>
        <p style={{ fontSize: '1.1rem', margin: '0 auto 1.5rem', opacity: 0.95, maxWidth: '600px' }}>
          {t('home.subtitle', 'Ore, conecte-se e fortaleça sua fé com milhares de irmãos ao redor do mundo.')}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/mural" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '0.8rem 2rem',
                borderRadius: 25,
                border: 'none',
                background: '#1a0a3e',
                color: '#daa520',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2d1240';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1a0a3e';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                Explorar Comunidade <ArrowRight size={18} />
              </button>
            </Link>
          ) : (
            <>
              <Link to="/cadastro" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '0.8rem 2rem',
                  borderRadius: 25,
                  border: 'none',
                  background: '#1a0a3e',
                  color: '#daa520',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2d1240';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1a0a3e';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  {t('nav.register', 'Cadastrar')} <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '0.8rem 2rem',
                  borderRadius: 25,
                  border: '2px solid #1a0a3e',
                  background: 'transparent',
                  color: '#1a0a3e',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(26,10,62,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  {t('nav.login', 'Entrar')}
                </button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Verse of the Day */}
      {dailyVerse && (
        <section style={{ maxWidth: '900px', margin: '-3rem auto 3rem', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 16,
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✨</div>
            <p style={{ fontSize: '1.3rem', fontStyle: 'italic', margin: '0 0 1rem', lineHeight: 1.6 }}>
              "{dailyVerse.text}"
            </p>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 600 }}>— {dailyVerse.ref}</div>
          </div>
        </section>
      )}

      {/* Live Streams Banner */}
      {liveStreams && liveStreams.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#e74c3c', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
            🔴 Ao Vivo Agora
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {liveStreams.map(stream => (
              <div
                key={stream.streamId}
                onClick={() => navigate(`/directo?watch=${stream.streamId}`)}
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                  borderRadius: 14,
                  padding: '1rem',
                  cursor: 'pointer',
                  border: '2px solid #e74c3c',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(231,76,60,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#daa520', margin: '0 auto 0.75rem', overflow: 'hidden', border: '3px solid #e74c3c' }}>
                    {stream.userAvatar ? <img src={stream.userAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>}
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{stream.userName || 'Ao Vivo'}</div>
                  <div style={{ background: '#e74c3c', borderRadius: 8, padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block', animation: 'pulse 1.5s infinite' }}>
                    🔴 DIRECTO
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>👁 {stream.viewerCount || 0}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>Explore as Principais Funcionalidades</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {FEATURES.map(feature => (
            <Link key={feature.path} to={feature.path} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(218,165,32,0.1), rgba(218,165,32,0.05))',
                borderRadius: 14,
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                border: '2px solid rgba(218,165,32,0.2)',
                transition: 'all 0.3s',
                color: '#fff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = feature.color;
                e.currentTarget.style.background = `linear-gradient(135deg, ${feature.color}22, ${feature.color}11)`;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 20px ${feature.color}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(218,165,32,0.2)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(218,165,32,0.1), rgba(218,165,32,0.05))';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{feature.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{feature.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Testimonies */}
      {recentTestimonies.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>Testemunhos Recentes</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {recentTestimonies.slice(0, 3).map(testimony => (
              <div
                key={testimony.id}
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  borderRadius: 14,
                  padding: '1.5rem',
                  borderLeft: '4px solid #daa520',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <img
                    src={testimony.author_avatar || `https://i.pravatar.cc/100?u=${testimony.author_name}`}
                    alt=""
                    style={{ width: 40, height: 40, borderRadius: '50%', marginRight: '0.75rem', objectFit: 'cover', background: '#daa520' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{testimony.author_name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Há alguns dias</div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9 }}>
                  "{testimony.content}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>Por Que Escolher Sigo com Fé?</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}>
          {[
            { icon: '🌍', title: 'Comunidade Global', desc: 'Conecte-se com cristãos de todo o mundo' },
            { icon: '🔐', title: 'Seguro e Privado', desc: 'Seus dados estão sempre protegidos' },
            { icon: '⚡', title: 'Totalmente Grátis', desc: 'Acesso completo sem custos ocultos' },
            { icon: '📱', title: 'Mobile First', desc: 'Funciona perfeitamente em seu telemóvel' },
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: 14,
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(218,165,32,0.2)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Pastors */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        margin: '3rem 0',
        padding: '3rem 1rem',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Para Pastores</h2>
        <p style={{ fontSize: '1rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.9 }}>
          Ferramentas completas para gerenciar sua congregação, finanças, campanhas e muito mais.
        </p>
        <Link to="/cadastro" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '0.8rem 2rem',
            borderRadius: 25,
            border: 'none',
            background: 'linear-gradient(135deg, #daa520, #f4c542)',
            color: '#1a0a3e',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(218,165,32,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            Cadastre Sua Igreja
          </button>
        </Link>
      </section>

      {/* Help CTA */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>Precisa de Ajuda?</h2>
        <div style={{
          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          borderRadius: 16,
          padding: '2rem',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>
            Você não está sozinho. Nossa comunidade está aqui para ajudar você.
          </p>
          <button
            onClick={() => setShowHelpModal(true)}
            style={{
              padding: '0.8rem 2rem',
              borderRadius: 25,
              border: 'none',
              background: '#1a0a3e',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
            Pedir Ajuda
          </button>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ textAlign: 'center', padding: '2rem 1rem', borderTop: '1px solid rgba(218,165,32,0.2)' }}>
        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          {t('footer', '© 2026 Sigo com Fé - Tecnologia a serviço do Reino')}
        </p>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
