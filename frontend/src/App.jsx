import React, { useState, useEffect, useRef, Component } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext';
import { BookOpen, HandHeart, Radio, MapPin, LayoutDashboard, Menu, X, Church, Baby, Newspaper, ShieldAlert, MessageCircle, Bot, Users, User, Download, Bell, Music } from 'lucide-react';
import Home from './pages/Home';
import PrayerFeed from './pages/PrayerFeed';
import LivePrayer from './pages/LivePrayer';
import ChurchMap from './pages/ChurchMap';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Kids from './pages/Kids';
import Mural from './pages/Mural';
import ChurchRegister from './pages/ChurchRegister';
import HelpRequests from './pages/HelpRequests';
import PastorChat from './pages/PastorChat';
import PastoralAI from './pages/PastoralAI';
import BibleAI from './pages/BibleAI';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Members from './pages/Members';
import Groups from './pages/Groups';
import Consecration from './pages/Consecration';
import MessagesPage from './pages/Messages';
import Offerings from './pages/Offerings';
// Music temporarily disabled for redesign
import MusicLibrary from './pages/MusicLibrary';
import PastorDashboard from './pages/PastorDashboard';
import FaithJourneys from './pages/FaithJourneys';
import BiblicalCourse from './pages/BiblicalCourse';
import BiblicalFinance from './pages/BiblicalFinance';
import CriadorLouvor from './pages/CriadorLouvor';
import TheologyCourse from './pages/TheologyCourse';
import Donation from './pages/Donation';
import LiveStream from './pages/LiveStream';
// import { MusicProvider } from './context/MusicContext';
// import MusicPlayer from './components/MusicPlayer';
import LanguageSwitcher from './components/LanguageSwitcher';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function RedirectIfLoggedIn({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div>;
  if (user) return <Navigate to="/mural" />;
  return children;
}

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error('ErrorBoundary:', err); }
  render() {
    if (this.state.hasError) return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>😔 Algo deu errado</h2>
        <p>Tente recarregar a página.</p>
        <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
          style={{ padding: '0.5rem 1.5rem', borderRadius: 20, border: 'none', background: '#daa520', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          🔄 Recarregar
        </button>
      </div>
    );
    return this.props.children;
  }
}

export default function App() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread notifications every 60 seconds
  const prevUnreadRef = useRef(0);
  useEffect(() => {
    if (!user) return;
    const API = (import.meta.env.VITE_API_URL || '') + '/api';
    const token = localStorage.getItem('token');
    async function checkUnread() {
      try {
        const res = await fetch(`${API}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const newCount = data.count || 0;
        // Show browser notification if count increased
        if (newCount > prevUnreadRef.current && prevUnreadRef.current >= 0) {
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              const notifRes = await fetch(`${API}/notifications?limit=1`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const notifData = await notifRes.json();
              const latest = notifData.notifications?.[0];
              if (latest && !latest.is_read) {
                new Notification(latest.title || '🔔 Sigo com Fé', {
                  body: latest.body || 'Você tem uma nova notificação!',
                  icon: '/logo.jpg',
                  tag: 'sigo-notif-' + latest.id,
                });
              }
            } catch (e) {}
          }
        }
        prevUnreadRef.current = newCount;
        setUnreadCount(newCount);
      } catch (e) {}
    }
    // Request notification permission on first load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    checkUnread();
    const interval = setInterval(checkUnread, 30000);

    // Heartbeat — update online status every 60s
    function sendHeartbeat() {
      fetch(`${API}/profile/heartbeat`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    sendHeartbeat();
    const hbInterval = setInterval(sendHeartbeat, 60000);

    return () => { clearInterval(interval); clearInterval(hbInterval); };
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setInstallPrompt(null);
  };

  const isActive = (path) => location.pathname === path ? 'nav-link--active' : '';

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar__top">
          <Link to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
            <img src="/logo.jpg" alt="Sigo com Fé" style={{ width: 36, height: 36, verticalAlign: 'middle', marginRight: '8px', borderRadius: '50%', objectFit: 'cover', background: '#b3d4fc' }} />{t('brand')}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user && (
              <Link to="/mensagens" style={{ position: 'relative', color: '#fff', textDecoration: 'none' }}>
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -8,
                    background: '#e74c3c', color: '#fff', borderRadius: '50%',
                    width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </Link>
            )}
{/* Idioma detectado automaticamente */}
            <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <div className={`nav-overlay ${menuOpen ? 'nav-overlay--open' : ''}`} onClick={() => setMenuOpen(false)} />
        <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
          <Link to="/mural" className={isActive('/mural')} onClick={() => setMenuOpen(false)}><Newspaper size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Mural</Link>
          <Link to="/ao-vivo" className={isActive('/ao-vivo')} onClick={() => setMenuOpen(false)}><Radio size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Ao Vivo</Link>
          <Link to="/directo" className={isActive('/directo')} onClick={() => setMenuOpen(false)}><span style={{ verticalAlign: 'middle', marginRight: '4px' }}>🔴</span>Directo</Link>
          <Link to="/cadastrar-igreja" className={isActive('/cadastrar-igreja')} onClick={() => setMenuOpen(false)}><Church size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Igreja</Link>
          {(user?.role === 'pastor' || user?.role === 'admin') && <Link to="/pedidos-ajuda" className={isActive('/pedidos-ajuda')} onClick={() => setMenuOpen(false)}><ShieldAlert size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#e74c3c' }} />Pedidos</Link>}
          {(user?.role === 'pastor' || user?.role === 'admin') && <Link to="/oracoes" className={isActive('/oracoes')} onClick={() => setMenuOpen(false)}><HandHeart size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Orações</Link>}
          <Link to="/chat-pastoral" className={isActive('/chat-pastoral')} onClick={() => setMenuOpen(false)}><MessageCircle size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#8e44ad' }} />Chat</Link>
          {user && (
            <Link to={`/perfil/${user.id}`} className={isActive(`/perfil/${user.id}`)} onClick={() => setMenuOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <User size={20} style={{ verticalAlign: 'middle', color: '#daa520' }} />Seu Perfil
            </Link>
          )}
          <Link to="/ia-biblica" className={isActive('/ia-biblica')} onClick={() => setMenuOpen(false)}><span style={{ verticalAlign: 'middle', marginRight: '4px' }}>📖</span>IA 📖</Link>
          {user?.role === 'pastor' && <Link to="/ia-pastoral" className={isActive('/ia-pastoral')} onClick={() => setMenuOpen(false)}><Bot size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#8e44ad' }} />IA Pastoral</Link>}
          <Link to="/musica" className={isActive('/musica')} onClick={() => setMenuOpen(false)}><Music size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: 'var(--purple)' }} />Música</Link>
          <Link to="/criador-louvor" className={isActive('/criador-louvor')} onClick={() => setMenuOpen(false)}><span style={{ verticalAlign: 'middle', marginRight: '4px' }}>✨</span>Criar Louvor IA</Link>
          {(user?.role === 'pastor' || user?.role === 'admin') && <Link to="/membros" className={isActive('/membros')} onClick={() => setMenuOpen(false)}><Users size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#4caf50' }} />Membros</Link>}
          <Link to="/kids" className={isActive('/kids')} onClick={() => setMenuOpen(false)}><Baby size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Kids</Link>
          <Link to="/consagracao" className={isActive('/consagracao')} onClick={() => setMenuOpen(false)}><span style={{ verticalAlign: 'middle', marginRight: '4px' }}>🔥</span>Consagração</Link>
          <Link to="/jornadas" className={isActive('/jornadas')} onClick={() => setMenuOpen(false)}><span style={{ verticalAlign: 'middle', marginRight: '4px' }}>✨</span>Jornadas de Fé</Link>
          <Link to="/curso-biblico" className={isActive('/curso-biblico')} onClick={() => setMenuOpen(false)}><span style={{ verticalAlign: 'middle', marginRight: '4px' }}>📖</span>Curso Bíblico Grátis</Link>
          <Link to="/curso-financas" className={isActive('/curso-financas')} onClick={() => setMenuOpen(false)}><span style={{ verticalAlign: 'middle', marginRight: '4px' }}>💰</span>Finanças Bíblicas</Link>
          <Link to="/curso-teologia" className={isActive('/curso-teologia')} onClick={() => setMenuOpen(false)}><span style={{ verticalAlign: 'middle', marginRight: '4px' }}>🎓</span>Teologia</Link>
          <Link to="/grupos" className={isActive('/grupos')} onClick={() => setMenuOpen(false)}><Users size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#4a1a8e' }} />Grupos</Link>
          {user && <Link to="/amigos" className={isActive('/amigos')} onClick={() => setMenuOpen(false)}><Users size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#667eea' }} />Amigos</Link>}
          {user && (
            <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}><LayoutDashboard size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Dashboard</Link>
          )}
          {(user?.role === 'pastor' || user?.role === 'admin') && (
            <Link to="/pastor" className={isActive('/pastor')} onClick={() => setMenuOpen(false)} style={{ background: 'linear-gradient(135deg, #daa520, #b8860b)', color: '#fff', borderRadius: 12, padding: '0.4rem 0.8rem', fontWeight: 700 }}><ShieldAlert size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />🏛️ Sala do Pastor</Link>
          )}
          {/* Ofertas temporarily hidden */}
          {/* {(user?.role === 'pastor' || user?.role === 'admin') && <Link to="/ofertas" className={isActive('/ofertas')} onClick={() => setMenuOpen(false)}>❤️ Ofertas</Link>} */}
          {/* Igrejas (map) hidden — using Igreja (register) instead */}
          {/* <Link to="/igrejas" className={isActive('/igrejas')} onClick={() => setMenuOpen(false)}><MapPin size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Igrejas</Link> */}
          {user ? (
            <>
              <span className="nav-user">{t('nav.hello', { name: user.full_name?.split(' ')[0] })}</span>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="btn btn-outline btn-sm">{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>{t('nav.login')}</Link>
              <Link to="/cadastro" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>{t('nav.register')}</Link>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/mural" /> : <Home />} />
          <Route path="/oracoes" element={<PrayerFeed />} />
          <Route path="/mural" element={<Mural />} />
          <Route path="/ao-vivo" element={<LivePrayer />} />
          <Route path="/igrejas" element={<ChurchMap />} />
          <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
          <Route path="/cadastro" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />
          <Route path="/kids" element={<Kids />} />
          <Route path="/pedidos-ajuda" element={<HelpRequests />} />
          <Route path="/chat-pastoral" element={<PastorChat />} />
          <Route path="/ia-biblica" element={<BibleAI />} />
          <Route path="/ia-pastoral" element={<ProtectedRoute><PastoralAI /></ProtectedRoute>} />
          <Route path="/cadastrar-igreja" element={<ChurchRegister />} />
          <Route path="/amigos" element={<Friends />} />
          <Route path="/perfil/:userId" element={<Profile />} />
                    <Route path="/musica" element={<MusicLibrary />} />
          <Route path="/consagracao" element={<Consecration />} />
          <Route path="/grupos" element={<Groups />} />
          <Route path="/mensagens" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/membros" element={<ProtectedRoute><Members /></ProtectedRoute>} />
          <Route path="/ofertas" element={<ProtectedRoute><Offerings /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/pastor" element={<ProtectedRoute><PastorDashboard /></ProtectedRoute>} />
          <Route path="/jornadas" element={<FaithJourneys />} />
          <Route path="/curso-biblico" element={<BiblicalCourse />} />
          <Route path="/curso-financas" element={<BiblicalFinance />} />
          <Route path="/curso-teologia" element={<TheologyCourse />} />
          <Route path="/doar" element={<ProtectedRoute><Donation /></ProtectedRoute>} />
          <Route path="/directo" element={<ProtectedRoute><LiveStream /></ProtectedRoute>} />
          <Route path="/criador-louvor" element={<CriadorLouvor />} />
        </Routes>
        </ErrorBoundary>
      </main>

      {/* Music player temporarily disabled */}

      {/* Floating "Cria teu Louvor" Button */}
      <button onClick={() => navigate('/criador-louvor')} style={{
        position: 'fixed', bottom: 140, right: 16, zIndex: 999,
        padding: '0.6rem 1rem', borderRadius: 25, border: 'none',
        background: 'linear-gradient(135deg, #9b59b6, #667eea)',
        color: '#fff', cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(155,89,182,0.4)',
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: '0.78rem', fontWeight: 700,
        animation: 'louvorPulse 2s ease-in-out infinite',
      }} title="Cria teu próprio louvor com IA!">
        🎵 Cria teu Louvor!
      </button>
      <style>{`@keyframes louvorPulse { 0%,100% { transform: scale(1); box-shadow: 0 4px 15px rgba(155,89,182,0.4); } 50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(155,89,182,0.6); } }`}</style>

      {/* Floating Share Button */}
      <button onClick={() => {
        const shareData = {
          title: 'Sigo com Fé - Rede Social Cristã',
          text: '🙏 Conheça o Sigo com Fé! Uma rede social cristã onde você encontra oração, acolhimento e comunidade.\n\n✨ Crie sua conta grátis:',
          url: 'https://sigo-com-fe.vercel.app',
        };
        if (navigator.share) {
          navigator.share(shareData).catch(() => {});
        } else {
          navigator.clipboard?.writeText(`${shareData.text}\n${shareData.url}`);
          alert('Link copiado! ✅');
        }
      }} style={{
        position: 'fixed', bottom: 80, right: 16, zIndex: 999,
        width: 52, height: 52, borderRadius: '50%', border: 'none',
        background: 'linear-gradient(135deg, #daa520, #f4c542)',
        color: '#1a0a3e', cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(218,165,32,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem',
      }} title="Compartilhar Sigo com Fé">
        📤
      </button>

      <footer className="footer">
        {showInstallBtn && (
          <button onClick={handleInstall} style={{
            display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto 0.75rem',
            padding: '0.6rem 1.5rem', borderRadius: 25, border: 'none',
            background: 'linear-gradient(135deg, #daa520, #f4c542)', color: '#1a0a3e',
            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(218,165,32,0.4)',
          }}>
            <Download size={18} /> 📲 Instalar App
          </button>
        )}
        <p>{t('footer')} <BookOpen size={16} style={{ verticalAlign: 'middle' }} /></p>
      </footer>
    </div>
  );
}
