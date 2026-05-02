import { useState, useEffect, useRef } from "react";
import "./sidebar.css";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/AuthContext";
import { useWebSocket } from "./context/WebSocketContext";
import {
  Home, User, MessageCircle, Heart, Globe, LogOut,
  Menu, X, Bell, Music, BookOpen, Users,
  Calendar, Shield, PlayCircle, Sun, Mail, Trophy
} from "lucide-react";

// Pages
import MuralGrid from "./pages/MuralGrid";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
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
import DesafioBiblico from "./pages/DesafioBiblico";
import Ranking from './pages/Ranking';
import AjudaUmaVida from "./pages/AjudaUmaVida";
import Chat from "./pages/Chat";
import Churches from "./pages/Churches";
import ChurchProfile from "./pages/ChurchProfile";
import PastorDashboard from "./pages/PastorDashboard";
import Offerings from "./pages/Offerings";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  if (loading) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f7ff',flexDirection:'column',gap:20}}>
      <div style={{width:50,height:50,border:'4px solid #e0e6f5',borderTopColor:'#4a80d4',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.2rem',fontWeight:600,color:'#3568b8'}}>Sigo com Fé...</p>
    </div>
  );

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <header className="topbar">
        <Link to="/" style={{display:'flex',alignItems:'center',gap:'9px',textDecoration:'none'}}>
          <img src='/logo-new.png' alt='Sigo com Fe' style={{height:38,width:38,objectFit:'cover',borderRadius:10}} />
        </Link>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          <Link to={/perfil/ + user.id} style={{color: 'white'}}><User size={20}/></Link>
          <button onClick={logout} style={{color: 'white', background: 'none', border: 'none'}}><LogOut size={20}/></button>
        </div>
      </header>

      <main className="main-content-area">
        <Routes>
          <Route path="/" element={<MuralGrid />} />
          <Route path="/membros" element={<Members />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/perfil/:id" element={<Profile />} />
          <Route path="/ia-biblica" element={<BiblicalAI />} />
          <Route path="/desafio-biblico" element={<DesafioBiblico />} />
          <Route path="/mensagens" element={<Chat />} />
          <Route path="*" element={<MuralGrid />} />
        </Routes>
      </main>
      <GlobalChat />
    </div>
  );
}
