import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../context/WebSocketContext';
import { HandHeart, Radio, MapPin, LayoutDashboard, Heart, BookOpen, Baby, Church, Newspaper, Sparkles, Users, CheckCircle, ShieldAlert } from 'lucide-react';

function getVersiculoDoDia(verses) {
  const hoje = new Date();
  const idx = (hoje.getFullYear() * 366 + hoje.getMonth() * 31 + hoje.getDate()) % verses.length;
  return verses[idx];
}

export default function Home() {
  const { totalChurchesPraying } = useWebSocket();
  const [loaded, setLoaded] = useState(false);
  const [helpSelected, setHelpSelected] = useState(null);
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

        <h1 className="hero__title">{t('brand')}</h1>
        <p className="hero__subtitle">{t('home.subtitle')}</p>

        <div className="hero__verse">
          <span className="hero__verse-text">"{versiculo.text}"</span>
          <span className="hero__verse-ref">— {versiculo.ref}</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/cadastro" className="btn btn-primary btn-lg">{t('home.startNow')}</Link>
          <Link to="/oracoes" className="btn btn-outline btn-lg" style={{ borderColor: '#f4d03f', color: '#f4d03f' }}>
            {t('home.seePrayerRequests')}
          </Link>
        </div>

        <div className="hero__stats">
          {totalChurchesPraying > 0 && (
            <div className="hero__stat">
              <Radio size={18} style={{ color: '#ff4444' }} />
              <strong>{t('home.churchPraying', { count: totalChurchesPraying })}</strong>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="card feature-card">
          <div className="feature-card__icon"><HandHeart size={48} style={iconStyle} /></div>
          <h3>{t('home.featurePrayers')}</h3>
          <p>{t('home.featurePrayersDesc')}</p>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><Radio size={48} style={{ color: '#e74c3c', strokeWidth: 1.5 }} /></div>
          <h3>{t('home.featureLive')}</h3>
          <p>{t('home.featureLiveDesc')}</p>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><MapPin size={48} style={iconStyle} /></div>
          <h3>{t('home.featureMap')}</h3>
          <p>{t('home.featureMapDesc')}</p>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><LayoutDashboard size={48} style={iconStyle} /></div>
          <h3>{t('home.featureDashboard')}</h3>
          <p>{t('home.featureDashboardDesc')}</p>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><Newspaper size={48} style={iconStyle} /></div>
          <h3>{t('home.featureMural')}</h3>
          <p>{t('home.featureMuralDesc')}</p>
          <Link to="/mural" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>{t('home.explore')}</Link>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><Baby size={48} style={{ color: '#e74c3c', strokeWidth: 1.5 }} /></div>
          <h3>{t('home.featureKids')}</h3>
          <p>{t('home.featureKidsDesc')}</p>
          <Link to="/kids" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>{t('home.explore')}</Link>
        </div>
        <div className="card feature-card">
          <div className="feature-card__icon"><Church size={48} style={goldIcon} /></div>
          <h3>{t('home.featureChurch')}</h3>
          <p>{t('home.featureChurchDesc')}</p>
          <Link to="/cadastrar-igreja" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>{t('home.registerBtn')}</Link>
        </div>

        {/* Help card — same size as others */}
        <div className="card feature-card feature-card--help">
          <div className="feature-card__icon"><ShieldAlert size={48} style={{ color: '#e74c3c', strokeWidth: 1.5 }} /></div>
          <h3>{t('home.helpTitle')}</h3>
          <p>{t('home.helpSubtitle')}</p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => setHelpSelected('open')}>
            {t('home.helpBtn')}
          </button>
        </div>
      </section>

      {/* Help modal overlay */}
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
