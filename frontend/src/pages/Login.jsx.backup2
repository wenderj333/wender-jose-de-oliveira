import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { BookOpen, LogIn, Mail, Lock, Music, Users, MessageCircle, X } from 'lucide-react';

// Google Analytics conversion events
function trackLoginEvent() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', { method: 'email' });
    console.log('✅ Google Analytics: login event tracked');
  }
}

export default function Login() {
  const { user, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  React.useEffect(() => { if (user) navigate('/'); }, [user]);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
      const result = await loginWithGoogle();
      trackLoginEvent();
      if (result) {
        navigate('/');
      }
    } catch (err) {
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
      {/* ESQUERDA - Preview Comunidade ao Vivo */}
      <div style={{
        flex: '0 0 50%',
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
          left: '-10%',
          width: '60%',
          height: '60%',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }} />

        {/* Conteúdo */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 600 }}>
          {/* Comunidade ao Vivo Card */}
          <div
            onClick={() => navigate('/comunidade-ao-vivo')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '2.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 30px 80px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.2)';
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255,255,255,0.2)',
                padding: '12px 24px',
                borderRadius: '50px',
                marginBottom: '1.5rem',
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#ff4444',
                  boxShadow: '0 0 12px #ff4444',
                  animation: 'pulse 2s infinite',
                }} />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>AO VIVO AGORA</span>
              </div>
              
              <h2 style={{
                margin: '0 0 1rem',
                fontSize: '2.5rem',
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1.2,
              }}>
                🎵 Comunidade ao Vivo 24h
              </h2>
              <p style={{
                margin: 0,
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.6,
              }}>
                Louvor contínuo, oração e comunidade em tempo real
              </p>
            </div>

            {/* Features Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '1.5rem 1rem',
                textAlign: 'center',
              }}>
                <Music size={32} color="#fff" style={{ marginBottom: '0.75rem' }} />
                <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                  Louvor 24h
                </p>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '1.5rem 1rem',
                textAlign: 'center',
              }}>
                <MessageCircle size={32} color="#fff" style={{ marginBottom: '0.75rem' }} />
                <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                  Chat ao vivo
                </p>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '1.5rem 1rem',
                textAlign: 'center',
              }}>
                <Users size={32} color="#fff" style={{ marginBottom: '0.75rem' }} />
                <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                  Comunidade
                </p>
              </div>
            </div>

            {/* Preview Chat */}
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <MessageCircle size={20} color="#fff" />
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 700 }}>
                  Chat ao Vivo
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}>
                  <span style={{ fontWeight: 600 }}>Ana:</span> Amém! 🙏
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}>
                  <span style={{ fontWeight: 600 }}>Carlos:</span> Glória a Deus! ✨
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}>
                  <span style={{ fontWeight: 600 }}>Maria:</span> Aleluia! 🙌
                </div>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
            }}>
              <p style={{
                margin: 0,
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
              }}>
                ➡️ Clica aqui para entrar na transmissão
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>

      {/* DIREITA - Imagem + Botões */}
      <div style={{
        flex: '0 0 50%',
        background: '#fff',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
      }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          {/* Logo */}
          <div style={{ marginBottom: '2rem' }}>
            <BookOpen size={50} style={{ color: '#a07820', marginBottom: '1rem' }} />
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, color: '#1a1a2e' }}>
              {t('brand')}
            </h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '1.1rem' }}>
              A rede social cristã
            </p>
          </div>

          {/* Título */}
          <h2 style={{
            margin: '0 0 1rem',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#333',
            lineHeight: 1.3,
          }}>
            Talvez não seja por acaso que você chegou aqui.
          </h2>
          <p style={{
            margin: '0 0 2rem',
            fontSize: '1rem',
            color: '#666',
            lineHeight: 1.6,
          }}>
            Conecte-se com cristãos de verdade, ore, cresça na fé e encontre uma comunidade que edifica — não distrai.
          </p>

          {/* Imagem principal - Mulher com Bíblia */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '2rem',
          }}>
            <img
              src='/avatar2.jpg'
              alt="Mulher lendo a Bíblia"
              style={{
                width: '100%',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                marginBottom: '1.5rem',
              }}
            />
            
            {/* Mensagens */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              textAlign: 'left',
            }}>
              <p style={{
                margin: 0,
                padding: '0.75rem 1rem',
                background: '#fff',
                borderRadius: '12px',
                color: '#333',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}>
                Se você se sente sozinho, esse lugar é para você. Deus não esqueceu de você.
              </p>
              <p style={{
                margin: 0,
                padding: '0.75rem 1rem',
                background: '#fff',
                borderRadius: '12px',
                color: '#333',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}>
                Talvez não seja por acaso que você chegou aqui.
              </p>
              <p style={{
                margin: 0,
                padding: '0.75rem 1rem',
                background: '#fff',
                borderRadius: '12px',
                color: '#333',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
                '/avatar1.jpg',
                '/avatar3.jpg',
                '/avatar4.jpg',
                '/avatar5.jpg',
                '/avatar6.jpg',
                '/avatar7.jpg',
                '/avatar8.jpg',
              ].map((url, i) => (
                <div
                  key={i}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '3px solid #fff',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <LogIn size={22} /> Entrar
            </button>

            <Link
              to="/cadastro"
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ✨ Criar conta grátis
            </Link>

            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'transparent',
                border: '2px dashed #667eea',
                borderRadius: '12px',
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
          </div>
        </div>
      </div>

      {/* Modal de Login */}
      {showLoginModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={(e) => e.target === e.currentTarget && setShowLoginModal(false)}
        >
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '2.5rem',
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
              onMouseOut={(e) => e.currentTarget.style.background = 'none'}
            >
              <X size={24} color="#666" />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <BookOpen size={40} style={{ color: '#a07820', marginBottom: '0.75rem' }} />
              <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e' }}>
                Bem-vindo de volta!
              </h2>
              <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.95rem' }}>
                Entre na sua conta
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
                fontSize: '0.85rem',
              }}>
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#333',
                }}>
                  <Mail size={16} /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem',
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
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#333',
                }}>
                  <Lock size={16} /> Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
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
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                <LogIn size={20} /> Entrar
              </button>

              <div style={{ textAlign: 'center' }}>
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
                    Esqueci a senha
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
              <span style={{ color: '#999', fontSize: '0.85rem', fontWeight: 600 }}>OU</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#fff',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
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
                marginBottom: '1rem',
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
              {loading ? 'Carregando...' : 'Entrar com Google'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'transparent',
                border: '2px dashed #667eea',
                borderRadius: '12px',
                color: '#667eea',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              👁️ Visitar como convidado
            </button>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666', fontSize: '0.85rem' }}>
              Não tem conta?{' '}
              <Link
                to="/cadastro"
                onClick={() => setShowLoginModal(false)}
                style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}
              >
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* RESPONSIVO - Mobile */}
      <style>{`
        @media (max-width: 768px) {
          body > div > div:first-child {
            display: none !important;
          }
          body > div > div:last-child {
            flex: 0 0 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
