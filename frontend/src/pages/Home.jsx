import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext'; // NEW IMPORT
import { HandHeart, Radio, Newspaper, Users, CheckCircle, ShieldAlert, MessageCircle, Music, UserPlus, Heart, ArrowRight, ThumbsUp, MessageSquare } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || ''; // NEW CONSTANT
const API = `${API_BASE}/api`; // NEW CONSTANT

function getVersiculoDoDia(verses) {
  const hoje = new Date();
  const idx = (hoje.getFullYear() * 366 + hoje.getMonth() * 31 + hoje.getDate()) % verses.length;
  return verses[idx];
}

export default function Home() {
  const { totalChurchesPraying } = useWebSocket();
  const { user, token } = useAuth(); // NEW DESTRUCTURING
  const [loaded, setLoaded] = useState(false);
  const [helpSelected, setHelpSelected] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  // New state for posts
  const [recentPosts, setRecentPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  const [helpForm, setHelpForm] = useState({ name: '', contact: '', message: '' });
  const [helpSent, setHelpSent] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [memberCount, setMemberCount] = useState(68);
  const { t } = useTranslation();
  const verses = t('home.verses', { returnObjects: true });
  const versiculo = getVersiculoDoDia(verses);

  // Helper: get Cloudinary media URL with transformations
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return url;
    if (!url.includes('res.cloudinary.com')) return url; // Already processed or external

    const parts = url.split('/upload/');
    if (parts.length === 2) {
      // Add transformations for quality and format
      // For images, optimize, for videos, keep original to avoid re-encoding issues
      const transformations = url.startsWith('https://res.cloudinary.com/degxiuf43/image') ? 'f_auto,q_auto/' : '';
      return `${parts[0]}/upload/${transformations}${parts[1]}`;
    }
    return url;
  };

  // Helper: format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  useEffect(() => {
    const ti = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(ti);
  }, []);

  // Fetch recent testimony posts
  useEffect(() => {
    async function fetchRecentTestimonies() {
      setLoadingPosts(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/feed?category=testemunho&limit=3`, { headers });
        if (res.ok) {
          const data = await res.json();
          setRecentPosts(data.posts || []);
        } else {
          console.error('Failed to fetch recent testimonies:', res.status);
          setRecentPosts([]);
        }
      } catch (error) {
        console.error('Error fetching recent testimonies:', error);
        setRecentPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    }
    fetchRecentTestimonies();
  }, [token]);


  // Welcome popup for non-logged visitors (after 5 seconds)
  useEffect(() => {
    if (user) return;
    const timer = setTimeout(() => setShowWelcomePopup(true), 5000);
    return () => clearTimeout(timer);
  }, [user]);

  // Fetch member count
  useEffect(() => {
    fetch(`${API}/profile/member-count`)
      .then(r => r.json())
      .then(d => { if (d.count) setMemberCount(d.count); })
      .catch(() => {});
  }, []);

  const helpOptions = [
    { key: 'seeThings', label: t('home.helpSeeThings') },
    { key: 'hearThings', label: t('home.helpHearThings') },
    { key: 'feelAlone', label: t('home.helpFeelAlone') },
    { key: 'needPrayer', label: t('home.helpNeedPrayer') },
    { key: 'anxious', label: t('home.helpAnxious') },
    { key: 'depressed', label: t('home.helpDepressed') },
  ];

  const submitHelp = async () => {
    try {
      await fetch('/api/help-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: helpSelected, ...helpForm }),
      });
    } catch (e) { /* ok */ }
    setHelpSent(true);
    setTimeout(() => { setHelpSent(false); setHelpSelected(null); setHelpForm({ name: '', contact: '', message: '' }); }, 5000);
  };

  const iconStyle = { color: '#3b5998', strokeWidth: 1.5 };

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
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
          <img src="/logo.jpg" alt="Sigo com Fé" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }} />
        </div>

        <h1 className="hero__title">A Rede Social Cristã feita para você</h1>
        <p className="hero__subtitle" style={{ fontSize: '1.15rem', maxWidth: 520, margin: '0 auto', opacity: 0.9 }}>
          Conecte-se com cristãos do mundo todo. Oração, louvor, amizades e propósito — tudo em um só lugar.
        </p>

        {/* Versículo do dia */}
        <div className="hero__verse">
          <span className="hero__verse-text">"{versiculo.text}"</span>
          <span className="hero__verse-ref">— {versiculo.ref}</span>
          <button onClick={async () => {
            const shareText = `✝️ ${versiculo.text} — ${versiculo.ref}\n\nSigo com Fé - sigocomfe.vercel.app`;
            if (navigator.share) {
              try { await navigator.share({ title: 'Versículo do Dia', text: shareText }); } catch (e) {}
            } else {
              try { await navigator.clipboard.writeText(shareText); setShareCopied(true); setTimeout(() => setShareCopied(false), 2500); } catch (e) {}
            }
          }} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#f4d03f', borderRadius: 20, padding: '4px 12px', fontSize: '0.75rem',
            cursor: 'pointer', marginTop: 6, backdropFilter: 'blur(4px)',
          }}>
            {shareCopied ? '✅ Copiado!' : '📤 Compartilhar'}
          </button>
        </div>

        {/* CTA Principal */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Link to="/cadastro" className="btn btn-primary btn-lg" style={{
            fontSize: '1.2rem',
            padding: '1rem 2.5rem',
            fontWeight: 700,
            letterSpacing: '0.3px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <UserPlus size={22} /> Criar minha conta grátis
          </Link>
          <span style={{ fontSize: '0.85rem', opacity: 0.7, color: '#f4d03f' }}>
            ✨ É rápido, gratuito e sem compromisso
          </span>
        </div>

        {showInstall && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button onClick={handleInstall} className="btn btn-sm" style={{
              background: 'rgba(218,165,32,0.15)',
              color: '#f4d03f',
              border: '1px solid rgba(218,165,32,0.4)',
              borderRadius: 20,
              padding: '6px 18px',
              fontSize: 13,
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}>
              📲 {t('home.installApp', { defaultValue: 'Instalar App' })}
            </button>
          </div>
        )}

        <div className="hero__stats">
          {totalChurchesPraying > 0 && (
            <div className="hero__stat">
              <Radio size={18} style={{ color: '#ff4444' }} />
              <strong>{t('home.churchPraying', { count: totalChurchesPraying })}</strong>
            </div>
          )}
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'rgba(59,89,152,0.03)' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: '#2c3e50' }}>Como funciona?</h2>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1rem' }}>Três passos simples para transformar sua caminhada</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' }}>
          {[
            { step: '1', icon: <UserPlus size={36} style={iconStyle} />, title: 'Crie sua conta', desc: 'Rápido e gratuito. Leva menos de 1 minuto.' },
            { step: '2', icon: <Users size={36} style={iconStyle} />, title: 'Conecte-se', desc: 'Encontre irmãos na fé, ore junto e compartilhe.' },
            { step: '3', icon: <Heart size={36} style={{ color: '#e74c3c', strokeWidth: 1.5 }} />, title: 'Cresça na fé', desc: 'Fortaleça sua vida espiritual em comunidade.' },
          ].map((item) => (
            <div key={item.step} style={{
              flex: '1 1 200px',
              maxWidth: 240,
              padding: '1.5rem 1rem',
              borderRadius: 16,
              background: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              position: 'relative'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b5998, #5b8def)',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem'
              }}>{item.step}</div>
              {item.icon}
              <h3 style={{ fontSize: '1.1rem', margin: '0.75rem 0 0.5rem', color: '#2c3e50' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROVA SOCIAL ===== */}
      <section style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
          background: 'linear-gradient(135deg, rgba(59,89,152,0.08), rgba(91,141,239,0.08))',
          padding: '1rem 2rem', borderRadius: 16
        }}>
          <Users size={28} style={iconStyle} />
          <span style={{ fontSize: '1.1rem', color: '#2c3e50' }}>
            <strong style={{ fontSize: '1.5rem', color: '#3b5998' }}>{memberCount}+</strong> pessoas já fazem parte da rede
          </span>
        </div>
      </section>

      {/* ===== DEPOIMENTOS ===== */}
      <section style={{ padding: '2rem 1.5rem', textAlign: 'center', background: 'rgba(218,165,32,0.04)' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: '#2c3e50' }}>💬 O que dizem nossos membros</h2>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: 700, margin: '0 auto' }}>
          {[
            { name: 'Maria S.', city: 'São Paulo', text: 'Encontrei uma comunidade de oração incrível. Todos os dias alguém ora por mim!' },
            { name: 'Carlos E.', city: 'Lisboa', text: 'O Chat Pastoral me ajudou num momento muito difícil. Deus usou essa plataforma.' },
            { name: 'Ana R.', city: 'Madrid', text: 'Mesmo longe do Brasil, me sinto conectada com irmãos na fé. Amei!' },
          ].map((dep, i) => (
            <div key={i} style={{
              flex: '1 1 200px', maxWidth: 220, padding: '1rem', borderRadius: 14,
              background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              textAlign: 'left',
            }}>
              <p style={{ fontSize: '0.82rem', color: '#444', fontStyle: 'italic', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                "{dep.text}"
              </p>
              <div style={{ fontSize: '0.75rem', color: '#3b5998', fontWeight: 600 }}>
                — {dep.name}, {dep.city}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HISTÓRIAS INSPIRADORAS (Últimos Testemunhos do Mural) ===== */}
      <section style={{ padding: '2rem 1.5rem', background: 'rgba(218,165,32,0.04)' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: '#2c3e50', textAlign: 'center' }}>
          ✨ Histórias Inspiradoras
        </h2>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Veja os últimos testemunhos de fé da nossa comunidade
        </p>
        {loadingPosts ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Carregando histórias...</p>
        ) : recentPosts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Nenhuma história inspiradora ainda. Compartilhe a sua no <Link to="/mural" style={{ color: '#9b59b6', fontWeight: 600 }}>Mural</Link>!</p>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' }}>
            {recentPosts.map((post) => (
              <div key={post.id} style={{
                flex: '1 1 280px', maxWidth: 300, padding: '1.2rem', borderRadius: 14,
                background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                textAlign: 'left', display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.8rem' }}>
                  <img src={post.author_avatar || '/default-avatar.png'} alt="Avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#1a0a3e', fontSize: '0.9rem' }}>{post.author_display_name || post.author_name || 'Anônimo'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{formatDate(post.created_at)}</div>
                  </div>
                </div>
                {post.media_url && !post.audio_url && (
                  <div style={{ marginBottom: '0.8rem', borderRadius: 10, overflow: 'hidden' }}>
                    <img src={getMediaUrl(post.media_url)} alt="Post media" style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  </div>
                )}
                {post.audio_url && (
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 10,
                    padding: '0.5rem 0.8rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: '1.2rem', color: '#fff' }}>🎵</span>
                    <span style={{ fontSize: '0.75rem', color: '#fff' }}>Música anexa</span>
                  </div>
                )}
                <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5, flex: 1 }}>
                  {post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}
                </p>
                <Link to={`/mural#post-${post.id}`} style={{
                  marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: 4,
                  color: '#daa520', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
                }}>
                  Ver mais <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/mural" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            Ver todos os testemunhos <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ===== O QUE VOCÊ PODE FAZER ===== */}
      <section style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2c3e50' }}>🌟 Tudo o que você encontra aqui</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Uma plataforma completa para sua vida espiritual</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, maxWidth: 500, margin: '0 auto' }}>
          {[
            { emoji: '🙏', label: 'Pedidos de Oração', to: '/oracoes' },
            { emoji: '📻', label: 'Oração ao Vivo', to: '/ao-vivo' },
            { emoji: '💬', label: 'Chat com Pastor', to: '/chat-pastoral' },
            { emoji: '📖', label: 'IA Bíblica', to: '/ia-biblica' },
            { emoji: '🎵', label: 'Música Gospel', to: '/musica' },
            { emoji: '🔥', label: 'Consagração', to: '/consagracao' },
            { emoji: '👥', label: 'Grupos', to: '/grupos' },
            { emoji: '📰', label: 'Mural', to: '/mural' },
          ].map((item, i) => (
            <Link key={i} to={item.to} style={{
              padding: '0.8rem 0.5rem', borderRadius: 12, background: '#fff',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)', textDecoration: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'transform 0.2s',
            }}>
              <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
              <span style={{ fontSize: '0.75rem', color: '#333', fontWeight: 600 }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FEATURES (4 principais) ===== */}
      <section className="features">
        <div className="card feature-card">
          <div className="feature-card__icon"><HandHeart size={48} style={iconStyle} /></div>
          <h3>{t('home.featurePrayers')}</h3>
          <p>{t('home.featurePrayersDesc')}</p>
          <Link to="/oracoes" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
            Ver orações <ArrowRight size={14} />
          </Link>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><Newspaper size={48} style={iconStyle} /></div>
          <h3>{t('home.featureMural')}</h3>
          <p>{t('home.featureMuralDesc')}</p>
          <Link to="/mural" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
            {t('home.explore')} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><MessageCircle size={48} style={{ color: '#7c5cbf', strokeWidth: 1.5 }} /></div>
          <h3>Chat Pastoral</h3>
          <p>Converse com líderes e pastores. Acolhimento e orientação espiritual quando você precisar.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><Music size={48} style={{ color: '#e67e22', strokeWidth: 1.5 }} /></div>
          <h3>Música & Louvor</h3>
          <p>Louve e adore com a comunidade. Músicas que tocam o coração e elevam o espírito.</p>
        </div>
      </section>

      {/* ===== AJUDA (compacta) ===== */}
      <section style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: 500, margin: '0 auto', padding: '1.5rem',
          borderRadius: 16, background: 'linear-gradient(135deg, rgba(124,92,191,0.06), rgba(91,141,239,0.06))',
          border: '1px solid rgba(124,92,191,0.15)'
        }}>
          <ShieldAlert size={32} style={{ color: '#7c5cbf', marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#5b3d99', marginBottom: '0.25rem' }}>{t('home.helpTitle')}</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{t('home.helpSubtitle')}</p>
          <button className="btn btn-primary btn-sm" onClick={() => setHelpSelected('open')} style={{
            background: 'linear-gradient(135deg, #7c5cbf, #5b8def)', borderColor: '#7c5cbf'
          }}>
            {t('home.helpBtn')}
          </button>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section style={{
        padding: '3rem 1.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, #3b5998, #5b8def)',
        borderRadius: '24px 24px 0 0',
        margin: '0 -1rem'
      }}>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '0.5rem' }}>Entre na Rede Social Cristã</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', marginBottom: '1.5rem', maxWidth: 450, margin: '0 auto 1.5rem' }}>
          Sua jornada de fé não precisa ser solitária. Conecte-se, ore, louve e cresça com outros cristãos.
        </p>
        <Link to="/cadastro" className="btn btn-lg" style={{
          background: '#fff', color: '#3b5998', fontWeight: 700,
          fontSize: '1.15rem', padding: '1rem 2.5rem',
          borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }}>
          <UserPlus size={20} /> Criar minha conta grátis
        </Link>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
          Já tem conta? <Link to="/login" style={{ color: '#f4d03f', textDecoration: 'underline' }}>Entrar</Link>
        </p>
      </section>

      {/* ===== HELP MODAL ===== */}
      {helpSelected && (
        <div className="help-modal-overlay" onClick={() => { setHelpSelected(null); setHelpSent(false); }}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <button className="help-modal__close" onClick={() => { setHelpSelected(null); setHelpSent(false); }}>✕</button>
            <ShieldAlert size={32} style={{ color: '#7c5cbf', marginBottom: '0.5rem' }} />
            <h3 style={{ color: '#5b3d99', marginBottom: '0.25rem' }}>{t('home.helpTitle')}</h3>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>{t('home.helpSubtitle')}</p>

            {helpSent ? (
              <div style={{ background: '#d4edda', color: '#155724', padding: '1rem', borderRadius: '10px', fontWeight: 500 }}>
                {t('home.helpSent')}
              </div>
            ) : helpSelected === 'open' ? (
              <div className="help-modal__options">
                {helpOptions.map(opt => (
                  <button key={opt.key} className="help-option-btn" onClick={() => setHelpSelected(opt.key)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c5cbf, #5b8def)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '16px', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  {helpOptions.find(o => o.key === helpSelected)?.label}
                </div>
                <input type="text" placeholder={t('home.helpNamePlaceholder')} value={helpForm.name} onChange={e => setHelpForm(f => ({ ...f, name: e.target.value }))} className="help-input" />
                <input type="text" placeholder={t('home.helpContactPlaceholder')} value={helpForm.contact} onChange={e => setHelpForm(f => ({ ...f, contact: e.target.value }))} className="help-input" />
                <textarea placeholder={t('home.helpMessagePlaceholder')} value={helpForm.message} onChange={e => setHelpForm(f => ({ ...f, message: e.target.value }))} className="help-input" rows={3} />
                <button className="btn btn-primary" onClick={submitHelp} disabled={!helpForm.contact} style={{ background: 'linear-gradient(135deg, #7c5cbf, #5b8def)', borderColor: '#7c5cbf' }}>
                  {t('home.helpSend')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== WELCOME POPUP (non-logged visitors after 5s) ===== */}
      {showWelcomePopup && !user && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }} onClick={() => setShowWelcomePopup(false)}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '2rem 1.5rem',
            maxWidth: 380, width: '100%', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'popupSlideIn 0.4s ease-out',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{'\u{1F64F}'}</div>
            <h2 style={{ fontSize: '1.4rem', color: '#1a0a3e', margin: '0 0 0.5rem' }}>
              Bem-vindo {'à'} Rede Social Crist{'ã'}!
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.6, margin: '0 0 1rem' }}>
              <strong>{memberCount}+ crist{'ã'}os</strong> j{'á'} fazem parte do Sigo com F{'é'}. Ora{'çã'}o, louvor, amizades e muito mais.
              <br />Crie sua conta gr{'á'}tis em 30 segundos!
            </p>
            <Link to="/cadastro" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #3b5998, #5b8def)',
              color: '#fff', padding: '0.9rem 2rem', borderRadius: 12,
              fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(59,89,152,0.3)',
            }} onClick={() => setShowWelcomePopup(false)}>
              <UserPlus size={20} /> Criar conta gr{'á'}tis
            </Link>
            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.8rem', cursor: 'pointer' }}
              onClick={() => setShowWelcomePopup(false)}>
              Agora n{'ã'}o, quero explorar primeiro
            </p>
          </div>
        </div>
      )}

      {/* ===== STICKY TOP BAR (non-logged visitors) ===== */}
      {!user && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          background: 'linear-gradient(135deg, #1a0a3e, #3b5998)',
          color: '#fff', padding: '8px 16px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
          fontSize: '0.82rem', boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {'\u2728'} {versiculo.text.length > 60 ? versiculo.text.substring(0, 60) + '...' : versiculo.text}
          </span>
          <Link to="/cadastro" style={{
            background: '#f4d03f', color: '#1a0a3e', padding: '4px 14px',
            borderRadius: 20, fontWeight: 700, fontSize: '0.78rem',
            textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Criar conta {'\u2192'}
          </Link>
        </div>
      )}

      <style>{`
        @keyframes popupSlideIn {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
