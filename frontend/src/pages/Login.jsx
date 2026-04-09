import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { BookOpen, LogIn, Mail, Lock, Music, Users, MessageCircle } from 'lucide-react';

// Google Analytics conversion events
function trackLoginEvent() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', { method: 'email' });
    console.log('✅ Google Analytics: login event tracked');
  }
}

export default function Login() {
  const { user, login, loginWithGoogle, enableGuestMode } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  React.useEffect(() => { if (user) navigate('/'); }, [user]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      trackLoginEvent();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      console.log('🔵 Iniciando Google login...');
      const result = await loginWithGoogle();
      console.log('✅ Google login resultado:', result);
      trackLoginEvent();
      if (result) {
        console.log('✅ Navegando para home...');
        navigate('/');
      }
    } catch (err) {
      console.error('❌ Erro no Google login:', err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'Erro ao fazer login com Google');
      }
    } finally {
      setLoading(false);
    }
  };

  async function handleForgotPassword() {
    if (!email) { setError('Insira o email primeiro'); return; }
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch(e) { setError('Email não encontrado'); }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      {/* ESQUERDA - Formulário Login */}
      <div style={{
        flex: '0 0 45%',
        background: '#fff',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      }}>
        <div style={{ maxWidth: 420, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <BookOpen size={50} style={{ color: '#a07820', marginBottom: '1rem' }} />
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#1a1a2e' }}>
              {t('brand')}
            </h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '1rem' }}>
              {t('login.welcomeBack')}
            </p>
          </div>

          {error && (
            <p style={{
              textAlign: 'center',
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'rgba(225,29,72,0.1)',
              color: '#e11d48',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>
                <Mail size={16} /> {t('login.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>
                <Lock size={16} /> {t('login.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    paddingRight: '3rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 20,
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <LogIn size={20} /> {t('login.submit')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              {resetSent ? (
                <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✅ Email enviado! Verifica a caixa de entrada.
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Esqueci a password
                </button>
              )}
            </div>
          </form>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            margin: '1.5rem 0',
          }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ color: '#999', fontSize: '0.85rem', fontWeight: 600 }}>
              {t('login.or')}
            </span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: '#fff',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: '#333',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseOver={(e) => { if (!loading) { e.currentTarget.style.borderColor = '#4285F4'; e.currentTarget.style.background = '#f8f9ff'; } }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Carregando...' : t('login.google')}
          </button>

          <button
            type="button"
            onClick={() => {
              enableGuestMode();
              navigate('/');
            }}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.875rem',
              background: 'transparent',
              border: '2px dashed #667eea',
              borderRadius: '10px',
              color: '#667eea',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(102,126,234,0.08)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            👁️ Visitar como convidado
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
            {t('login.noAccount')}{' '}
            <Link
              to="/cadastro"
              style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}
            >
              {t('login.signUp')}
            </Link>
          </p>
        </div>
      </div>

      {/* DIREITA - Imagem + Preview Comunidade ao Vivo */}
      <div style={{
        flex: '0 0 55%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decorativo */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '60%',
          height: '60%',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '50%',
          height: '50%',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        }} />

        {/* Conteúdo */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%', maxWidth: 550 }}>
          <h2 style={{
            margin: '0 0 1rem',
            fontSize: '2.5rem',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2,
          }}>
            A rede social cristã
          </h2>
          <p style={{
            margin: '0 0 2rem',
            fontSize: '1.15rem',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.6,
          }}>
            Talvez não seja por acaso que você chegou aqui.
          </p>

          {/* Imagem principal - Mulher com Bíblia */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <img
              src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=500&h=600&fit=crop"
              alt="Mulher lendo a Bíblia"
              style={{
                width: '100%',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              }}
            />
            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              textAlign: 'left',
            }}>
              <p style={{
                margin: 0,
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '12px',
                color: '#333',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}>
                Se você se sente sozinho, esse lugar é para você. Deus não esqueceu de você.
              </p>
              <p style={{
                margin: 0,
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '12px',
                color: '#333',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}>
                Talvez não seja por acaso que você chegou aqui.
              </p>
              <p style={{
                margin: 0,
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '12px',
                color: '#333',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}>
                Aqui sua fé cresce todos os dias.
              </p>
            </div>

            {/* Avatares de membros */}
            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
            }}>
              {[
                'https://i.pravatar.cc/150?img=1',
                'https://i.pravatar.cc/150?img=5',
                'https://i.pravatar.cc/150?img=9',
                'https://i.pravatar.cc/150?img=12',
                'https://i.pravatar.cc/150?img=20',
                'https://i.pravatar.cc/150?img=25',
                'https://i.pravatar.cc/150?img=32',
              ].map((url, i) => (
                <div
                  key={i}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '3px solid #fff',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Preview Comunidade ao Vivo */}
          <div
            onClick={() => navigate('/comunidade-ao-vivo')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '2px solid rgba(255,255,255,0.2)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}>
              <Music size={28} color="#fff" />
              <h3 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#fff',
              }}>
                🔴 Comunidade ao Vivo 24h
              </h3>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              marginTop: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'rgba(255,255,255,0.95)',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}>
                <Music size={18} />
                <span>Louvor 24h</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'rgba(255,255,255,0.95)',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}>
                <MessageCircle size={18} />
                <span>Chat ao vivo</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'rgba(255,255,255,0.95)',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}>
                <Users size={18} />
                <span>Comunidade</span>
              </div>
            </div>
            <p style={{
              margin: '1rem 0 0',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.9rem',
            }}>
              ➡️ Clica aqui para entrar na transmissão
            </p>
          </div>
        </div>
      </div>

      {/* RESPONSIVO - Mobile */}
      <style>{`
        @media (max-width: 768px) {
          .form-page > div:first-child {
            flex: 0 0 100% !important;
          }
          .form-page > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
