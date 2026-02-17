import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Church, MapPin, Phone, User, BookOpen, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function ChurchRegister() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', denomination: '', address: '', city: '', country: 'Brasil', phone: '', pastor_name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      {/* Explanatory card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.97), rgba(255,248,225,0.95))',
        border: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, #daa520, #4caf50) 1',
        borderRadius: 16,
        padding: '1.5rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(218,165,32,0.15)',
      }}>
        <Church size={48} style={{ color: '#daa520', marginBottom: '0.75rem' }} />
        <h2 style={{ color: '#1a0a3e', margin: '0 0 0.6rem', fontSize: '1.3rem' }}>{t('churchRegister.title')}</h2>
        <p style={{ fontSize: '0.9rem', color: '#444', lineHeight: 1.7, margin: '0 0 0.8rem' }}>
          Cadastre sua igreja e faça parte de uma rede de fé que conecta milhares de irmãos ao redor do mundo! 
          Ao registrar sua igreja, você poderá:
        </p>
        <div style={{ textAlign: 'left', fontSize: '0.88rem', color: '#555', lineHeight: 1.8, maxWidth: 400, margin: '0 auto 0.8rem' }}>
          ⛪ Aparecer no mapa de igrejas para visitantes<br />
          🙏 Conectar pastores com fiéis que precisam de oração<br />
          👥 Criar grupos e comunidades da sua igreja<br />
          📢 Divulgar eventos e cultos especiais<br />
          💛 Fortalecer o corpo de Cristo na sua região
        </div>
        <p style={{ fontSize: '0.85rem', color: '#6a1b9a', fontStyle: 'italic', margin: 0, fontWeight: 500 }}>
          "E perseveravam na doutrina dos apóstolos, e na comunhão, e no partir do pão, e nas orações." — Atos 2:42
        </p>
      </div>

      {/* Toggle button */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <button onClick={() => setShowForm(!showForm)} style={{
          width: 64, height: 64, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: showForm ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'linear-gradient(135deg, #daa520, #b8860b)',
          color: '#fff', boxShadow: '0 4px 15px rgba(218,165,32,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto',
          transition: 'all 0.3s ease',
        }}>
          {showForm ? <ChevronUp size={28} /> : <Church size={28} />}
        </button>
        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 8 }}>
          {showForm ? 'Fechar formulário' : 'Toque para cadastrar sua igreja'}
        </p>
      </div>

      {showForm && (
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--primary)', marginTop: '0.5rem' }}>{t('churchRegister.subtitle')}</h2>
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
      )}
    </div>
  );
}
