import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, Mail, Lock, User, LogIn, Phone, Camera } from 'lucide-react';

export default function Register() {
  const { register, loginWithGoogle, loginWithFacebook, sendPhoneCode, verifyPhoneCode } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'member' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Photos (minimum 1, unlimited)
  const [photos, setPhotos] = useState([null, null, null]);
  const [photoPreviews, setPhotoPreviews] = useState([null, null, null]);
  const [step, setStep] = useState(1); // 1 = register form, 2 = upload 3 photos
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [registeredToken, setRegisteredToken] = useState(null);

  function handleAvatarSelect(e) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+55');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!avatar) return setError('📷 Foto de perfil é obrigatória! Toque no ícone da câmera acima para adicionar.');
    if (form.password.length < 6) return setError(t('register.passwordError'));
    try {
      // Upload avatar ao Cloudinary se selecionado
      let avatarUrl = null;
      if (avatar) {
        try {
          const fd = new FormData();
          fd.append('file', avatar);
          fd.append('upload_preset', 'sigo_com_fe');
          fd.append('folder', 'sigo-com-fe/avatars');
          const uploadRes = await fetch('https://api.cloudinary.com/v1_1/degxiuf43/image/upload', { method: 'POST', body: fd });
          const uploadData = await uploadRes.json();
          if (uploadData.secure_url) avatarUrl = uploadData.secure_url;
        } catch (uploadErr) { console.error('Avatar upload error:', uploadErr); }
      }
      const result = await register(form.email, form.password, form.full_name, form.role, avatarUrl);
      // Go to step 2: upload 3 photos
      setRegisteredToken(localStorage.getItem('token'));
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  function handlePhotoSelect(index, e) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const newPhotos = [...photos];
    newPhotos[index] = file;
    // Add more slots if all filled
    if (newPhotos.every(p => p !== null)) {
      newPhotos.push(null);
      const np = [...photoPreviews];
      np.push(null);
      setPhotoPreviews(np);
    }
    setPhotos(newPhotos);
    const reader = new FileReader();
    reader.onload = () => {
      const newPreviews = [...photoPreviews];
      newPreviews[index] = reader.result;
      if (newPhotos.every(p => p !== null) && newPreviews.length < newPhotos.length) newPreviews.push(null);
      setPhotoPreviews(newPreviews);
    };
    reader.readAsDataURL(file);
  }

  async function handleUploadPhotos() {
    const validPhotos = photos.filter(p => p !== null);
    if (validPhotos.length < 1) {
      setError('Suba pelo menos 1 foto para continuar!');
      return;
    }
    setUploadingPhotos(true);
    setError('');
    const tkn = registeredToken || localStorage.getItem('token');
    try {
      for (const photo of validPhotos) {
        // Upload to Cloudinary
        const fd = new FormData();
        fd.append('file', photo);
        fd.append('upload_preset', 'sigo_com_fe');
        fd.append('folder', 'sigo-com-fe/posts');
        const uploadRes = await fetch('https://api.cloudinary.com/v1_1/degxiuf43/image/upload', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) {
          // Create feed post with photo
          const postFd = new FormData();
          postFd.append('content', '📸');
          postFd.append('category', 'foto');
          postFd.append('media_url', uploadData.secure_url);
          postFd.append('media_type', 'image');
          await fetch((import.meta.env.VITE_API_URL || '') + '/api/feed', {
            method: 'POST',
            headers: { Authorization: `Bearer ${tkn}` },
            body: postFd,
          });
        }
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Erro ao subir fotos. Tente novamente.');
    } finally {
      setUploadingPhotos(false);
    }
  }

  // Step 2: Upload 3 photos
  if (step === 2) {
    const photosCount = photos.filter(p => p !== null).length;
    return (
      <div className="form-page">
        <div className="card auth-card">
          <div className="auth-brand">
            <Camera size={40} style={{ color: 'var(--gold)' }} />
            <h1>📸 Suba suas fotos!</h1>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Suba pelo menos <strong>1 foto</strong> para completar seu perfil. Pode adicionar até 3!
            </p>
          </div>
          {error && <p className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
            {photos.map((_, i) => (
              <label key={i} style={{ cursor: 'pointer' }}>
                <div style={{
                  aspectRatio: '1', borderRadius: 14, overflow: 'hidden',
                  border: photoPreviews[i] ? '2px solid #4caf50' : '2px dashed #daa520',
                  background: photoPreviews[i] ? '#000' : '#f9f5e8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', position: 'relative',
                }}>
                  {photoPreviews[i] ? (
                    <>
                      <img src={photoPreviews[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 6, right: 6, background: '#4caf50', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera size={28} color="#daa520" />
                      <span style={{ fontSize: '0.7rem', color: '#daa520', marginTop: 4, fontWeight: 600 }}>Foto {i + 1}</span>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={(e) => handlePhotoSelect(i, e)} style={{ display: 'none' }} />
              </label>
            ))}
          </div>

          {/* Progress */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              {photos.map((_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: photos[i] ? '#4caf50' : '#ddd',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <span style={{ fontSize: '0.85rem', color: photosCount >= 3 ? '#4caf50' : '#999', fontWeight: 600 }}>
              {photosCount}/3 fotos
            </span>
          </div>

          <button
            onClick={handleUploadPhotos}
            disabled={photosCount < 1 || uploadingPhotos}
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              opacity: photosCount < 1 ? 0.5 : 1,
              background: photosCount >= 1 ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#ccc',
            }}
          >
            {uploadingPhotos ? '📤 Subindo fotos...' : photosCount >= 1 ? '🚀 Entrar no Sigo com Fé!' : 'Suba pelo menos 1 foto'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="card auth-card">
        <div className="auth-brand">
          <BookOpen size={40} style={{ color: 'var(--gold)' }} />
          <h1>{t('brand')}</h1>
          <p>{t('register.joinCommunity')}</p>
        </div>
        {error && <p className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        <button className="btn btn-google" type="button" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={async () => {
          setError('');
          try {
            const result = await loginWithGoogle();
            // Only navigate if popup was used (returns data). Redirect navigates automatically.
            if (result) navigate('/');
          } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') setError(err.message);
          }
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t('register.google')}
        </button>

        {/* Facebook login - desativado até configurar app no Meta
        <button className="btn" type="button" style={{ width: '100%', marginBottom: '0.5rem', background: '#1877F2', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }} onClick={async () => {
          setError('');
          try {
            const result = await loginWithFacebook();
            if (result) navigate('/');
          } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') setError(err.message);
          }
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          {t('register.facebook')}
        </button>
        */}

        <div className="auth-divider">
          <span>{t('register.or')}</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ cursor: 'pointer', position: 'relative' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: avatarPreview ? 'none' : 'linear-gradient(135deg, #fff8e1, #fff3e0)',
                border: avatarPreview ? '3px solid #4caf50' : '3px dashed #daa520',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: avatarPreview ? '0 4px 15px rgba(76,175,80,0.3)' : '0 4px 15px rgba(218,165,32,0.3)',
                animation: !avatarPreview ? 'pulse 2s infinite' : 'none',
              }}>
                {avatarPreview ? (
                  <>
                    <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      background: '#4caf50', borderRadius: '50%', width: 28, height: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #fff',
                    }}>
                      <span style={{ color: '#fff', fontSize: '0.85rem' }}>✓</span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <Camera size={36} color="#daa520" />
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display: 'none' }} />
            </label>
            <div style={{
              textAlign: 'center', fontSize: '0.85rem', marginTop: 6, fontWeight: 700,
              color: avatarPreview ? '#4caf50' : '#daa520',
            }}>
              {avatarPreview ? '✅ Foto adicionada!' : '📷 Toque aqui para adicionar sua foto *'}
            </div>
            {!avatarPreview && (
              <div style={{ fontSize: '0.72rem', color: '#e74c3c', marginTop: 2, fontWeight: 600 }}>
                ⚠️ Obrigatório — sua foto aparece para outros membros
              </div>
            )}
          </div>

          <div className="form-group">
            <label><User size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('register.fullName')}</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder={t('register.fullNamePlaceholder')} required />
          </div>
          <div className="form-group">
            <label><Mail size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('register.email')}</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t('register.emailPlaceholder')} required />
          </div>
          <div className="form-group">
            <label><Lock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('register.password')}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t('register.passwordPlaceholder')} required />
          </div>
          <div className="form-group">
            <label>{t('register.iAm')}</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="member">{t('register.member')}</option>
              <option value="pastor">{t('register.pastor')}</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            <UserPlus size={18} /> {t('register.submit')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray-500)' }}>
          {t('register.hasAccount')} <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>{t('register.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
