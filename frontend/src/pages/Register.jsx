import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, Mail, Lock, User, LogIn, Phone } from 'lucide-react';

export default function Register() {
  const { register, loginWithGoogle, loginWithFacebook, sendPhoneCode, verifyPhoneCode } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+55');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError(t('register.passwordError'));
    try {
      await register(form.email, form.password, form.full_name, form.role);
      navigate('/');
    } catch (err) {
      setError(err.message);
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

        <div className="auth-divider" style={{ margin: '0.75rem 0' }}>
          <span>{t('register.phone')}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {!codeSent ? (
            <>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ width: '90px', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--gray-300)', fontSize: '0.95rem' }}>
                  <option value="+352">🇱🇺 +352</option>
                  <option value="+55">🇧🇷 +55</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+351">🇵🇹 +351</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+39">🇮🇹 +39</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+31">🇳🇱 +31</option>
                  <option value="+32">🇧🇪 +32</option>
                </select>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder={t('login.phoneNumber')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--gray-300)', fontSize: '0.95rem' }} />
              </div>
              <button type="button" className="btn btn-primary" onClick={async () => {
                setError('');
                setPhoneLoading(true);
                try {
                  const result = await sendPhoneCode(`${countryCode}${phoneNumber}`, 'recaptcha-container-register');
                  setConfirmationResult(result);
                  setCodeSent(true);
                } catch (err) {
                  setError(err.message);
                } finally {
                  setPhoneLoading(false);
                }
              }} disabled={phoneLoading || !phoneNumber} style={{ width: '100%' }}>
                <Phone size={16} /> {phoneLoading ? '...' : t('login.sendCode')}
              </button>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--green)', textAlign: 'center', fontWeight: 600 }}>{t('login.codeSent')}</p>
              <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder={t('login.codePlaceholder')} maxLength={6} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--gray-300)', fontSize: '1.1rem', textAlign: 'center', letterSpacing: '0.3em' }} />
              <button type="button" className="btn btn-green" onClick={async () => {
                setError('');
                setPhoneLoading(true);
                try {
                  await verifyPhoneCode(confirmationResult, verificationCode);
                  navigate('/');
                } catch (err) {
                  setError(err.message);
                } finally {
                  setPhoneLoading(false);
                }
              }} disabled={phoneLoading || verificationCode.length < 6} style={{ width: '100%' }}>
                {phoneLoading ? '...' : t('login.verifyCode')}
              </button>
            </>
          )}
          <div id="recaptcha-container-register"></div>
        </div>

        <div className="auth-divider">
          <span>{t('register.or')}</span>
        </div>

        <form onSubmit={handleSubmit}>
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
