import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Church, MapPin, Phone, User, BookOpen, CheckCircle, ChevronDown, ChevronUp, Users, DollarSign, MessageCircle, Calendar, BarChart3, Megaphone, HandHeart, ShieldCheck, Flame } from 'lucide-react';

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
  const [showFeatures, setShowFeatures] = useState(false);

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

  const features = [
    { icon: <Users size={22} color="#667eea" />, titleKey: 'churchRegister.featMembers', descKey: 'churchRegister.featMembersDesc' },
    { icon: <DollarSign size={22} color="#daa520" />, titleKey: 'churchRegister.featTithes', descKey: 'churchRegister.featTithesDesc' },
    { icon: <HandHeart size={22} color="#4caf50" />, titleKey: 'churchRegister.featPrayers', descKey: 'churchRegister.featPrayersDesc' },
    { icon: <MessageCircle size={22} color="#8e44ad" />, titleKey: 'churchRegister.featChat', descKey: 'churchRegister.featChatDesc' },
    { icon: <Megaphone size={22} color="#e74c3c" />, titleKey: 'churchRegister.featAnnounce', descKey: 'churchRegister.featAnnounceDesc' },
    { icon: <Calendar size={22} color="#00bcd4" />, titleKey: 'churchRegister.featAgenda', descKey: 'churchRegister.featAgendaDesc' },
    { icon: <BookOpen size={22} color="#1a0a3e" />, titleKey: 'churchRegister.featStudies', descKey: 'churchRegister.featStudiesDesc' },
    { icon: <BarChart3 size={22} color="#ff9800" />, titleKey: 'churchRegister.featReports', descKey: 'churchRegister.featReportsDesc' },
    { icon: <Flame size={22} color="#ff6600" />, titleKey: 'churchRegister.featConsecration', descKey: 'churchRegister.featConsecrationDesc' },
  ];

  return (
    <div className="form-page" style={{ maxWidth: '560px' }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a3e 0%, #2d1b69 50%, #4a1a8e 100%)',
        borderRadius: 20, padding: '2rem 1.5rem', color: '#fff', marginBottom: '1.5rem',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(218,165,32,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(102,126,234,0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Church size={48} color="#daa520" style={{ marginBottom: '0.75rem' }} />
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 800 }}>
            {t('churchRegister.heroTitle', 'Cadastre Sua Igreja')}
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.85, lineHeight: 1.6 }}>
            {t('churchRegister.heroSubtitle', 'Conecte sua comunidade a uma rede global de fé')}
          </p>
        </div>
      </div>

      {/* Versículo principal */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(218,165,32,0.08), rgba(102,126,234,0.08))',
        borderRadius: 16, padding: '1rem 1.2rem', marginBottom: '1.5rem', textAlign: 'center',
        border: '1px solid rgba(218,165,32,0.2)',
      }}>
        <p style={{ fontSize: '0.85rem', color: '#555', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
          {t('churchRegister.mainVerse', '"E perseveravam na doutrina dos apóstolos, e na comunhão..." — Atos 2:42-44')}
        </p>
      </div>

      {/* Benefícios resumidos */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem',
        border: '1px solid #eee', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <h3 style={{ color: '#1a0a3e', margin: '0 0 1rem', fontSize: '1.05rem', textAlign: 'center' }}>
          🌟 {t('churchRegister.whyRegister', 'Por que cadastrar sua Igreja?')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>🌍</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a0a3e' }}>{t('churchRegister.benefit1Title', 'Visibilidade Global')}</div>
              <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>
                {t('churchRegister.benefit1Desc', 'Sua igreja aparece para milhares de cristãos ao redor do mundo.')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>🏛️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a0a3e' }}>{t('churchRegister.benefit2Title', 'Sala de Gestão Exclusiva')}</div>
              <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>
                {t('churchRegister.benefit2Desc', 'Acesso exclusivo a ferramentas profissionais para gerenciar sua igreja.')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>💜</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a0a3e' }}>{t('churchRegister.benefit3Title', 'Comece Agora, Sem Custo')}</div>
              <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>
                {t('churchRegister.benefit3Desc', 'Cadastre sua igreja e use as ferramentas essenciais sem custo.')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ferramentas disponíveis - expansível */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => setShowFeatures(!showFeatures)} style={{
          width: '100%', padding: '0.8rem 1rem', borderRadius: 14, border: '2px solid #daa520',
          background: showFeatures ? 'linear-gradient(135deg, #daa520, #b8860b)' : '#fff',
          color: showFeatures ? '#fff' : '#daa520',
          fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.3s',
        }}>
          <ShieldCheck size={18} />
          {showFeatures ? t('churchRegister.closeFeatures', 'Fechar ferramentas') : t('churchRegister.viewFeatures', '🔧 Ver todas as ferramentas')}
          {showFeatures ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showFeatures && (
          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '0.75rem 1rem',
                background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: '#f8f9fa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', marginBottom: 2 }}>{t(f.titleKey)}</div>
                  <div style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.5 }}>{t(f.descKey)}</div>
                </div>
              </div>
            ))}

            <div style={{
              background: 'linear-gradient(135deg, #1a0a3e, #4a1a8e)', borderRadius: 14,
              padding: '1rem', color: '#fff', textAlign: 'center', marginTop: 4,
            }}>
              <p style={{ fontStyle: 'italic', fontSize: '0.85rem', margin: '0 0 6px' }}>
                {t('churchRegister.pastorVerse', '"Apascentai o rebanho de Deus..." — 1 Pedro 5:2')}
              </p>
              <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0 }}>
                {t('churchRegister.availableInRoom', '🔑 Disponível na Sala de Gestão do Pastor')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTA Button para abrir formulário */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '1rem 2.5rem', borderRadius: 30, border: 'none',
          background: showForm ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #daa520, #b8860b)',
          color: '#fff', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 10,
          boxShadow: showForm ? '0 4px 20px rgba(231,76,60,0.3)' : '0 4px 20px rgba(218,165,32,0.4)',
          transition: 'all 0.3s',
        }}>
          {showForm ? (
            <><ChevronUp size={22} /> {t('churchRegister.closeForm', 'Fechar Formulário')}</>
          ) : (
            <><Church size={22} /> {t('churchRegister.registerNowBtn', 'Cadastrar Minha Igreja Agora')}</>
          )}
        </button>
        {!showForm && (
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: 8 }}>
            {t('churchRegister.quickInfo', '⚡ Rápido e fácil — leva menos de 2 minutos')}
          </p>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card" style={{ border: '2px solid rgba(218,165,32,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--primary)', margin: 0 }}>{t('churchRegister.fillData', 'Preencha os dados')}</h2>
            <p style={{ color: '#888', fontSize: '0.8rem', margin: '0.3rem 0 0' }}>{t('churchRegister.requiredFields', '* Campos obrigatórios')}</p>
          </div>

          {error && <p className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('churchRegister.churchName')} *</label>
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
            <button type="submit" className="btn btn-green btn-lg" style={{ width: '100%', fontSize: '1.05rem', padding: '0.9rem' }} disabled={loading}>
              <Church size={20} /> {loading ? t('churchRegister.submitting') : `✅ ${t('churchRegister.submitBtn', 'Cadastrar Minha Igreja')}`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
