import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Church, MapPin, Phone, User, BookOpen, CheckCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function ChurchRegister() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', denomination: '', address: '', city: '', country: 'Brasil', phone: '', pastor_name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError(t('churchRegister.nameRequired'));
    if (!user || !token) { setError(t('churchRegister.loginRequired')); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/churches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('churchRegister.error'));
      setSuccess(true);
      setTimeout(() => navigate('/igrejas'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="form-page" style={{ maxWidth: '540px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <CheckCircle size={64} style={{ color: 'var(--green)', marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--green-dark)' }}>{t('churchRegister.success')}</h2>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>{t('churchRegister.redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page" style={{ maxWidth: '540px' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Church size={40} style={{ color: 'var(--gold)' }} />
          <h2 style={{ color: 'var(--primary)', marginTop: '0.5rem' }}>{t('churchRegister.title')}</h2>
          <p style={{ color: 'var(--gray-500)' }}>{t('churchRegister.subtitle')}</p>
        </div>

        {error && <p className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('churchRegister.churchName')}</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder={t('churchRegister.churchNamePlaceholder')} required />
          </div>
          <div className="form-group">
            <label><Church size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('churchRegister.denomination')}</label>
            <input name="denomination" value={form.denomination} onChange={handleChange} placeholder={t('churchRegister.denominationPlaceholder')} />
          </div>
          <div className="form-group">
            <label><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('churchRegister.address')}</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder={t('churchRegister.addressPlaceholder')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>{t('churchRegister.city')}</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder={t('churchRegister.cityPlaceholder')} />
            </div>
            <div className="form-group">
              <label>{t('churchRegister.country')}</label>
              <input name="country" value={form.country} onChange={handleChange} placeholder={t('churchRegister.countryPlaceholder')} />
            </div>
          </div>
          <div className="form-group">
            <label><Phone size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('churchRegister.phone')}</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder={t('churchRegister.phonePlaceholder')} />
          </div>
          <div className="form-group">
            <label><User size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('churchRegister.pastorName')}</label>
            <input name="pastor_name" value={form.pastor_name} onChange={handleChange} placeholder={t('churchRegister.pastorNamePlaceholder')} />
          </div>
          <button type="submit" className="btn btn-green btn-lg" style={{ width: '100%' }} disabled={loading}>
            <Church size={18} /> {loading ? t('churchRegister.submitting') : t('churchRegister.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
