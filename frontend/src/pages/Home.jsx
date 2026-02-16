import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../context/WebSocketContext';
import { HandHeart, Radio, Newspaper, Users, CheckCircle, ShieldAlert, MessageCircle, Music, UserPlus, Heart, ArrowRight } from 'lucide-react';

function getVersiculoDoDia(verses) {
  const hoje = new Date();
  const idx = (hoje.getFullYear() * 366 + hoje.getMonth() * 31 + hoje.getDate()) % verses.length;
  return verses[idx];
}

export default function Home() {
  const { totalChurchesPraying } = useWebSocket();
  const [loaded, setLoaded] = useState(false);
  const [helpSelected, setHelpSelected] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

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
  const { t } = useTranslation();
  const verses = t('home.verses', { returnObjects: true });
  const versiculo = getVersiculoDoDia(verses);

  useEffect(() => {
    const ti = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(ti);
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

        <h1 className="hero__title">Caminhe na fé com quem entende você</h1>
        <p className="hero__subtitle" style={{ fontSize: '1.15rem', maxWidth: 520, margin: '0 auto', opacity: 0.9 }}>
          Uma comunidade cristã onde você encontra oração, acolhimento e propósito. Juntos somos mais fortes.
        </p>

        {/* Versículo do dia */}
        <div className="hero__verse">
          <span className="hero__verse-text">"{versiculo.text}"</span>
          <span className="hero__verse-ref">— {versiculo.ref}</span>
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
            <strong style={{ fontSize: '1.5rem', color: '#3b5998' }}>42+</strong> membros já caminham na fé conosco
          </span>
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
        <h2 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '0.5rem' }}>Junte-se a nós</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', marginBottom: '1.5rem', maxWidth: 450, margin: '0 auto 1.5rem' }}>
          Sua jornada de fé não precisa ser solitária. Venha fazer parte dessa família.
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
    </div>
  );
}
