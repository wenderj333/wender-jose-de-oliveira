import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');

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

        <div className="auth-divider">
          <span>{t('register.or')}</span>
        </div>

        <button className="btn btn-google" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t('register.google')}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray-500)' }}>
          {t('register.hasAccount')} <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>{t('register.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
