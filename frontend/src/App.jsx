import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/AuthContext";
import { 
  Home, User, MessageCircle, Heart, Globe, Settings, LogOut, 
  Menu, X, Bell, Search, Video, Music, BookOpen, Users, 
  Calendar, Gift, Shield, ChevronRight, PlayCircle, Sun
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
import BiblicalCourse from "./pages/BiblicalCourse";
import FaithJourneys from "./pages/FaithJourneys";
import Reflection from "./pages/Reflection";
import AjudaUmaVida from "./pages/AjudaUmaVida";

// Components
import LanguageSelector from "./components/LanguageSwitcher";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalChat from "./components/GlobalChat";

// Styles
import "./styles/ModernTheme.css";

export default function App() {
  const { t } = useTranslation();
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (loading) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',color:'var(--fb2)',flexDirection:'column',gap:20}}>
      <div style={{width:50,height:50,border:'4px solid #e2e8f0',borderTopColor:'var(--fb)',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.2rem',fontWeight:600}}>Carregando Sigo com Fé...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  const isActive = (path) => location.pathname === path ? "menu-link active" : "menu-link";

  return (
    <div className="app-container">

      {/* TOPBAR */}
      <header className="topbar">
        <Link to="/" className="logo-area" style={{display:'flex',alignItems:'center',gap:'9px',textDecoration:'none'}}>
          <div className="logo-icon" style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#fff 0%,var(--gold3) 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}>📖</div>
          <span className="logo-text" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.15rem',fontWeight:700,color:'#fff',letterSpacing:'0.03em'}}>Sigo com Fé</span>
        </Link>

        <nav className="nav-scroll desktop-only" style={{display:'flex',alignItems:'center',gap:'2px',marginLeft:'20px'}}>
          <Link to="/" className={`nav-item ${location.pathname==='/'?'active':''}`} style={{color:'white',textDecoration:'none',padding:'7px 11px',borderRadius:8,fontSize:'0.85rem',display:'flex',alignItems:'center',gap:6}}>
            <Home size={16}/> {t('nav.mural')}
          </Link>
          <Link to="/ia-biblica" className={`nav-item ${location.pathname==='/ia-biblica'?'active':''}`} style={{color:'white',textDecoration:'none',padding:'7px 11px',borderRadius:8,fontSize:'0.85rem',display:'flex',alignItems:'center',gap:6}}>
            <BookOpen size={16}/> {t('nav.bible_ai')}
          </Link>
          <Link to="/membros" className={`nav-item ${location.pathname.startsWith('/membros')?'active':''}`} style={{color:'white',textDecoration:'none',padding:'7px 11px',borderRadius:8,fontSize:'0.85rem',display:'flex',alignItems:'center',gap:6}}>
            <Users size={16}/> {t('nav.members')}
          </Link>
          <Link to="/journeys" className={`nav-item ${location.pathname==='/journeys'?'active':''}`} style={{color:'white',textDecoration:'none',padding:'7px 11px',borderRadius:8,fontSize:'0.85rem',display:'flex',alignItems:'center',gap:6}}>
            <Globe size={16}/> {t('nav.journeys')}
          </Link>
        </nav>

        <div className="topbar-right" style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          <LanguageSelector />
          <button className="icon-btn" style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',color:'white',cursor:'pointer',position:'relative'}}>
            <Bell size={18} />
            <span className="badge" style={{position:'absolute',top:-2,right:-2,background:'red',width:14,height:14,borderRadius:'50%',fontSize:9,display:'flex',alignItems:'center',justifyContent:'center'}}>2</span>
          </button>
          <Link to={`/perfil/${user.id}`} className="icon-btn" style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',color:'white',cursor:'pointer',overflow:'hidden'}}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Me" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            ) : (
              <User size={18} />
            )}
          </Link>
          <button className="icon-btn mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{background:'transparent',border:'none',color:'white',display:'none'}}>
            {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{position:'fixed',inset:0,zIndex:299,background:'rgba(0,0,0,0.95)',padding:'60px 20px 20px',overflowY:'auto'}}>
          <div className="menu-group" style={{marginBottom:'25px'}}>
            <p className="menu-title" style={{color:'var(--gold)',fontSize:'1rem',fontWeight:'bold',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:'10px',paddingLeft:'16px'}}>{t('nav.spiritual_life')}</p>
            <Link to="/pedidos-ajuda" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Heart size={20}/> {t('nav.prayers')}
            </Link>
            <Link to="/consagracao" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <PlayCircle size={20}/> {t('nav.consecration')}
            </Link>
            <Link to="/reflexao" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Sun size={20}/> {t('nav.reflection')}
            </Link>
            <Link to="/curso-biblico" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <BookOpen size={20}/> {t('course.title')}
            </Link>
            <Link to="/ajuda-uma-vida" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Heart size={20}/> {t('nav.help_life')}
            </Link>
            <Link to="/journeys" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Globe size={20}/> {t('nav.journeys')}
            </Link>
            <Link to="/chat-pastoral" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <MessageCircle size={20}/> {t('nav.pastoral_chat')}
            </Link>
          </div>

          <div className="menu-group" style={{marginBottom:'25px'}}>
            <p className="menu-title" style={{color:'rgba(255,255,255,0.6)',fontSize:'1rem',fontWeight:'bold',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:'10px',paddingLeft:'16px'}}>Menu</p>
            <Link to="/" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Home size={20}/> {t('nav.mural')}
            </Link>
            <Link to="/membros" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Users size={20}/> {t('nav.members')}
            </Link>
            <Link to="/grupos" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Users size={20}/> {t('nav.groups')}
            </Link>
            <Link to="/musica" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Music size={20}/> {t('nav.music')}
            </Link>
          </div>

          {(user.role === 'pastor' || user.role === 'admin') && (
            <div className="menu-group" style={{marginBottom:'25px'}}>
              <p className="menu-title" style={{color:'rgba(255,255,255,0.6)',fontSize:'1rem',fontWeight:'bold',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:'10px',paddingLeft:'16px'}}>Admin</p>
              <Link to="/pedidos-ajuda" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                <Heart size={20}/> {t('nav.help_requests')}
              </Link>
              <Link to="/pastor-dashboard" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex',alignItems:'center',gap:'12px',color:'white',fontSize:'1.1rem',textDecoration:'none',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                <Shield size={20}/> Dashboard
              </Link>
            </div>
          )}

          <button onClick={logout} style={{display:'flex',alignItems:'center',gap:'12px',color:'#ff6b6b',fontSize:'1.1rem',background:'none',border:'none',textAlign:'left',width:'100%',padding:'12px 16px',marginTop:'10px',cursor:'pointer'}}>
            <LogOut size={20}/> {t('auth.logout')}
          </button>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="modern-layout">

        {/* LEFT SIDEBAR */}
        <aside className="sidebar-left desktop-only">
          <div className="profile-card-modern">
            <div className="prof-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Me" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} />
              ) : (
                <span style={{fontSize:'1.8rem'}}>{user.full_name?.charAt(0)}</span>
              )}
            </div>
            <p className="prof-name">{user.full_name || t('common.user')}</p>
            <p className="prof-role" style={{fontSize:'0.85rem',opacity:0.9,marginBottom:16}}>
              {t('common.welcomeBack')}
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
            <Link to="/pedidos-ajuda" className={isActive('/pedidos-ajuda')}>
              <Heart size={18}/> {t('nav.prayers')}
            </Link>
            <Link to="/consagracao" className={isActive('/consagracao')}>
              <PlayCircle size={18}/> {t('nav.consecration')}
            </Link>
            <Link to="/reflexao" className={isActive('/reflexao')}>
              <Sun size={18}/> {t('nav.reflection')}
            </Link>
            <Link to="/curso-biblico" className={isActive('/curso-biblico')}>
              <BookOpen size={18}/> {t('course.title')}
            </Link>
            <Link to="/ajuda-uma-vida" className={isActive('/ajuda-uma-vida')}>
              <Heart size={18}/> {t('nav.help_life')}
            </Link>
            <Link to="/journeys" className={isActive('/journeys')}>
              <Globe size={18}/> {t('nav.journeys')}
            </Link>
            <Link to="/chat-pastoral" className={isActive('/chat-pastoral')}>
              <MessageCircle size={18}/> {t('nav.pastoral_chat')}
            </Link>
          </div>

          <div className="menu-group">
            <p className="menu-title">Menu</p>
            <Link to="/" className={isActive('/')}>
              <Home size={18}/> {t('nav.mural')}
            </Link>
            <Link to="/membros" className={isActive('/membros')}>
              <Users size={18}/> {t('nav.members')}
            </Link>
            <Link to="/grupos" className={isActive('/grupos')}>
              <Users size={18}/> {t('nav.groups')}
            </Link>
            <Link to="/musica" className={isActive('/musica')}>
              <Music size={18}/> {t('nav.music')}
            </Link>
          </div>

          {(user.role === 'pastor' || user.role === 'admin') && (
            <div className="menu-group">
              <p className="menu-title">Admin</p>
              <Link to="/pedidos-ajuda" className={isActive('/pedidos-ajuda')}>
                <Heart size={18}/> {t('nav.help_requests')}
              </Link>
              <Link to="/pastor-dashboard" className={isActive('/pastor-dashboard')}>
                <Shield size={18}/> Dashboard
              </Link>
            </div>
          )}

          <button className="menu-link logout-btn" onClick={logout} style={{marginTop:20,color:'red',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8,width:'100%',padding:'8px 12px',borderRadius:8}}>
            <LogOut size={18}/> {t('auth.logout')}
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
            <Route path="/pedidos-ajuda" element={
              <ProtectedRoute role="pastor"><HelpRequests /></ProtectedRoute>
            } />
            <Route path="/pastor-dashboard" element={
              <ProtectedRoute role="pastor"><div style={{padding:20}}>Dashboard em construção...</div></ProtectedRoute>
            } />
          </Routes>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="sidebar-right desktop-only">
          <div className="live-widget" style={{background:'linear-gradient(135deg,var(--fb2) 0%,#0D4FAA 60%,#0A3580 100%)',borderRadius:14,padding:18,marginBottom:14,color:'white',position:'relative',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'#FF6B6B',marginBottom:8}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#FF4444',display:'inline-block'}}></span> DIRECTO
            </div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1rem',fontWeight:600,marginBottom:4}}>{t('live.none')}</p>
            <p style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',marginBottom:14}}>{t('live.be_first')}</p>
            <button style={{width:'100%',padding:10,borderRadius:10,background:'linear-gradient(135deg,#FF4444,#CC2222)',color:'white',fontSize:'0.78rem',fontWeight:600,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
              <PlayCircle size={16}/> {t('live.start')}
            </button>
          </div>

          <div className="modern-card widget-card">
            <div className="widget-header" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'0.98rem',fontWeight:700,color:'var(--text)',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
              <Heart size={16} style={{color:'var(--gold)'}}/> {t('nav.prayers')}
            </div>
            <div className="widget-item" style={{display:'flex',gap:9,padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,var(--fb),#3AAAD4)',flexShrink:0}}>🙏</div>
              <div>
                <p style={{fontSize:'0.78rem',color:'var(--text)',lineHeight:1.4}}><b style={{color:'var(--fb2)'}}>Ana Costa</b> pede saúde</p>
                <button style={{marginTop:5,padding:'4px 11px',borderRadius:10,fontSize:'0.68rem',fontWeight:600,border:'1px solid rgba(201,168,76,0.3)',background:'rgba(201,168,76,0.07)',color:'var(--gold)',cursor:'pointer'}}>{t('mural.pray')}</button>
              </div>
            </div>
            <div className="widget-item" style={{display:'flex',gap:9,padding:'9px 0'}}>
              <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,var(--gold),#8B6914)',flexShrink:0}}>🕊️</div>
              <div>
                <p style={{fontSize:'0.78rem',color:'var(--text)',lineHeight:1.4}}><b style={{color:'var(--fb2)'}}>Carlos</b> pede paz</p>
                <button style={{marginTop:5,padding:'4px 11px',borderRadius:10,fontSize:'0.68rem',fontWeight:600,border:'1px solid rgba(201,168,76,0.3)',background:'rgba(201,168,76,0.07)',color:'var(--gold)',cursor:'pointer'}}>{t('mural.pray')}</button>
              </div>
            </div>
          </div>

          <div className="modern-card widget-card">
            <div className="widget-header" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'0.98rem',fontWeight:700,color:'var(--text)',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
              <Calendar size={16} style={{color:'var(--gold)'}}/> {t('events.title')}
            </div>
            <div className="widget-item" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0'}}>
              <div style={{width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,var(--fb2),var(--fb))',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.05rem',fontWeight:700,color:'var(--gold2)',lineHeight:1}}>09</span>
                <span style={{fontSize:'0.52rem',color:'rgba(255,255,255,0.55)',textTransform:'uppercase'}}>MAR</span>
              </div>
              <div>
                <p style={{fontSize:'0.8rem',fontWeight:600,color:'var(--text)'}}>Culto Dominical</p>
                <p style={{fontSize:'0.7rem',color:'var(--muted)'}}>10:00h · Online</p>
              </div>
            </div>
          </div>
        </aside>

      </div>

      <style>{`
        @media (max-width: 1100px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
          .modern-layout { grid-template-columns: 1fr; }
        }
      `}</style>

      <GlobalChat />
    </div>
  );
}
