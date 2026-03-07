import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, Mail, Lock, User, LogIn, Phone, Camera, Eye, EyeOff } from 'lucide-react';

// Google Analytics conversion events
function trackSignUpEvent() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', { method: 'email' });
    window.gtag('event', 'login', { method: 'email' });
    console.log('✅ Google Analytics: sign_up & login events tracked');
  }
}

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'member' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleAvatarSelect(e) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (form.password.length < 6) {
      setLoading(false);
      return setError(t('register.passwordError'));
    }

    try {
      let avatarUrl = null;
      
      // Upload avatar ONLY if selected (now optional)
      if (avatar) {
        try {
          const fd = new FormData();
          fd.append('file', avatar);
          fd.append('upload_preset', 'sigo_com_fe');
          fd.append('folder', 'sigo-com-fe/avatars');
          const uploadRes = await fetch('https://api.cloudinary.com/v1_1/degxiuf43/image/upload', { method: 'POST', body: fd });
          const uploadData = await uploadRes.json();
          if (uploadData.secure_url) avatarUrl = uploadData.secure_url;
        } catch (uploadErr) { 
          console.error('Avatar upload error:', uploadErr);
          // Continue registration even if avatar fails
        }
      }

      await register(form.email, form.password, form.full_name, form.role, avatarUrl);
      trackSignUpEvent();
      navigate('/'); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="card auth-card">
        <div className="auth-brand">
          <BookOpen size={40} style={{ color: 'var(--gold)' }} />
          <h1>{t('brand')}</h1>
          <p>{t('register.joinCommunity')}</p>
        </div>
        
        {error && <p className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        <button className="btn btn-google" type="button" style={{ width: '100%', marginBottom: '1rem' }} onClick={async () => {
          setError('');
          try {
            const result = await loginWithGoogle();
            trackSignUpEvent();
            if (result) navigate('/');
          } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') setError(err.message);
          }
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t('register.google')}
        </button>

        <div className="auth-divider">
          <span>{t('register.or')}</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar (Optional) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label style={{ cursor: 'pointer', position: 'relative' }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: avatarPreview ? 'none' : 'var(--bg-secondary)',
                border: avatarPreview ? '3px solid var(--green)' : '2px dashed var(--gray-400)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={32} color="var(--gray-400)" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display: 'none' }} />
              
              {!avatarPreview && (
                <div style={{
                  position: 'absolute', bottom: -5, right: -5,
                  background: 'var(--gold)', borderRadius: '50%', width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                  <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>+</span>
                </div>
              )}
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 8 }}>
              {avatarPreview ? '✅ Foto selecionada' : 'Adicionar foto (opcional)'}
            </span>
          </div>

          <div className="form-group">
            <label><User size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('register.fullName')}</label>
            <input 
              value={form.full_name} 
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} 
              placeholder={t('register.fullNamePlaceholder')} 
              required 
            />
          </div>

          <div className="form-group">
            <label><Mail size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('register.email')}</label>
            <input 
              type="email" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              placeholder={t('register.emailPlaceholder')} 
              required 
            />
          </div>

          <div className="form-group">
            <label><Lock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('register.password')}</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                placeholder={t('register.passwordPlaceholder')} 
                required 
                style={{ paddingRight: '40px' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--gray-500)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? t('common.loading') : <><UserPlus size={18} /> {t('register.submit')}</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray-500)' }}>
          {t('register.hasAccount')} <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>{t('register.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}