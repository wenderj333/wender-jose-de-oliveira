import React, { useState, useEffect, useRef, Component } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
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
// import { MusicProvider } from './context/MusicContext';
// import MusicPlayer from './components/MusicPlayer';
import LanguageSwitcher from './components/LanguageSwitcher';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

function RedirectIfLoggedIn({ children }) {
  const { user } = useAuth();
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
  const { t } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread notifications every 60 seconds
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
        setUnreadCount(data.count || 0);
      } catch (e) {}
    }
    checkUnread();
    const interval = setInterval(checkUnread, 60000);
    return () => clearInterval(interval);
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
            <LanguageSwitcher />
            <div id="google_translate_element" style={{ display: 'inline-block' }} />
            <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <div className={`nav-overlay ${menuOpen ? 'nav-overlay--open' : ''}`} onClick={() => setMenuOpen(false)} />
        <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
          <Link to="/mural" className={isActive('/mural')} onClick={() => setMenuOpen(false)}><Newspaper size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Mural</Link>
          <Link to="/ao-vivo" className={isActive('/ao-vivo')} onClick={() => setMenuOpen(false)}><Radio size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Ao Vivo</Link>
          <Link to="/cadastrar-igreja" className={isActive('/cadastrar-igreja')} onClick={() => setMenuOpen(false)}><Church size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Igreja</Link>
          <Link to="/pedidos-ajuda" className={isActive('/pedidos-ajuda')} onClick={() => setMenuOpen(false)}><ShieldAlert size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#e74c3c' }} />Pedidos</Link>
          <Link to="/oracoes" className={isActive('/oracoes')} onClick={() => setMenuOpen(false)}><HandHeart size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Orações</Link>
          <Link to="/chat-pastoral" className={isActive('/chat-pastoral')} onClick={() => setMenuOpen(false)}><MessageCircle size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#8e44ad' }} />Chat</Link>
          {user && (
            <Link to={`/perfil/${user.id}`} className={isActive(`/perfil/${user.id}`)} onClick={() => setMenuOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <User size={20} style={{ verticalAlign: 'middle', color: '#daa520' }} />Seu Perfil
            </Link>
          )}
          <Link to="/ia-biblica" className={isActive('/ia-biblica')} onClick={() => setMenuOpen(false)}><span style={{ verticalAlign: 'middle', marginRight: '4px' }}>📖</span>IA 📖</Link>
          {user?.role === 'pastor' && <Link to="/ia-pastoral" className={isActive('/ia-pastoral')} onClick={() => setMenuOpen(false)}><Bot size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#8e44ad' }} />IA Pastoral</Link>}
          <Link to="/musica" className={isActive('/musica')} onClick={() => setMenuOpen(false)}><Music size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: 'var(--purple)' }} />Música</Link>
          {(user?.role === 'pastor' || user?.role === 'admin') && <Link to="/membros" className={isActive('/membros')} onClick={() => setMenuOpen(false)}><Users size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#4caf50' }} />Membros</Link>}
          <Link to="/kids" className={isActive('/kids')} onClick={() => setMenuOpen(false)}><Baby size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Kids</Link>
          <Link to="/consagracao" className={isActive('/consagracao')} onClick={() => setMenuOpen(false)}><span style={{ verticalAlign: 'middle', marginRight: '4px' }}>🔥</span>Consagração</Link>
          <Link to="/grupos" className={isActive('/grupos')} onClick={() => setMenuOpen(false)}><Users size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#4a1a8e' }} />Grupos</Link>
          {user && <Link to="/amigos" className={isActive('/amigos')} onClick={() => setMenuOpen(false)}><Users size={16} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#667eea' }} />Amigos</Link>}
          {user && (
            <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}><LayoutDashboard size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Dashboard</Link>
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
        </Routes>
        </ErrorBoundary>
      </main>

      {/* Music player temporarily disabled */}

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
