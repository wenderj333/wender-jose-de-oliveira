import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, Mail, Lock, User, Heart, ShieldCheck, Music, Sparkles, Users, Clock3, Trophy, Camera, X } from 'lucide-react';
import { getChristianChatCopy } from '../i18n/christianChatCopy';

// Google Analytics conversion events
function trackSignUpEvent() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', { method: 'email' });
    console.log('Google Analytics: sign_up event tracked');
  }
}

function trackLoginEvent(method) {
  if (typeof window !== 'undefined' && window.gtag) window.gtag('event', 'login', { method });
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

const REGISTER_EMAIL_UPDATES = {
  pt: { label: 'Quero receber novidades por e-mail', description: 'Receba novidades e convites do Sigo com Fé. Você pode parar de receber quando quiser.' },
  es: { label: 'Quiero recibir novedades por correo', description: 'Recibe novedades e invitaciones de Sigo com Fé. Puedes dejar de recibirlas cuando quieras.' },
  en: { label: 'I want to receive email updates', description: 'Receive Sigo com Fé news and invitations. You can unsubscribe whenever you want.' },
  de: { label: 'Ich möchte Neuigkeiten per E-Mail erhalten', description: 'Erhalte Neuigkeiten und Einladungen von Sigo com Fé. Du kannst sie jederzeit abbestellen.' },
  fr: { label: 'Je souhaite recevoir les nouveautés par e-mail', description: 'Recevez les nouveautés et invitations de Sigo com Fé. Vous pouvez vous désinscrire à tout moment.' },
  ro: { label: 'Vreau să primesc noutăți prin e-mail', description: 'Primește noutăți și invitații de la Sigo com Fé. Te poți dezabona oricând.' },
  ru: { label: 'Я хочу получать новости по электронной почте', description: 'Получайте новости и приглашения от Sigo com Fé. Вы можете отказаться в любое время.' },
};

const PROFILE_PHOTO_COPY = {
  pt: { title: 'A sua foto de perfil', help: 'Escolha uma foto nítida do seu rosto. Ela é obrigatória para entrar na comunidade.', choose: 'Escolher foto', change: 'Trocar foto', required: 'Envie a sua foto de perfil para concluir o cadastro.', invalid: 'Escolha uma imagem válida.', large: 'A foto pode ter no máximo 10 MB.', uploading: 'A enviar a foto…' },
  es: { title: 'Tu foto de perfil', help: 'Elige una foto clara de tu rostro. Es obligatoria para entrar en la comunidad.', choose: 'Elegir foto', change: 'Cambiar foto', required: 'Sube tu foto de perfil para completar el registro.', invalid: 'Elige una imagen válida.', large: 'La foto puede tener un máximo de 10 MB.', uploading: 'Subiendo la foto…' },
  en: { title: 'Your profile photo', help: 'Choose a clear photo of your face. It is required to join the community.', choose: 'Choose photo', change: 'Change photo', required: 'Upload your profile photo to finish registration.', invalid: 'Choose a valid image.', large: 'The photo must be at most 10 MB.', uploading: 'Uploading photo…' },
  de: { title: 'Dein Profilfoto', help: 'Wähle ein klares Foto deines Gesichts. Es ist für den Beitritt erforderlich.', choose: 'Foto auswählen', change: 'Foto ändern', required: 'Lade dein Profilfoto hoch, um die Registrierung abzuschließen.', invalid: 'Wähle ein gültiges Bild.', large: 'Das Foto darf maximal 10 MB groß sein.', uploading: 'Foto wird hochgeladen…' },
  fr: { title: 'Votre photo de profil', help: 'Choisissez une photo nette de votre visage. Elle est requise pour rejoindre la communauté.', choose: 'Choisir une photo', change: 'Changer la photo', required: 'Ajoutez votre photo de profil pour terminer l’inscription.', invalid: 'Choisissez une image valide.', large: 'La photo ne peut pas dépasser 10 Mo.', uploading: 'Envoi de la photo…' },
  ro: { title: 'Fotografia de profil', help: 'Alege o fotografie clară a feței tale. Este obligatorie pentru a intra în comunitate.', choose: 'Alege fotografia', change: 'Schimbă fotografia', required: 'Încarcă fotografia de profil pentru a finaliza înscrierea.', invalid: 'Alege o imagine validă.', large: 'Fotografia poate avea cel mult 10 MB.', uploading: 'Se încarcă fotografia…' },
  ru: { title: 'Фото профиля', help: 'Выберите чёткую фотографию лица. Она обязательна для входа в сообщество.', choose: 'Выбрать фото', change: 'Изменить фото', required: 'Загрузите фото профиля, чтобы завершить регистрацию.', invalid: 'Выберите подходящее изображение.', large: 'Размер фото — не более 10 МБ.', uploading: 'Загрузка фото…' },
};

const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/degxiuf43/image/upload';

export default function Register() {
  const { register, loginWithGoogle, loginWithFacebook, sendPhoneCode, verifyPhoneCode, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedNext = new URLSearchParams(location.search).get('next');
  const nextPage = requestedNext?.startsWith('/') ? requestedNext : '/';
  const { t, i18n } = useTranslation();
  const c = getChristianChatCopy(i18n.language);
  const language = i18n.language?.split('-')[0];
  const story = REGISTER_STORY[language] || REGISTER_STORY.pt;
  const proof = REGISTER_PROOF[language] || REGISTER_PROOF.pt;
  const emailUpdates = REGISTER_EMAIL_UPDATES[language] || REGISTER_EMAIL_UPDATES.pt;
  const profilePhotoCopy = PROFILE_PHOTO_COPY[language] || PROFILE_PHOTO_COPY.pt;
  const guideButton = {
    pt: '📖 O que você precisa saber antes de entrar',
    es: '📖 Lo que debes saber antes de entrar',
    en: '📖 What you should know before joining',
    de: '📖 Was du vor dem Beitritt wissen solltest',
    fr: '📖 Ce qu’il faut savoir avant de rejoindre',
    ro: '📖 Ce trebuie să știi înainte de a intra',
    ru: '📖 Что нужно знать перед входом',
  }[language] || '📖 O que você precisa saber antes de entrar';
  const duelButton = {
    pt: '⚔️ Teste seu conhecimento com pessoas reais',
    es: '⚔️ Pon a prueba tus conocimientos con personas reales',
    en: '⚔️ Test your knowledge with real people',
    de: '⚔️ Teste dein Wissen mit echten Menschen',
    fr: '⚔️ Testez vos connaissances avec de vraies personnes',
    ro: '⚔️ Testează-ți cunoștințele cu persoane reale',
    ru: '⚔️ Проверьте знания с реальными людьми',
  }[language] || '⚔️ Teste seu conhecimento com pessoas reais';
  const guardianButton = {
    pt: '🛡️ Guardião da Palavra — jogue no seu ritmo',
    es: '🛡️ Guardián de la Palabra — juega a tu ritmo',
    en: '🛡️ Guardian of the Word — play at your pace',
    de: '🛡️ Hüter des Wortes — spiele in deinem Tempo',
    fr: '🛡️ Gardien de la Parole — jouez à votre rythme',
    ro: '🛡️ Gardianul Cuvântului — joacă în ritmul tău',
    ru: '🛡️ Хранитель Слова — играйте в своём темпе',
  }[language] || '🛡️ Guardião da Palavra — jogue no seu ritmo';
  const cameFromDuel = nextPage === '/duelo-biblico';
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'member', email_updates_opt_in: false });
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);


  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+55');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // A member who is already signed in must not be asked to register again.
  useEffect(() => {
    if (!loading && user) navigate(nextPage, { replace: true });
  }, [loading, user, navigate, nextPage]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) window.gtag('event', 'view_sign_up', { page: 'register' });
  }, []);

  useEffect(() => () => {
    if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
  }, [profilePhotoPreview]);

  const handleProfilePhoto = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith('image/')) return setError(profilePhotoCopy.invalid);
    if (selected.size > 10 * 1024 * 1024) return setError(profilePhotoCopy.large);
    if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
    setError('');
    setProfilePhoto(selected);
    setProfilePhotoPreview(URL.createObjectURL(selected));
  };

  const uploadProfilePhoto = async () => {
    const data = new FormData();
    data.append('file', profilePhoto);
    data.append('upload_preset', 'sigo_com_fe');
    const response = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: data });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.secure_url) throw new Error(payload.error?.message || 'Não foi possível enviar a foto. Tente novamente.');
    return payload.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError(t('register.passwordError'));
    if (!profilePhoto) return setError(profilePhotoCopy.required);
    try {
      setSubmitting(true);
      const avatarUrl = await uploadProfilePhoto();
      await register(form.email, form.password, form.full_name, form.role, avatarUrl, form.email_updates_opt_in);
      trackSignUpEvent();
      navigate(nextPage); // Navegar para a página inicial após o registo
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#633da0', fontWeight: 700 }}>A preparar a sua conta...</div>;

  return (
    <div className="register-page" style={{ position:'relative', minHeight: '100vh', padding: 'clamp(16px,4vw,48px)', background: 'radial-gradient(circle at 8% 12%,#f5ebd2 0,transparent 23%), linear-gradient(145deg,#fbfaf8 0%,#f1f3fa 58%,#fff 100%)' }}>
      <div className="register-guide-link" style={{ position:'absolute', top:'clamp(22px,5vw,64px)', left:'clamp(22px,11vw,205px)', zIndex:2, display:'flex', flexWrap:'wrap', gap:9 }}><Link to="/guia" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7, padding:'12px 17px', border:'1px solid #356649', borderRadius:12, color:'#fff', background:'#356649', boxShadow:'0 9px 20px rgba(52,90,67,.22)', fontWeight:900, textDecoration:'none', fontSize:13 }}>{guideButton}</Link><Link to="/duelo-biblico" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7, padding:'12px 17px', border:'1px solid #d69e2e', borderRadius:12, color:'#704c08', background:'#fff5cf', boxShadow:'0 9px 20px rgba(153,110,28,.16)', fontWeight:900, textDecoration:'none', fontSize:13 }}>{duelButton}</Link><a href="/guardiao-da-palavra/index.html" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7, padding:'12px 17px', border:'1px solid #9bc6a8', borderRadius:12, color:'#276343', background:'#eff8ef', fontWeight:900, textDecoration:'none', fontSize:13 }}>{guardianButton}</a></div>
      <div className="register-layout" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(300px,1.1fr) minmax(360px,.9fr)', gap: 'clamp(30px,6vw,86px)', alignItems: 'center' }}>
      <aside className="register-story" style={{ color: '#231b3a' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#eee6fb', color: '#633da0', padding: '8px 13px', borderRadius: 99, fontWeight: 800, fontSize: 13 }}><Sparkles size={16}/> {c.brand}</span>
        <h2 style={{ fontSize: 'clamp(2.45rem,5vw,4.65rem)', lineHeight: .98, margin: '20px 0 16px', letterSpacing: '-.055em', maxWidth: 590 }}>{story.title}</h2>
        <p style={{ color: '#626b80', fontSize: '1.04rem', lineHeight: 1.65, margin: '0 0 27px', maxWidth: 540 }}>{c.signupDesc}</p>
        <div className="faith-collage" style={{ position: 'relative', minHeight: 414, maxWidth: 570, margin: '0 auto 18px', padding: 10, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridTemplateRows: 'repeat(2, 190px)', gap: 16 }}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '28px 12px 12px 12px', background: '#271044', boxShadow: '0 16px 32px rgba(53,30,87,.22)' }}>
            <img src="/biblia-register.png" alt={story.bible} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: .94 }}/>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(39,16,68,.65),transparent 62%)' }}/>
            <span style={{ position: 'absolute', left: 14, bottom: 12, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 12 }}><BookOpen size={15}/> {story.bible}</span>
          </div>
          <div style={{ overflow: 'hidden', borderRadius: '12px 28px 12px 12px', background: '#fff', border: '5px solid #fff', boxShadow: '0 16px 32px rgba(35,27,58,.18)' }}>
            <img src="/registro-verena.png" alt={story.community} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 24%' }}/>
          </div>
          <div style={{ overflow: 'hidden', borderRadius: '12px 12px 12px 28px', background: '#fff', border: '5px solid #fff', boxShadow: '0 16px 32px rgba(35,27,58,.18)' }}>
            <img src="/registro-membro-ana.png" alt="Membro da comunidade Sigo com Fé" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 16%' }}/>
          </div>
          <div style={{ overflow: 'hidden', borderRadius: '12px 12px 28px 12px', background: '#fff', border: '5px solid #fff', boxShadow: '0 16px 32px rgba(35,27,58,.18)' }}>
            <img src="/registro-membro-luzia.png" alt="Membro da comunidade Sigo com Fé" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 24%' }}/>
          </div>
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
            // A Google login may be an existing member. Do not count it as a new registration.
            trackLoginEvent('google');
            if (result) navigate(nextPage);
          } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') setError(err.message);
          }
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t('register.google')}
        </button>
        <p style={{ margin: '0 0 1rem', textAlign: 'center', fontSize: '0.78rem', color: '#6b6180', lineHeight: 1.4 }}>
          Se o Google não abrir, use o e-mail e a senha abaixo ou abra o link no Chrome/Safari.
        </p>
        <Link to="/login" style={{ display: 'flex', width: '100%', boxSizing: 'border-box', alignItems: 'center', justifyContent: 'center', marginBottom: '1.1rem', padding: '12px 16px', borderRadius: 13, border: '1px solid #6b3faf', color: '#5a2d92', background: '#faf8fe', fontWeight: 800, textDecoration: 'none' }}>
          Já tenho conta — Entrar
        </Link>

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
          <div className="required-profile-photo">
            <div className="required-profile-photo-copy"><Camera size={18}/><div><strong>{profilePhotoCopy.title} <span aria-hidden="true">*</span></strong><small>{profilePhotoCopy.help}</small></div></div>
            <div className="required-profile-photo-action">
              {profilePhotoPreview ? <div className="required-profile-preview"><img src={profilePhotoPreview} alt="Pré-visualização da foto de perfil"/><button type="button" onClick={() => { URL.revokeObjectURL(profilePhotoPreview); setProfilePhoto(null); setProfilePhotoPreview(''); }} aria-label="Remover foto"><X size={15}/></button></div> : <div className="required-profile-placeholder"><User size={28}/></div>}
              <label className="required-profile-photo-button"><Camera size={15}/>{profilePhotoPreview ? profilePhotoCopy.change : profilePhotoCopy.choose}<input type="file" accept="image/*" onChange={handleProfilePhoto}/></label>
            </div>
          </div>
          <label className="email-updates-opt-in">
            <input type="checkbox" checked={form.email_updates_opt_in} onChange={(e) => setForm({ ...form, email_updates_opt_in: e.target.checked })} />
            <span><strong>{emailUpdates.label}</strong><small>{emailUpdates.description}</small></span>
          </label>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
            <UserPlus size={18} /> {submitting ? profilePhotoCopy.uploading : t('register.submit')}
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
      <style>{`.register-card .auth-brand h1{color:#2b1b47}.register-card .auth-brand p{color:#687184}.register-proof{margin:0 0 18px;padding:12px;border:1px solid #e5ddf4;border-radius:14px;background:#faf8fe}.register-proof-items{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.register-proof-items span{display:inline-flex;align-items:center;gap:5px;color:#5a477a;font-size:12px;font-weight:750}.register-proof-items svg{color:#6b3faf}.register-duel-note{display:flex;align-items:center;justify-content:center;gap:7px;margin:0 0 10px;color:#563194;font-size:13px;font-weight:800;text-align:center}.register-duel-note svg{color:#bf8616}.register-card .form-group input{border-radius:12px;border-color:#dcd9e6;padding:13px 14px}.required-profile-photo{margin:-1px 0 18px;padding:13px;border:1px solid #d7c7eb;border-radius:13px;background:#faf8fe}.required-profile-photo-copy{display:flex;align-items:flex-start;gap:9px;color:#4f2d78}.required-profile-photo-copy>svg{margin-top:2px}.required-profile-photo-copy strong{display:block;font-size:13px}.required-profile-photo-copy strong span{color:#c74343}.required-profile-photo-copy small{display:block;margin-top:3px;color:#70657d;font-size:11px;line-height:1.35}.required-profile-photo-action{display:flex;align-items:center;gap:11px;margin-top:11px}.required-profile-placeholder,.required-profile-preview{position:relative;width:52px;height:52px;border-radius:50%;overflow:hidden}.required-profile-placeholder{display:grid;place-items:center;background:#e7dcf5;color:#7545ab}.required-profile-preview{border:2px solid #6b3faf}.required-profile-preview img{width:100%;height:100%;object-fit:cover}.required-profile-preview button{position:absolute;top:1px;right:1px;display:grid;place-items:center;width:21px;height:21px;border:0;border-radius:50%;background:#3d234f;color:#fff;cursor:pointer}.required-profile-photo-button{display:inline-flex;align-items:center;gap:6px;border:1px solid #6b3faf;border-radius:10px;background:#fff;color:#5a2d92;padding:9px 11px;font-size:12px;font-weight:800;cursor:pointer}.required-profile-photo-button input{display:none}.email-updates-opt-in{display:flex;align-items:flex-start;gap:10px;margin:-2px 0 18px;padding:11px 12px;border:1px solid #e2dbef;border-radius:12px;background:#faf8fe;cursor:pointer;color:#4f3a70}.email-updates-opt-in input{width:17px;height:17px;margin:2px 0 0;accent-color:#6b3faf;flex:0 0 auto}.email-updates-opt-in strong{display:block;font-size:13px;line-height:1.35}.email-updates-opt-in small{display:block;margin-top:3px;color:#736b83;font-size:11px;line-height:1.35}.register-card .btn-primary{background:linear-gradient(135deg,#633da0,#8255b7);border-radius:13px;box-shadow:0 10px 20px rgba(99,61,160,.23)}.register-card .btn-primary:disabled{opacity:.7;cursor:wait}.register-card .btn-google{border-radius:13px}.register-card .auth-divider{margin:20px 0}@media(max-width:820px){.register-layout{grid-template-columns:1fr !important}.register-story{max-width:620px;margin:0 auto}.faith-collage{min-height:340px !important}}@media(max-width:520px){.register-page{padding:16px 12px !important}.register-guide-link{position:static !important;margin:0 0 18px !important;display:grid !important;grid-template-columns:1fr !important;gap:8px !important}.register-guide-link a{width:100%;box-sizing:border-box;font-size:12px !important;padding:10px 12px !important}.register-story h2{font-size:2.5rem !important}.faith-collage{transform:scale(.9);transform-origin:top center;margin-bottom:-15px !important}.register-card{padding:24px 18px !important}.register-proof-items{justify-content:flex-start}.register-proof-items span{font-size:11px}}`}</style>
    </div>
  );
}
