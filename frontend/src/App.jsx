import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/AuthContext";
import { useWebSocket } from "./context/WebSocketContext";
import {
  Home, User, MessageCircle, Heart, Globe, LogOut,
  Menu, X, Bell, Music, BookOpen, Users,
  Calendar, Shield, PlayCircle, Sun
} from "lucide-react";

// Pages
import MuralGrid from "./pages/MuralGrid";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Members from "./pages/Members";
import Groups from "./pages/Groups";
import MusicLibrary from "./pages/MusicLibrary";
import Consecration from "./pages/Consecration";
import BiblicalAI from "./pages/BibleAI";
import PastorChat from "./pages/PastorChat";
import HelpRequests from "./pages/HelpRequests";
import Landing from "./pages/Landing";
import BiblicalCourse from "./pages/TheologyCourse";
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import DiarioComDeus from './pages/DiarioComDeus';
import LiveStream from './pages/LiveStream';
import FaithJourneys from "./pages/FaithJourneys";
import Reflection from "./pages/Reflection";
import AjudaUmaVida from "./pages/AjudaUmaVida";
import Chat from "./pages/Chat";
import Churches from "./pages/Churches";
import ChurchProfile from "./pages/ChurchProfile";
import PastorDashboard from "./pages/PastorDashboard";
import Friends from "./pages/Friends";
import Notifications from "./pages/Notifications";
import LiveCommunity from "./pages/LiveCommunity";

// Components
import LanguageSelector from "./components/LanguageSwitcher";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalChat from "./components/GlobalChat";

// Styles
import "./styles/ModernTheme.css";

export default function App() {
  const { t } = useTranslation();
  const { user, logout, loading, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
    setInstallPrompt(null);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hideSidebars, setHideSidebars] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    if (!token) return;
    const fetchPending = () => {
      fetch((import.meta.env.VITE_API_URL || '') + '/api/friends/requests', {
        headers: { Authorization: 'Bearer ' + token }
      }).then(r => r.json()).then(data => {
        setPendingRequests((data.requests || []).length);
      }).catch(() => {});
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [token]);
  useEffect(() => {
    if (!token) return;
    fetch((import.meta.env.VITE_API_URL || '') + '/api/notifications/unread-count', {
      headers: { Authorization: 'Bearer ' + token }
    }).then(r => r.json()).then(data => {
      if (data && data.count !== undefined) setUnreadMessages(data.count);
    }).catch(() => {});
  }, [token]);
  const wsCtx = useWebSocket();
  const lastEvent = wsCtx?.lastEvent;

  useEffect(() => {
    if (lastEvent?.type === 'direct_message' && lastEvent.senderId !== user?.id) {
      if (!location.pathname.startsWith('/mensagens')) {
        setUnreadMessages(prev => prev + 1);
      }
    }
    if (lastEvent?.type === 'friend_request') {
      setPendingRequests(prev => prev + 1);
    }
    if (lastEvent?.type === 'friend_accepted') {
      setPendingRequests(prev => Math.max(0, prev - 1));
    }
  }, [lastEvent]);

  useEffect(() => {
    if (location.pathname.startsWith('/mensagens') || location.pathname.startsWith('/notificacoes')) {
      setUnreadMessages(0);
    }
    if (location.pathname.startsWith('/amigos')) {
      setPendingRequests(0);
    }
    setMobileMenuOpen(false);
  }, [location]);

  if (loading) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f7ff',flexDirection:'column',gap:20}}>
      <div style={{width:50,height:50,border:'4px solid #e0e6f5',borderTopColor:'#4a80d4',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.2rem',fontWeight:600,color:'#3568b8'}}>Sigo com Fé...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/mural" element={<MuralGrid />} />
        <Route path="/membros" element={<Members />} />
        <Route path="/ia-biblica" element={<BiblicalAI />} />
        <Route path="/journeys" element={<FaithJourneys />} />
        <Route path="/musica" element={<MusicLibrary />} />
        <Route path="/comunidade-ao-vivo" element={<LiveCommunity />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  const isActive = (path) => location.pathname === path ? "menu-link active" : "menu-link";

  return (
    <div className="app-container">

      {/* TOPBAR */}
      <header className="topbar">
        
        <Link to="/" style={{display:'flex',alignItems:'center',gap:'9px',textDecoration:'none'}}>
          <img src='/logo-new.png' alt='Sigo com Fe' style={{height:38,width:38,objectFit:'cover',borderRadius:10}} />
        </Link>

        <nav className="nav-scroll desktop-only" style={{display:'flex',alignItems:'center',gap:'2px',marginLeft:'20px'}}>
          <Link to="/" className={`nav-item ${location.pathname==='/'?'active':''}`} style={{color:'white',textDecoration:'none',padding:'6px 11px',borderRadius:8,fontSize:'0.84rem',display:'flex',alignItems:'center',gap:6}}>
            <Home size={15}/> {t('nav.mural')}
          </Link>
          <Link to="/ia-biblica" className={`nav-item ${location.pathname==='/ia-biblica'?'active':''}`} style={{color:'white',textDecoration:'none',padding:'6px 11px',borderRadius:8,fontSize:'0.84rem',display:'flex',alignItems:'center',gap:6}}>
            <BookOpen size={15}/> {t('nav.bible_ai')}
          </Link>
          <Link to="/membros" className={`nav-item ${location.pathname.startsWith('/membros')?'active':''}`} style={{color:'white',textDecoration:'none',padding:'6px 11px',borderRadius:8,fontSize:'0.84rem',display:'flex',alignItems:'center',gap:6}}>
            <Users size={15}/> {t('nav.members')}
          </Link>
          <Link to="/journeys" className={`nav-item ${location.pathname==='/journeys'?'active':''}`} style={{color:'white',textDecoration:'none',padding:'6px 11px',borderRadius:8,fontSize:'0.84rem',display:'flex',alignItems:'center',gap:6}}>
            <Globe size={15}/> {t('nav.journeys')}
          </Link>
        </nav>

        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          <LanguageSelector />
          <Link to="/notificacoes" style={{position:'relative',background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',color:'white',cursor:'pointer',textDecoration:'none'}}>
            <Bell size={17}/>{unreadMessages > 0 && <span style={{ position:'absolute', top:-4, right:-4, background:'#e11d48', color:'white', borderRadius:'50%', width:16, height:16, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{unreadMessages > 9 ? '9+' : unreadMessages}</span>}
          </Link>
          <Link to={`/perfil/${user.id}`} style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',color:'white',cursor:'pointer',overflow:'hidden',textDecoration:'none'}}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Me" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            ) : (
              <User size={17}/>
            )}
          </Link>
          <button className="icon-btn mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{background:'transparent',border:'none',color:'white',display:'none',cursor:'pointer'}}>
            {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        <button onClick={() => setHideSidebars(!hideSidebars)} className="desktop-only"
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '6px 10px', borderRadius: 6, fontSize: 18 }}
            title={hideSidebars ? 'Mostrar menus' : 'Esconder menus'}>
            {hideSidebars ? '☰' : '✕'}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div style={{position:'fixed',inset:0,zIndex:299,background:'rgba(0,0,0,0.92)',padding:'60px 20px 20px',overflowY:'auto'}}>
          <div style={{marginBottom:'20px'}}>
            <p style={{color:'#c9a84c',fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'10px',paddingLeft:'16px'}}>{t('nav.spiritual_life')}</p>
            {[
              ['/pedidos-ajuda', <Heart size={20}/>, t('nav.prayers')],
              ['/consagracao', <PlayCircle size={20}/>, t('nav.consecration')],
              ['/reflexao', <Sun size={20}/>, t('nav.reflection')],
              ['/curso-biblico', <BookOpen size={20}/>, t('course.title')],
              ['/ajuda-uma-vida', <Heart size={20}/>, t('nav.help_life')],
              ['/journeys', <Globe size={20}/>, t('nav.journeys')],
              ['/live', <PlayCircle size={20}/>, '🔴 Directo'],
              ['/chat-pastoral', <MessageCircle size={20}/>, t('nav.pastoral_chat')],
              ['/diario-com-deus', <BookOpen size={20}/>, t('nav.diary')],
            ].map(([to, icon, label, badge]) => (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1rem',textDecoration:'none',padding:'11px 16px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                {icon} {label}
                {badge > 0 && <span style={{marginLeft:'auto',background:'#e11d48',color:'white',borderRadius:'50%',minWidth:18,height:18,fontSize:'0.68rem',fontWeight:700,display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'0 4px'}}>{badge > 99 ? '99+' : badge}</span>}
              </Link>
            ))}
          </div>
          <div style={{marginBottom:'20px'}}>
            <p style={{color:'rgba(255,255,255,0.5)',fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'10px',paddingLeft:'16px'}}>Menu</p>
            {[
              [`/perfil/${user?.id}`, <User size={20}/>, 'Meu Perfil'],
              ['/', <Home size={20}/>, t('nav.mural')],
              ['/mensagens', <MessageCircle size={20}/>, t('nav.messages', 'Mensagens'), unreadMessages],
              ['/amigos', <Users size={20}/>, t('nav.friends', 'Amigos'), pendingRequests],
              ['/membros', <Users size={20}/>, t('nav.members')],
              ['/igrejas', <Globe size={20}/>, t('churches.title', 'Igrejas')],
              ['/musica', <Music size={20}/>, t('nav.music')],
              ['/comunidade-ao-vivo', <Music size={20}/>, '🎵 ' + t('nav.live_community', 'Comunidade ao Vivo')],
              ['/ia-biblica', <BookOpen size={20}/>, t('nav.bible_ai', 'IA Bíblica')],
              ['/grupos', <Users size={20}/>, t('nav.groups')],
            ].map(([to, icon, label]) => (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1rem',textDecoration:'none',padding:'11px 16px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                {icon} {label}
              </Link>
            ))}
            {user?.role === 'pastor' && (
              <Link to="/sala-pastor" onClick={() => setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'#c9a84c',fontSize:'1rem',textDecoration:'none',padding:'11px 16px',borderBottom:'1px solid rgba(255,255,255,0.08)',fontWeight:600}}>
                <BookOpen size={20}/> 🕊️ Sala do Pastor
              </Link>
            )}
          </div>
          <button onClick={logout} style={{display:'flex',alignItems:'center',gap:'12px',color:'#ff6b6b',fontSize:'1rem',background:'none',border:'none',textAlign:'left',width:'100%',padding:'11px 16px',cursor:'pointer'}}>
            <LogOut size={20}/> {t('auth.logout')}
          </button>
        </div>
      )}

      {/* MAIN LAYOUT */}
      {sidebarOpen&&<div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:199,background:'rgba(0,0,0,0.5)'}} onClick={()=>setSidebarOpen(false)}/>}{sidebarOpen&&<aside style={{position:'fixed',top:0,left:0,width:260,height:'100vh',background:'#1a1a2e',zIndex:200,overflowY:'auto',padding:'16px 0'}}><button onClick={()=>setSidebarOpen(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',color:'white',fontSize:22,cursor:'pointer'}}>&#x2715;</button><div style={{padding:'40px 16px 16px'}}><p style={{color:'#f0c040',fontWeight:700,marginBottom:16}}>{user.full_name}</p>{[['/','Mural'],['/diario-com-deus',t('nav.diary')],['/pedidos-ajuda',t('nav.prayers')],['/membros',t('nav.members')],['/amigos',t('nav.friends')],['/mensagens',t('nav.messages')],['/musica',t('nav.music')],['/chat-pastoral',t('nav.pastoral_chat')]].map(([to,label])=><Link key={to} to={to} onClick={()=>setSidebarOpen(false)} style={{display:'block',color:'white',textDecoration:'none',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.1)',fontSize:14}}>{label}</Link>)}</div></aside>}
      <div className="modern-layout" style={{ gridTemplateColumns: hideSidebars ? "1fr" : undefined }}>

        {/* LEFT SIDEBAR */}
        <aside className="sidebar-left desktop-only" style={{ overflowY: "auto", maxHeight: "calc(100vh - 60px)", display: hideSidebars ? "none" : undefined }}>

          {/* Profile Card */}
          <div className="profile-card-modern">
            <div className="prof-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Me" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} />
              ) : (
                <span style={{fontSize:'1.8rem'}}>{user.full_name?.charAt(0)}</span>
              )}
            </div>
            <p className="prof-name">{user.full_name || t('common.user')}</p>
            <p style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.75)',marginBottom:4,fontStyle:'italic',lineHeight:1.4,padding:'0 4px'}}>
              {t('common.welcomeBack')}
            </p>
            {/* Bible verse — golden */}
            <p style={{fontSize:'0.7rem',color:'#f0c040',fontStyle:'italic',lineHeight:1.5,marginBottom:12,padding:'0 4px',fontFamily:"'Cormorant Garamond',serif"}}>
              "O Senhor é o meu pastor; nada me faltará." — Sl 23:1
            </p>
            <div className="prof-stats">
              <div className="prof-stat">
                <div className="prof-stat-n">{user.friendsCount || 0}</div>
                <div className="prof-stat-l">{t('profile.friends')}</div>
              </div>
              <div className="prof-stat">
                <div className="prof-stat-n">{user.prayersCount || 0}</div>
                <div className="prof-stat-l">{t('nav.prayers')}</div>
              </div>
            </div>
          </div>

          <div className="menu-group">
            <p className="menu-title">{t('nav.spiritual_life')}</p>
            <Link to="/pedidos-ajuda" className={isActive('/pedidos-ajuda')}><Heart size={17}/> {t('nav.prayers')}</Link>
            <Link to="/consagracao" className={isActive('/consagracao')}><PlayCircle size={17}/> {t('nav.consecration')}</Link>
            <Link to="/reflexao" className={isActive('/reflexao')}><Sun size={17}/> {t('nav.reflection')}</Link>
            <Link to="/curso-biblico" className={isActive('/curso-biblico')}><BookOpen size={17}/> {t('course.title')}</Link>
            <Link to="/ajuda-uma-vida" className={isActive('/ajuda-uma-vida')}><Heart size={17}/> {t('nav.help_life')}</Link>
            <Link to="/journeys" className={isActive('/journeys')}><Globe size={17}/> {t('nav.journeys')}</Link>
            <Link to='/diario-com-deus' className={isActive('/diario-com-deus')}><BookOpen size={17}/> {t('nav.diary')}</Link>
            <Link to="/chat-pastoral" className={isActive('/chat-pastoral')}><MessageCircle size={17}/> {t('nav.pastoral_chat')}</Link>
          </div>

          <div className="menu-group">
            <p className="menu-title">Menu</p>
            <Link to="/" className={isActive('/')}><Home size={17}/> {t('nav.mural')}</Link>
            <Link to={`/perfil/${user.id}`} className={isActive(`/perfil/${user.id}`)}><User size={17}/> Meu Perfil</Link>
            <Link to="/mensagens" className={location.pathname.startsWith('/mensagens') ? 'menu-link active' : 'menu-link'} style={{position:'relative'}}>
              <MessageCircle size={17}/> {t('nav.messages')}
              {unreadMessages > 0 && (
                <span style={{marginLeft:'auto',background:'#e74c3c',color:'white',borderRadius:'50%',minWidth:18,height:18,fontSize:'0.68rem',fontWeight:700,display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'0 4px',lineHeight:1}}>
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </Link>
            <Link to="/amigos" className={isActive('/amigos')} style={{position:'relative'}}><Users size={17}/> {t('nav.friends', 'Amigos')}{pendingRequests > 0 && <span style={{marginLeft:'auto',background:'#e11d48',color:'white',borderRadius:'50%',minWidth:18,height:18,fontSize:'0.68rem',fontWeight:700,display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'0 4px'}}>{pendingRequests}</span>}</Link>
            <Link to="/membros" className={isActive('/membros')}><Users size={17}/> {t('nav.members')}</Link>
            <Link to="/grupos" className={isActive('/grupos')}><Users size={17}/> {t('nav.groups')}</Link>
            <Link to="/musica" className={isActive('/musica')}><Music size={17}/> {t('nav.music')}</Link>
            <Link to="/comunidade-ao-vivo" className={isActive('/comunidade-ao-vivo')}><Music size={17}/> 🎵 Comunidade ao Vivo</Link>
            <Link to="/igrejas" className={location.pathname.startsWith('/igrejas') ? 'menu-link active' : 'menu-link'}>⛪ {t('nav.churches', 'Igrejas')}</Link>
          </div>

          {(user.role === 'pastor' || user.role === 'admin') && (
            <div className="menu-group">
              <p className="menu-title">Admin</p>
              <Link to="/pedidos-ajuda" className={isActive('/pedidos-ajuda')}><Heart size={17}/> {t('nav.help_requests')}</Link>
              <Link to="/pastor-dashboard" className={isActive('/pastor-dashboard')}><Shield size={17}/> Dashboard</Link>
              <Link to="/sala-pastor" className={isActive('/sala-pastor')}><Shield size={17}/> Sala do Pastor</Link>
            </div>
          )}

          <button className="menu-link logout-btn" onClick={logout} style={{marginTop:14}}>
            <LogOut size={17}/> {t('auth.logout')}
          </button>
        </aside>

        {/* CENTER FEED */}
        <main className="main-content-area">
          <Routes>
            <Route path="/" element={<MuralGrid />} />
            <Route path="/perfil/:userId" element={<Profile />} />
            <Route path="/membros" element={<Members />} />
            <Route path="/ia-biblica" element={<BiblicalAI />} />
            <Route path="/chat-pastoral" element={<PastorChat />} />
            <Route path="/curso-biblico" element={<BiblicalCourse />} />
            <Route path="/journeys" element={<FaithJourneys />} />
            <Route path="/grupos" element={<Groups />} />
            <Route path="/musica" element={<MusicLibrary />} />
            <Route path="/consagracao" element={<Consecration />} />
            <Route path="/reflexao" element={<Reflection />} />
            <Route path="/ajuda-uma-vida" element={<AjudaUmaVida />} />
            <Route path="/mensagens" element={<Chat />} />
            <Route path="/mensagens/:userId" element={<Chat />} />
            <Route path="/amigos" element={<Friends />} />
            <Route path="/notificacoes" element={<Notifications />} />
            <Route path="/pedidos-ajuda" element={<HelpRequests />} />
            <Route path="/pastor-dashboard" element={<ProtectedRoute role="pastor"><PastorDashboard /></ProtectedRoute>} />
            <Route path="/igrejas" element={<Churches />} />
            <Route path="/igrejas/:id" element={<ChurchProfile />} />
            <Route path="/sala-pastor" element={<ProtectedRoute role="pastor"><PastorDashboard />
        <Route path="/dizimos" element={<Offerings />} /></ProtectedRoute>} />
                    <Route path='/diario-com-deus' element={<DiarioComDeus />} />
            <Route path='/live' element={<LiveStream />} />
            <Route path='/comunidade-ao-vivo' element={<LiveCommunity />} />
          <Route path='/privacidade' element={<PrivacyPolicy />} />
          <Route path='/termos' element={<TermsOfUse />} />
</Routes>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="sidebar-right desktop-only" style={{ display: hideSidebars ? "none" : undefined }}>

          {/* LIVE Widget — golden theme */}
          <div style={{background:'linear-gradient(135deg,#3568b8 0%,#4a80d4 60%,#6a9ade 100%)',borderRadius:14,padding:18,marginBottom:14,color:'white',position:'relative',overflow:'hidden',border:'1px solid rgba(240,192,64,0.3)'}}>
            {/* gold top border accent */}
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,transparent,#f0c040,transparent)'}}/>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'#f0c040',marginBottom:8}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#f0c040',boxShadow:'0 0 6px #f0c040',display:'inline-block'}}></span> DIRECTO
            </div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1rem',fontWeight:600,marginBottom:4}}>{t('live.none')}</p>
            <p style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.55)',marginBottom:14}}>{t('live.be_first')}</p>
            {/* Golden button */}
            <button style={{width:'100%',padding:10,borderRadius:10,background:'linear-gradient(135deg,#c49a28,#f0c040)',color:'#1e2240',fontSize:'0.78rem',fontWeight:700,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,boxShadow:'0 3px 10px rgba(240,192,64,0.4)'}}>
              <a href='/live' style={{color:'inherit',textDecoration:'none',display:'flex',alignItems:'center',gap:6}}><PlayCircle size={15}/> {t('live.start')}</a>
            </button>
          </div>

          {/* Prayers Widget */}
          <div className="modern-card widget-card">
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'0.95rem',fontWeight:700,color:'var(--text)',marginBottom:12,display:'flex',alignItems:'center',gap:7,borderBottom:'1px solid var(--border)',paddingBottom:10}}>
              <Heart size={15} style={{color:'var(--gold)'}}/> {t('nav.prayers')}
            </div>
            <div style={{display:'flex',gap:9,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#4a80d4,#6a9ade)',flexShrink:0,fontSize:'0.85rem'}}>🙏</div>
              <div>
                <p style={{fontSize:'0.76rem',color:'var(--text)',lineHeight:1.4}}><b style={{color:'var(--fb)'}}>Ana Costa</b> pede saúde</p>
                <button style={{marginTop:4,padding:'3px 10px',borderRadius:10,fontSize:'0.66rem',fontWeight:600,border:'1px solid #e8c04060',background:'#fffbec',color:'#a07820',cursor:'pointer'}}>{t('mural.pray')}</button>
              </div>
            </div>
            <div style={{display:'flex',gap:9,padding:'8px 0'}}>
              <div style={{width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#a07820,#c49a28)',flexShrink:0,fontSize:'0.85rem'}}>🕊️</div>
              <div>
                <p style={{fontSize:'0.76rem',color:'var(--text)',lineHeight:1.4}}><b style={{color:'var(--fb)'}}>Carlos</b> pede paz</p>
                <button style={{marginTop:4,padding:'3px 10px',borderRadius:10,fontSize:'0.66rem',fontWeight:600,border:'1px solid #e8c04060',background:'#fffbec',color:'#a07820',cursor:'pointer'}}>{t('mural.pray')}</button>
              </div>
            </div>
          </div>

          {/* Events Widget */}
          <div className="modern-card widget-card">
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'0.95rem',fontWeight:700,color:'var(--text)',marginBottom:12,display:'flex',alignItems:'center',gap:7,borderBottom:'1px solid var(--border)',paddingBottom:10}}>
              <Calendar size={15} style={{color:'var(--gold)'}}/> {t('events.title')}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:38,height:38,borderRadius:9,background:'linear-gradient(135deg,#3568b8,#4a80d4)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1rem',fontWeight:700,color:'#f0c040',lineHeight:1}}>09</span>
                <span style={{fontSize:'0.48rem',color:'rgba(255,255,255,0.7)',textTransform:'uppercase'}}>MAR</span>
              </div>
              <div>
                <p style={{fontSize:'0.8rem',fontWeight:600,color:'var(--text)'}}>Culto Dominical</p>
                <p style={{fontSize:'0.7rem',color:'var(--muted)'}}>10:00h · Online</p>
              </div>
            </div>
          </div>

          {showInstall && (
          <div style={{marginTop:16,background:'linear-gradient(135deg,#667eea,#764ba2)',borderRadius:12,padding:'14px 16px',textAlign:'center'}}>
            <p style={{color:'#fff',fontWeight:700,fontSize:'0.85rem',margin:'0 0 8px'}}>📲 Instalar App</p>
            <p style={{color:'rgba(255,255,255,0.8)',fontSize:'0.75rem',margin:'0 0 10px'}}>Acede mais rapido no teu telemovel</p>
            <button onClick={handleInstallClick} style={{display:'inline-block',background:'#fff',color:'#667eea',borderRadius:8,padding:'8px 16px',fontWeight:700,fontSize:'0.8rem',border:'none',cursor:'pointer'}}>⬇️ Instalar</button>
          </div>
          )}

        </aside>

      </div>

      <style>{`
        @media (max-width: 1100px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
          .modern-layout { grid-template-columns: 1fr; }
          .mobile-bottom-nav { display: flex !important; }
          .main-content-area { padding-bottom: 70px !important; }
        }
        @media (min-width: 1101px) {
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>

      {/* MENU INFERIOR MOBILE */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
        background: 'white', borderTop: '1px solid #e0e0e0',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 0 12px', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }} className="mobile-bottom-nav">
        {[
          { to: '/', icon: <Home size={22}/>, label: t('nav.mural', 'Início') },
          { to: '/amigos', icon: <Users size={22}/>, label: t('nav.friends', 'Amigos'), badge: pendingRequests },
          { to: '/mensagens', icon: <MessageCircle size={22}/>, label: t('nav.messages', 'Mensagens'), badge: unreadMessages },
          { to: '/sala-pastor', icon: <span style={{fontSize:20}}>💰</span>, label: t('nav.tithe', 'Dízimo') },
          { to: `/perfil/${user.id}`, icon: user.avatar_url ? <img src={user.avatar_url} style={{width:24,height:24,borderRadius:'50%',objectFit:'cover'}}/> : <User size={22}/>, label: t('common.profile', 'Perfil') },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            textDecoration: 'none', color: location.pathname === item.to ? '#667eea' : '#888',
            fontSize: 10, fontWeight: 600, position: 'relative', minWidth: 50,
          }}>
            {item.badge > 0 && <span style={{position:'absolute',top:-4,right:8,background:'#e11d48',color:'white',borderRadius:'50%',width:16,height:16,fontSize:9,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>{item.badge > 9 ? '9+' : item.badge}</span>}
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <GlobalChat />
    </div>
  );
}
