import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { BookOpen, HandHeart, Radio, MapPin, LayoutDashboard, Menu, X, Church, Baby, Newspaper } from 'lucide-react';
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

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'nav-link--active' : '';

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar__top">
          <Link to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
            <BookOpen size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Sigo com Fé
          </Link>
          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
          <Link to="/oracoes" className={isActive('/oracoes')} onClick={() => setMenuOpen(false)}><HandHeart size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Orações</Link>
          <Link to="/mural" className={isActive('/mural')} onClick={() => setMenuOpen(false)}><Newspaper size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Mural</Link>
          <Link to="/ao-vivo" className={isActive('/ao-vivo')} onClick={() => setMenuOpen(false)}><Radio size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Ao Vivo</Link>
          <Link to="/igrejas" className={isActive('/igrejas')} onClick={() => setMenuOpen(false)}><MapPin size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Igrejas</Link>
          <Link to="/cadastrar-igreja" className={isActive('/cadastrar-igreja')} onClick={() => setMenuOpen(false)}><Church size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Cadastrar Igreja</Link>
          <Link to="/kids" className={isActive('/kids')} onClick={() => setMenuOpen(false)}><Baby size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Kids</Link>
          {user && (
            <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}><LayoutDashboard size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Dashboard</Link>
          )}
          {user ? (
            <>
              <span className="nav-user">Olá, {user.full_name?.split(' ')[0]}</span>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="btn btn-outline btn-sm">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Entrar</Link>
              <Link to="/cadastro" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Cadastrar</Link>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/oracoes" element={<PrayerFeed />} />
          <Route path="/mural" element={<Mural />} />
          <Route path="/ao-vivo" element={<LivePrayer />} />
          <Route path="/igrejas" element={<ChurchMap />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/kids" element={<Kids />} />
          <Route path="/cadastrar-igreja" element={<ProtectedRoute><ChurchRegister /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Sigo com Fé — Tecnologia a serviço do Reino <BookOpen size={16} style={{ verticalAlign: 'middle' }} /></p>
      </footer>
    </div>
  );
}
