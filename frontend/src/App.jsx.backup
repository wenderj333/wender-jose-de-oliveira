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
import BiblicalCourse from "./pages/BiblicalCourse";
import FaithJourneys from "./pages/FaithJourneys";
import Reflection from "./pages/Reflection";
import AjudaUmaVida from "./pages/AjudaUmaVida";

// Components

// Styles

export default function App() {
  const { t } = useTranslation();
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  // Helper for active link class
  const isActive = (path) => location.pathname === path ? "menu-link active" : "menu-link";

  return (
    <div className="app-container">
      
      {/* ── TOPBAR ── */}
      <header className="topbar">
        <Link to="/" className="logo-area" style={{display:'flex',alignItems:'center',gap:'9px',textDecoration:'none'}}>
          <div className="logo-icon" style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#fff 0%,var(--gold3) 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}>📖</div>
          <span className="logo-text" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.15rem',fontWeight:700,color:'#fff',letterSpacing:'0.03em'}}>Sigo com Fé</span>
        </Link>

        {/* Desktop Nav Scroll (Quick Links) */}
        <nav className="nav-scroll desktop-only" style={{display:'flex',alignItems:'center',gap:'2px',marginLeft:'20px'}}>
          <Link to="/" className={`nav-item ${location.pathname==='/'?'active':''}`} style={{color:'white',textDecoration:'none',padding:'7px 11px',borderRadius:8,fontSize:'0.85rem',display:'flex',alignItems:'center',gap:6}}>
            <Home size={16}/> {t('nav.mural', 'Mural')}
          </Link>
          <Link to="/ia-biblica" className={`nav-item ${location.pathname==='/ia-biblica'?'active':''}`} style={{color:'white',textDecoration:'none',padding:'7px 11px',borderRadius:8,fontSize:'0.85rem',display:'flex',alignItems:'center',gap:6}}>
            <BookOpen size={16}/> {t('nav.bible_ai', 'Bíblia IA')}
          </Link>
          <Link to="/membros" className={`nav-item ${location.pathname.startsWith('/membros')?'active':''}`} style={{color:'white',textDecoration:'none',padding:'7px 11px',borderRadius:8,fontSize:'0.85rem',display:'flex',alignItems:'center',gap:6}}>
            <Users size={16}/> {t('nav.members', 'Membros')}
          </Link>
           <Link to="/journeys" className={`nav-item ${location.pathname==='/journeys'?'active':''}`} style={{color:'white',textDecoration:'none',padding:'7px 11px',borderRadius:8,fontSize:'0.85rem',display:'flex',alignItems:'center',gap:6}}>
            <Globe size={16}/> {t('nav.journeys', 'Jornadas')}
          </Link>
        </nav>

        <div className="topbar-right" style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          
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

          {/* Mobile Menu Toggle */}
          <button className="icon-btn mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{background:'transparent',border:'none',color:'white',display:'none'}}>
            {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU OVERLAY ── */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{position:'fixed',inset:0,zIndex:299,background:'rgba(0,0,0,0.95)',padding:'60px 20px 20px',overflowY:'auto'}}>
          {/* VIDA ESPIRITUAL */}
          <div className="menu-group" style={{marginBottom:'25px'}}>
            <p className="menu-title" style={{color:'var(--gold)', fontSize:'1rem', fontWeight:'bold', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:'10px', paddingLeft:'16px'}}>Vida Espiritual</p>
            <Link to="/pedidos-ajuda" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Heart size={20} /> Pedidos de Ajuda
            </Link>
            <Link to="/consagracao" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <PlayCircle size={20} /> Consagração & Jejum
            </Link>
            <Link to="/reflexao" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Sun size={20} /> Reflexão com Deus
            </Link>
            <Link to="/curso-biblico" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <BookOpen size={20} /> Bíblia & Estudo
            </Link>
            <Link to="/ajuda-uma-vida" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Heart size={20} /> Ajude o Próximo
            </Link>
            <Link to="/journeys" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Globe size={20} /> Jornadas de Fé
            </Link>
            <Link to="/chat-pastoral" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <MessageCircle size={20} /> Fale com o Pastor
            </Link>
          </div>

          {/* MENU GERAL */}
          <div className="menu-group" style={{marginBottom:'25px'}}>
            <p className="menu-title" style={{color:'rgba(255,255,255,0.6)', fontSize:'1rem', fontWeight:'bold', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:'10px', paddingLeft:'16px'}}>Menu</p>
            <Link to="/" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Home size={20} /> Mural
            </Link>
            <Link to="/membros" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Users size={20} /> Membros
            </Link>
            <Link to="/grupos" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Users size={20} /> Grupos
            </Link>
            <Link to="/musica" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <Music size={20} /> Música
            </Link>
          </div>

          {/* ADMIN (se for pastor/admin) */}
          {(user.role === 'pastor' || user.role === 'admin') && (
            <div className="menu-group" style={{marginBottom:'25px'}}>
              <p className="menu-title" style={{color:'rgba(255,255,255,0.6)', fontSize:'1rem', fontWeight:'bold', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:'10px', paddingLeft:'16px'}}>Admin</p>
              <Link to="/pedidos-ajuda" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                <Heart size={20} /> Pedidos de Ajuda
              </Link>
              <Link to="/pastor-dashboard" className="mobile-link" onClick={()=>setMobileMenuOpen(false)} style={{display:'flex', alignItems:'center', gap:'12px', color:'white', fontSize:'1.1rem', textDecoration:'none', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                 <Shield size={20} /> Dashboard
              </Link>
            </div>
          )}
          
          <button className="mobile-link logout" onClick={logout} style={{display:'flex', alignItems:'center', gap:'12px', color:'#ff6b6b', fontSize:'1.1rem', background:'none', border:'none', textAlign:'left', width:'100%', padding:'12px 16px', marginTop:'10px'}}>
            <LogOut size={20} /> Sair
          </button>
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div className="modern-layout">

        {/* LEFT SIDEBAR (Desktop) */}
        <aside className="sidebar-left desktop-only">
          
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
            <p className="prof-role" style={{fontSize:'0.85rem',opacity:0.9,marginBottom:16}}>
              {t('common.welcomeBack', 'Bem-vindo de volta')}
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
            <p className="menu-title">{t('nav.spiritual_life', 'Vida Espiritual')}</p>
            <Link to="/pedidos-ajuda" className={isActive('/pedidos-ajuda')}>
              <Heart size={18} /> {t('nav.prayers', 'Pedidos de Oração')}
            </Link>
            <Link to="/consagracao" className={isActive('/consagracao')}>
              <PlayCircle size={18} /> {t('nav.consecration', 'Consagração & Jejum')}
            </Link>
            <Link to="/reflexao" className={isActive('/reflexao')}>
              <Sun size={18} /> {t('nav.reflection', 'Reflexão com Deus')}
            </Link>
            <Link to="/curso-biblico" className={isActive('/curso-biblico')}>
              <BookOpen size={18} /> {t('course.title', 'Bíblia & Estudo')}
            </Link>
            <Link to="/ajuda-uma-vida" className={isActive('/ajuda-uma-vida')}>
              <Heart size={18} /> Ajude o Próximo
            </Link>
            <Link to="/journeys" className={isActive('/journeys')}>
              <Globe size={18} /> {t('nav.journeys', 'Jornadas de Fé')}
            </Link>
            <Link to="/chat-pastoral" className={isActive('/chat-pastoral')}>
              <MessageCircle size={18} /> {t('nav.pastoral_chat', 'Fale com o Pastor')}
            </Link>
          </div>

          <div className="menu-group">
            <p className="menu-title">Menu</p>
            <Link to="/" className={isActive('/')}>
              <Home size={18} /> {t('nav.mural')}
            </Link>
            <Link to="/membros" className={isActive('/membros')}>
              <Users size={18} /> {t('nav.members')}
            </Link>
            <Link to="/grupos" className={isActive('/grupos')}>
              <Users size={18} /> {t('nav.groups', 'Grupos')}
            </Link>
            <Link to="/musica" className={isActive('/musica')}>
              <Music size={18} /> {t('nav.music', 'Música')}
            </Link>
          </div>

          {(user.role === 'pastor' || user.role === 'admin') && (
            <div className="menu-group">
              <p className="menu-title">Admin</p>
              <Link to="/pedidos-ajuda" className={isActive('/pedidos-ajuda')}>
                <Heart size={18} /> {t('nav.help_requests')}
              </Link>
              <Link to="/pastor-dashboard" className={isActive('/pastor-dashboard')}>
                 <Shield size={18} /> Dashboard
              </Link>
            </div>
          )}
          
          <button className="menu-link logout-btn" onClick={logout} style={{marginTop:20,color:'red'}}>
            <LogOut size={18} /> {t('auth.logout')}
          </button>
        </aside>

        {/* CENTER FEED (Main Content) */}
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
            
            {/* Protected Admin Routes */}
            <Route path="/pedidos-ajuda" element={
            } />
            <Route path="/pastor-dashboard" element={
            } />
          </Routes>
        </main>

        {/* RIGHT SIDEBAR (Desktop) */}
        <aside className="sidebar-right desktop-only">
          
          {/* Live Widget */}
          <div className="live-widget" style={{background:'linear-gradient(135deg,var(--fb2) 0%,#0D4FAA 60%,#0A3580 100%)',borderRadius:14,padding:18,marginBottom:14,color:'white',position:'relative',overflow:'hidden'}}>
            <div className="live-header" style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'#FF6B6B',marginBottom:8}}>
               <span className="live-dot" style={{width:7,height:7,borderRadius:'50%',background:'#FF4444'}}></span> DIRECTO
            </div>
            <p className="live-title" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1rem',fontWeight:600,marginBottom:4}}>{t('live.none', 'Nenhuma transmissão')}</p>
            <p className="live-sub" style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',marginBottom:14}}>{t('live.be_first', 'Seja o primeiro!')}</p>
            <button className="live-btn" style={{width:'100%',padding:10,borderRadius:10,background:'linear-gradient(135deg,#FF4444,#CC2222)',color:'white',fontSize:'0.78rem',fontWeight:600,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
               <PlayCircle size={16}/> {t('live.start', 'Iniciar Directo')}
            </button>
          </div>

          {/* Prayers Widget */}
          <div className="modern-card widget-card">
            <div className="widget-header" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'0.98rem',fontWeight:700,color:'var(--text)',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
              <Heart size={16} className="text-gold" style={{color:'var(--gold)'}}/> {t('nav.prayers', 'Pedidos de Oração')}
            </div>
            
            <div className="widget-item" style={{display:'flex',gap:9,padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
              <div className="w-avatar" style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,var(--fb),#3AAAD4)'}}>🙏</div>
              <div className="w-content">
                <p className="w-text" style={{fontSize:'0.78rem',color:'var(--text)',lineHeight:1.4}}><b style={{color:'var(--fb2)'}}>Ana Costa</b> pede saúde</p>
                <button className="w-btn" style={{marginTop:5,padding:'4px 11px',borderRadius:10,fontSize:'0.68rem',fontWeight:600,border:'1px solid rgba(201,168,76,0.3)',background:'rgba(201,168,76,0.07)',color:'var(--gold)',cursor:'pointer'}}>{t('mural.pray', 'Orar')}</button>
              </div>
            </div>
             <div className="widget-item" style={{display:'flex',gap:9,padding:'9px 0',borderBottom:'none'}}>
              <div className="w-avatar" style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,var(--gold),#8B6914)'}}>🕊️</div>
              <div className="w-content">
                <p className="w-text" style={{fontSize:'0.78rem',color:'var(--text)',lineHeight:1.4}}><b style={{color:'var(--fb2)'}}>Carlos</b> pede paz</p>
                <button className="w-btn" style={{marginTop:5,padding:'4px 11px',borderRadius:10,fontSize:'0.68rem',fontWeight:600,border:'1px solid rgba(201,168,76,0.3)',background:'rgba(201,168,76,0.07)',color:'var(--gold)',cursor:'pointer'}}>{t('mural.pray', 'Orar')}</button>
              </div>
            </div>
          </div>

          {/* Events Widget */}
          <div className="modern-card widget-card">
            <div className="widget-header" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'0.98rem',fontWeight:700,color:'var(--text)',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
              <Calendar size={16} className="text-gold" style={{color:'var(--gold)'}}/> {t('events.title', 'Próximos Eventos')}
            </div>
            <div className="widget-item" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0'}}>
               <div className="w-date" style={{width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,var(--fb2),var(--fb))',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white'}}>
                 <span className="d-day" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.05rem',fontWeight:700,color:'var(--gold2)',lineHeight:1}}>09</span>
                 <span className="d-mon" style={{fontSize:'0.52rem',color:'rgba(255,255,255,0.55)',textTransform:'uppercase'}}>MAR</span>
               </div>
               <div className="w-content">
                 <p className="w-title-sm" style={{fontSize:'0.8rem',fontWeight:600,color:'var(--text)'}}>Culto Dominical</p>
                 <p className="w-sub" style={{fontSize:'0.7rem',color:'var(--muted)'}}>10:00h · Online</p>
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
      
      {/* Global Chat Widget */}
    </div>
  );
}
