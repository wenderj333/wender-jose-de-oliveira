import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSwitcher';

const MEMBERS = [
  { name: 'Verena', country: 'DE', msg: 'Aqui posso estudar e meditar mais em Deus!', color: '#1877F2' },
  { name: 'Wender', country: 'DE', msg: 'Uma rede onde posso estar com minha familia e meus filhos em seguranca!', color: '#42B72A' },
  { name: 'Thiago', country: 'BR', msg: 'Tenho certeza que minha vida sera abencada nesta rede!', color: '#E65C00' },
  { name: 'Jucilaine', country: 'DE', msg: 'Estou gostando, tem pessoas muito amaveis que nos ajudam!', color: '#6C47D4' },
  { name: 'Nayane', country: 'BR', msg: 'Que alegria poder ter uma rede social crista!', color: '#C9A96E' },
  { name: 'Paula', country: 'ES', msg: 'Que experiencia saber das coisas de Deus!', color: '#E91E8C' },
  { name: 'Elia', country: 'DE', msg: 'Aqui posso conhecer mais de Deus, que bom!', color: '#9C27B0' },
];

export default function Landing() {
  const { t } = useTranslation();
  const [biblePhoto, setBiblePhoto] = useState('/avatar2.jpg');
  const memberPhotos = {0:'/avatar1.jpg',1:'/avatar3.jpg',2:'/avatar4.jpg',3:'/avatar5.jpg',4:'/avatar6.jpg',5:'/avatar7.jpg',6:'/avatar8.jpg'};
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [activeMemberUpload, setActiveMemberUpload] = useState(null);
  const bibleInputRef = useRef();
  const memberInputRef = useRef();

  const handleBiblePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBiblePhoto(ev.target.result);
      localStorage.setItem('scf_bible', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMemberPhoto = (e) => {
    const file = e.target.files[0];
    if (!file || activeMemberUpload === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMemberPhotos(prev => {
        const updated = { ...prev, [activeMemberUpload]: ev.target.result };
        localStorage.setItem('scf_members', JSON.stringify(updated));
        return updated;
      });
      setActiveMemberUpload(null);
    };
    reader.readAsDataURL(file);
  };

  const openMemberUpload = (idx) => {
    setActiveMemberUpload(idx);
    setTimeout(() => memberInputRef.current?.click(), 100);
  };

  const positions = [
    { top: 320, left: 0 },
    { top: 320, left: 60 },
    { top: 320, left: 120 },
    { top: 320, left: 180 },
    { top: 320, left: 240 },
    { top: 320, left: 300 },
    { top: 320, left: 360 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Nunito, Segoe UI, sans-serif', cursor: 'url(data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="5" cy="5" r="4" fill="gray"/></svg>) 5 5, auto' }}>
      <nav style={{ background: 'white', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, overflowX:'hidden', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src='/logo.jpg' style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1877F2', fontFamily: 'Georgia, serif' }}>Sigo com Fé</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSelector variant="light" />
          <Link to="/login" style={{ padding: '8px 16px', borderRadius: 6, border: '1.5px solid #1877F2', color: '#1877F2', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>{t('landing.loginShort')}</Link>
          <Link to="/register" style={{ padding: '8px 16px', borderRadius: 6, background: '#42B72A', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>{t('landing.register')}</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', minHeight: 'calc(100vh - 56px)', gap: 40 }}>
        <div style={{ flex: 1, paddingTop: 40, paddingBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 700, color: '#1c1c1c', lineHeight: 1.2, marginBottom: 12, letterSpacing: -0.5 }}>
            {t('landing.headline1')}<br />
            <span style={{ color: '#1c1c1c' }}>{t('landing.headline2')}</span>
          </h1>
          <p style={{ fontSize: '1rem', color: '#555', marginBottom: 32, lineHeight: 1.6, maxWidth: 420 }}>{t('landing.subtitle')}</p>

          <div style={{ position: 'relative', width: 380, height: 430 }}>
            <div onClick={() => bibleInputRef.current?.click()} style={{ position: 'absolute', left: 60, top: 20, width: 220, height: 300, borderRadius: 16, background: biblePhoto ? 'transparent' : 'linear-gradient(135deg, #e8f0fe, #c8d8f8)', border: biblePhoto ? 'none' : '3px dashed #1877F2', overflowX:'hidden', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: 2 }}>
              {true
                ? <img src={'/avatar2.jpg'} alt='Biblia' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <><div style={{ fontSize: '3rem', marginBottom: 8 }}>B</div><div style={{ fontSize: '0.8rem', color: '#1877F2', fontWeight: 700, textAlign: 'center', padding: '0 16px' }}>Clica para adicionar foto da Biblia</div></>
              }
              <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>C</div>
            </div>
            <input ref={bibleInputRef} type="file" accept="image/*" onChange={handleBiblePhoto} style={{ display: 'none' }} />
            <div style={{ position: 'absolute', left: 300, top: 20, width: 220, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'white', borderRadius: 10, padding: '10px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderLeft: '3px solid #1877F2' }}>
                <p style={{ fontSize: '0.82rem', color: '#1c1c1c', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>{t('landing.msg1')}</p>
              </div>
              <div style={{ background: 'white', borderRadius: 10, padding: '10px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderLeft: '3px solid #42B72A' }}>
                <p style={{ fontSize: '0.82rem', color: '#1c1c1c', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>{t('landing.msg2')}</p>
              </div>
              <div style={{ background: 'white', borderRadius: 10, padding: '10px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderLeft: '3px solid #C9A96E' }}>
                <p style={{ fontSize: '0.82rem', color: '#1c1c1c', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>{t('landing.msg3')}</p>
              </div>
            </div>

            {MEMBERS.map((m, i) => (
              <div key={i} style={{ position: 'absolute', top: positions[i].top, left: positions[i].left, zIndex: 3 }} onMouseEnter={() => setActiveTooltip(i)} onMouseLeave={() => setActiveTooltip(null)}>
                <div onClick={() => openMemberUpload(i)} style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid ' + m.color, background: memberPhotos[i] ? 'transparent' : m.color, overflowX:'hidden', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', position: 'relative' }}>
                  {memberPhotos[i]
                    ? <img src={memberPhotos[i]} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700 }}>{m.name.charAt(0)}</span>
                  }
                </div>
                {activeTooltip === i && (
                  <div style={{ position: 'absolute', top: -85, left: '50%', transform: 'translateX(-50%)', background: 'white', border: '1px solid #e0e0e0', borderRadius: 10, padding: '8px 12px', width: 180, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1c1c1c', marginBottom: 3 }}>{m.name} {m.country}</div>
                    <div style={{ fontSize: '0.7rem', color: '#555', fontStyle: 'italic', lineHeight: 1.4 }}>{m.msg}</div>
                  </div>
                )}
              </div>
            ))}
            <input ref={memberInputRef} type="file" accept="image/*" onChange={handleMemberPhoto} style={{ display: 'none' }} />
          </div>
        </div>

        <div style={{ width: 400, flexShrink: 0, paddingTop: 40, paddingBottom: 40 }}>
          <div style={{ background: 'white', borderRadius: 8, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', marginBottom: 16 }}>
            <input type="email" placeholder={t('landing.email') || 'Email'} style={{ width: '100%', padding: '0.9rem 1rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem', fontFamily: 'inherit', marginBottom: '0.7rem', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#1877F2'} onBlur={e => e.target.style.borderColor = '#ccc'} />
            <input type="password" placeholder={t('landing.password') || 'Senha'} style={{ width: '100%', padding: '0.9rem 1rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem', fontFamily: 'inherit', marginBottom: '0.7rem', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#1877F2'} onBlur={e => e.target.style.borderColor = '#ccc'} />
            <Link to="/login" style={{ display: 'block', width: '100%', background: '#1877F2', color: 'white', padding: '0.9rem', borderRadius: 6, fontSize: '1.1rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center', marginBottom: '0.8rem' }}>{t('landing.loginShort')}</Link>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Link to="/login" style={{ color: '#1877F2', fontSize: '0.85rem', textDecoration: 'none' }}>{t('landing.haveAccount')}</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0.8rem 0' }}>
              <div style={{ flex: 1, height: 1, background: '#ccc' }} />
              <span style={{ color: '#888', fontSize: '0.85rem' }}>{t('landing.or') || 'ou'}</span>
              <div style={{ flex: 1, height: 1, background: '#ccc' }} />
            </div>
            <a href="/api/auth/google" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', background: 'white', color: '#333', padding: '0.85rem', borderRadius: 6, fontSize: '1rem', fontWeight: 700, textDecoration: 'none', border: '1px solid #ddd', marginBottom: '0.8rem', boxSizing: 'border-box' }}>
              <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Entrar com Google
            </a>
            <Link to="/register" style={{ display: 'block', width: 'fit-content', margin: '0 auto', background: '#42B72A', color: 'white', padding: '0.8rem 2rem', borderRadius: 6, fontSize: '1rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>{t('landing.createFree')}</Link>
          </div>
          <div style={{ background: 'white', borderRadius: 8, padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.82rem', color: '#555', fontStyle: 'italic', lineHeight: 1.6 }}>{t('landing.verse')}</p>
          </div>
        </div>
      </div>

      <footer style={{ background: 'white', padding: '1.5rem', textAlign: 'center', borderTop: '1px solid #e4e6eb', fontSize: '0.78rem', color: '#888' }}>
        <strong style={{ color: '#1877F2' }}>Sigo com Fé</strong> - {t('landing.tagline')} - {new Date().getFullYear()}
      </footer>
    </div>
  );
}
