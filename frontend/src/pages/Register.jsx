import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, Mail, Lock, User, Heart, ShieldCheck, Music, Sparkles, Users, Clock3, Trophy } from 'lucide-react';
import { getChristianChatCopy } from '../i18n/christianChatCopy';

// Google Analytics conversion events
function trackSignUpEvent() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', { method: 'email' });
    window.gtag('event', 'login', { method: 'email' });
    console.log('✅ Google Analytics: sign_up & login events tracked');
  }
}

const REGISTER_STORY = {
  pt: { title: <>A verdadeira alegria começa <span style={{ color: '#b5801c' }}>com fé.</span></>, prayer: 'Oração e adoração', worship: 'Louvor que inspira', bible: 'Bíblia, amigos e esperança', free: 'Conta gratuita', community: 'Comunidade cristã', growing: 'Cada vez somos mais' },
  es: { title: <>La verdadera alegría comienza <span style={{ color: '#b5801c' }}>con fe.</span></>, prayer: 'Oración y adoración', worship: 'Alabanza que inspira', bible: 'Biblia, amigos y esperanza', free: 'Cuenta gratuita', community: 'Comunidad cristiana', growing: 'Cada vez somos más' },
  en: { title: <>True joy begins <span style={{ color: '#b5801c' }}>with faith.</span></>, prayer: 'Prayer and worship', worship: 'Worship that inspires', bible: 'Bible, friends and hope', free: 'Free account', community: 'Christian community', growing: 'More and more of us' },
  de: { title: <>Wahre Freude beginnt <span style={{ color: '#b5801c' }}>mit Glauben.</span></>, prayer: 'Gebet und Anbetung', worship: 'Lobpreis, der inspiriert', bible: 'Bibel, Freunde und Hoffnung', free: 'Kostenloses Konto', community: 'Christliche Gemeinschaft', growing: 'Wir werden immer mehr' },
  fr: { title: <>La vraie joie commence <span style={{ color: '#b5801c' }}>avec la foi.</span></>, prayer: 'Prière et adoration', worship: 'Louange qui inspire', bible: 'Bible, amis et espérance', free: 'Compte gratuit', community: 'Communauté chrétienne', growing: 'Nous sommes toujours plus nombreux' },
  ro: { title: <>Adevărata bucurie începe <span style={{ color: '#b5801c' }}>cu credință.</span></>, prayer: 'Rugăciune și închinare', worship: 'Închinare care inspiră', bible: 'Biblie, prieteni și speranță', free: 'Cont gratuit', community: 'Comunitate creștină', growing: 'Suntem din ce în ce mai mulți' },
  ru: { title: <>Истинная радость начинается <span style={{ color: '#b5801c' }}>с веры.</span></>, prayer: 'Молитва и поклонение', worship: 'Вдохновляющее прославление', bible: 'Библия, друзья и надежда', free: 'Бесплатный аккаунт', community: 'Христианское сообщество', growing: 'Нас становится всё больше' },
};

const REGISTER_PROOF = {
  pt: { quick: 'Leva menos de 1 minuto', free: 'Gratuita e segura', together: 'Oração, Bíblia e comunhão', duel: 'Guarde seus pontos e jogue o Duelo Bíblico com outros irmãos.' },
  es: { quick: 'Toma menos de 1 minuto', free: 'Gratis y segura', together: 'Oración, Biblia y comunión', duel: 'Guarda tus puntos y juega el Duelo Bíblico con otros hermanos.' },
  en: { quick: 'Takes less than 1 minute', free: 'Free and secure', together: 'Prayer, Bible and fellowship', duel: 'Save your points and play Bible Duel with other believers.' },
  de: { quick: 'Dauert weniger als 1 Minute', free: 'Kostenlos und sicher', together: 'Gebet, Bibel und Gemeinschaft', duel: 'Speichere deine Punkte und spiele das Bibelduell mit anderen Gläubigen.' },
  fr: { quick: 'Moins d’une minute suffit', free: 'Gratuit et sécurisé', together: 'Prière, Bible et communion', duel: 'Garde tes points et joue au Duel Biblique avec d’autres croyants.' },
  ro: { quick: 'Durează mai puțin de un minut', free: 'Gratuit și sigur', together: 'Rugăciune, Biblie și părtășie', duel: 'Păstrează-ți punctele și joacă Duelul Biblic cu alți credincioși.' },
  ru: { quick: 'Займёт меньше минуты', free: 'Бесплатно и безопасно', together: 'Молитва, Библия и общение', duel: 'Сохраняйте свои баллы и играйте в Библейскую дуэль с другими верующими.' },
};

export default function Register() {
  const { register, loginWithGoogle, loginWithFacebook, sendPhoneCode, verifyPhoneCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedNext = new URLSearchParams(location.search).get('next');
  const nextPage = requestedNext?.startsWith('/') ? requestedNext : '/';
  const { t, i18n } = useTranslation();
  const c = getChristianChatCopy(i18n.language);
  const language = i18n.language?.split('-')[0];
  const story = REGISTER_STORY[language] || REGISTER_STORY.pt;
  const proof = REGISTER_PROOF[language] || REGISTER_PROOF.pt;
  const cameFromDuel = nextPage === '/duelo-biblico';
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);


  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+55');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError(t('register.passwordError'));
    // avatar optional - user can add later
    try {
      await register(form.email, form.password, form.full_name, form.role, null);
      trackSignUpEvent();
      navigate(nextPage); // Navegar para a página inicial após o registo
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-page" style={{ minHeight: '100vh', padding: 'clamp(16px,4vw,48px)', background: 'radial-gradient(circle at 8% 12%,#f5ebd2 0,transparent 23%), linear-gradient(145deg,#fbfaf8 0%,#f1f3fa 58%,#fff 100%)' }}>
      <div className="register-layout" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(300px,1.1fr) minmax(360px,.9fr)', gap: 'clamp(30px,6vw,86px)', alignItems: 'center' }}>
      <aside className="register-story" style={{ color: '#231b3a' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#eee6fb', color: '#633da0', padding: '8px 13px', borderRadius: 99, fontWeight: 800, fontSize: 13 }}><Sparkles size={16}/> {c.brand}</span>
        <h2 style={{ fontSize: 'clamp(2.45rem,5vw,4.65rem)', lineHeight: .98, margin: '20px 0 16px', letterSpacing: '-.055em', maxWidth: 590 }}>{story.title}</h2>
        <p style={{ color: '#626b80', fontSize: '1.04rem', lineHeight: 1.65, margin: '0 0 27px', maxWidth: 540 }}>{c.signupDesc}</p>
        <div className="faith-collage" style={{ position: 'relative', minHeight: 392, maxWidth: 570, margin: '0 auto 18px' }}>
          <div style={{ position: 'absolute', left: 36, top: 26, width: '52%', height: 278, overflow: 'hidden', borderRadius: '28px 28px 65px 28px', background: 'linear-gradient(145deg,#271044,#6e3fa4)', boxShadow: '0 22px 45px rgba(53,30,87,.24)' }}><img src="/biblia-register.png" alt={story.bible} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .92 }}/><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(39,16,68,.62),transparent 65%)' }}/><span style={{ position: 'absolute', left: 16, bottom: 15, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 800, fontSize: 13 }}><Heart size={16} fill="currentColor"/> {story.prayer}</span></div>
          <div style={{ position: 'absolute', right: 24, top: 95, width: '42%', height: 210, padding: 13, borderRadius: 24, background: '#fff', boxShadow: '0 18px 36px rgba(35,27,58,.18)', transform: 'rotate(2deg)' }}><img src="/avatar7.jpg" alt={story.community} style={{ width: '100%', height: 137, objectFit: 'cover', borderRadius: 15 }}/><div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 11, color: '#55358a', fontWeight: 800, fontSize: 13 }}><Music size={17}/> {story.worship}</div></div>
          <div style={{ position: 'absolute', left: 0, bottom: 5, width: 154, height: 154, display: 'grid', placeItems: 'center', borderRadius: '50%', border: '7px solid #fff', background: 'linear-gradient(145deg,#e6bd50,#7242a7)', boxShadow: '0 13px 27px rgba(70,40,110,.22)', overflow: 'hidden' }}><img src="/avatar3.jpg" alt="Membro da comunidade Sigo com Fé" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/></div>
          <div style={{ position: 'absolute', right: 0, bottom: 8, display: 'flex', alignItems: 'center', gap: 9, padding: '12px 15px', borderRadius: 18, background: '#fff', boxShadow: '0 10px 25px rgba(35,27,58,.13)', color: '#5e3d95', fontWeight: 800, fontSize: 13 }}><BookOpen size={19} color="#b5801c"/> {story.bible}</div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#6b7486', fontSize: 13, fontWeight: 700 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><ShieldCheck size={16} color="#5d987a"/> {story.free}</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users size={16} color="#5d987a"/> {story.community}</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#5e3d95' }}><Users size={16} color="#5d987a"/> {story.growing}</span></div>
      </aside>
      <div className="card auth-card register-card" style={{ margin: 0, background: 'rgba(255,255,255,.94)', borderRadius: 26, border: '1px solid rgba(92,65,139,.12)', boxShadow: '0 24px 60px rgba(53,36,91,.14)', padding: 'clamp(24px,4vw,42px)' }}>
        <div className="auth-brand">
          <BookOpen size={40} style={{ color: 'var(--gold)' }} />
          <h1>{t('brand')}</h1>
          <p>{t('register.joinCommunity')}</p>
        </div>
        <div className="register-proof" aria-label={proof.free}>
          {cameFromDuel && <p className="register-duel-note"><Trophy size={16} /> {proof.duel}</p>}
          <div className="register-proof-items">
            <span><Clock3 size={15} /> {proof.quick}</span>
            <span><ShieldCheck size={15} /> {proof.free}</span>
            <span><BookOpen size={15} /> {proof.together}</span>
          </div>
        </div>
        {error && <p className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        <button className="btn btn-google" type="button" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={async () => {
          setError('');
          try {
            const result = await loginWithGoogle();
            // Track Google Analytics conversion event
            trackSignUpEvent();
            // Only navigate if popup was used (returns data). Redirect navigates automatically.
            if (result) navigate(nextPage);
          } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') setError(err.message);
          }
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t('register.google')}
        </button>

        {/* Facebook login - desativado até configurar app no Meta
        <button className="btn" type="button" style={{ width: '100%', marginBottom: '0.5rem', background: '#1877F2', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }} onClick={async () => {
          setError('');
          try {
            const result = await loginWithFacebook();
            if (result) navigate(nextPage);
          } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') setError(err.message);
          }
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          {t('register.facebook')}
        </button>
        */}

        <div className="auth-divider">
          <span>{t('register.or')}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><User size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('register.fullName')}</label>
            <input autoComplete="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder={t('register.fullNamePlaceholder')} required />
          </div>
          <div className="form-group">
            <label><Mail size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('register.email')}</label>
            <input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t('register.emailPlaceholder')} required />
          </div>
          <div className="form-group">
            <label><Lock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('register.password')}</label>
            <input type="password" autoComplete="new-password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t('register.passwordPlaceholder')} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            <UserPlus size={18} /> {t('register.submit')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray-500)' }}>
          <div style={{background:'#f0f9ff',border:'1px solid #bae6fd',borderRadius:8,padding:'12px 16px',marginTop:16,marginBottom:8,fontSize:13,color:'#0369a1',display:'flex',alignItems:'center',gap:8}}>
          ✉ {t('register.emailVerify', 'Depois do registo, recebe um email de boas-vindas. Verifica a tua caixa de entrada.')}
        </div>
        {t('register.hasAccount')} <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>{t('register.signIn')}</Link>
        <p style={{ margin: '14px 0 0', fontSize: 12, lineHeight: 1.5, color: '#6b7280' }}>Ao criar uma conta, concordas com os nossos <Link to="/termos" style={{ color: '#3568b8' }}>Termos de Uso</Link> e a <Link to="/privacidade" style={{ color: '#3568b8' }}>Política de Privacidade</Link>.</p>
        </div>
      </div>
      </div>
      <style>{`.register-card .auth-brand h1{color:#2b1b47}.register-card .auth-brand p{color:#687184}.register-proof{margin:0 0 18px;padding:12px;border:1px solid #e5ddf4;border-radius:14px;background:#faf8fe}.register-proof-items{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.register-proof-items span{display:inline-flex;align-items:center;gap:5px;color:#5a477a;font-size:12px;font-weight:750}.register-proof-items svg{color:#6b3faf}.register-duel-note{display:flex;align-items:center;justify-content:center;gap:7px;margin:0 0 10px;color:#563194;font-size:13px;font-weight:800;text-align:center}.register-duel-note svg{color:#bf8616}.register-card .form-group input{border-radius:12px;border-color:#dcd9e6;padding:13px 14px}.register-card .btn-primary{background:linear-gradient(135deg,#633da0,#8255b7);border-radius:13px;box-shadow:0 10px 20px rgba(99,61,160,.23)}.register-card .btn-google{border-radius:13px}.register-card .auth-divider{margin:20px 0}@media(max-width:820px){.register-layout{grid-template-columns:1fr !important}.register-story{max-width:620px;margin:0 auto}.faith-collage{min-height:340px !important}}@media(max-width:520px){.register-page{padding:16px 12px !important}.register-story h2{font-size:2.5rem !important}.faith-collage{transform:scale(.9);transform-origin:top center;margin-bottom:-15px !important}.register-card{padding:24px 18px !important}.register-proof-items{justify-content:flex-start}.register-proof-items span{font-size:11px}}`}</style>
    </div>
  );
}
