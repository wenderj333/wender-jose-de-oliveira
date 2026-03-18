import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  {
    key: 'spiritual',
    emoji: '🙏',
    titleKey: 'ajudaProximo.category.spiritual.title',
    verseKey: 'ajudaProximo.category.spiritual.verse',
    types: ['Pedido de oração urgente', 'Acompanhamento espiritual', 'Visita pastoral', 'Discipulado e mentoria'],
    audienceKey: 'ajudaProximo.category.spiritual.targetAudience',
    color: '#6c47d4',
  },
  {
    key: 'diaconia',
    emoji: '🍞',
    titleKey: 'ajudaProximo.category.diaconia.title',
    verseKey: 'ajudaProximo.category.diaconia.verse',
    types: ['Cesta básica e alimentos', 'Roupas e calçados', 'Medicamentos', 'Ajuda financeira emergencial'],
    audienceKey: 'ajudaProximo.category.diaconia.targetAudience',
    color: '#c9a84c',
  },
  {
    key: 'employment',
    emoji: '💼',
    titleKey: 'ajudaProximo.category.employment.title',
    verseKey: 'ajudaProximo.category.employment.verse',
    types: ['Vagas de trabalho entre irmãos', 'Cursos e capacitação', 'Microempreendedorismo'],
    audienceKey: 'ajudaProximo.category.employment.targetAudience',
    color: '#1e8a5a',
  },
  {
    key: 'emotional',
    emoji: '❤️',
    titleKey: 'ajudaProximo.category.emotional.title',
    verseKey: 'ajudaProximo.category.emotional.verse',
    types: ['Luto e perda', 'Restauração de casamento', 'Apoio a mães solo', 'Dependência química'],
    audienceKey: 'ajudaProximo.category.emotional.targetAudience',
    color: '#d44747',
  },
  {
    key: 'health',
    emoji: '🏥',
    titleKey: 'ajudaProximo.category.health.title',
    verseKey: 'ajudaProximo.category.health.verse',
    types: ['Transporte para tratamento médico', 'Acompanhante hospitalar', 'Doação de sangue'],
    audienceKey: 'ajudaProximo.category.health.targetAudience',
    color: '#1e6ab5',
  },
];

export default function AjudaUmaVida() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [modal, setModal] = useState(null); // { category, mode: 'request'|'offer' }
  const [message, setMessage] = useState('');

  const openModal = (category, mode) => {
    setModal({ category, mode });
    setMessage('');
  };

  const closeModal = () => setModal(null);

  const handleSubmit = () => {
    if (!message.trim()) return;
    const label = modal.mode === 'request'
      ? t('ajudaProximo.requestRegistered')
      : t('ajudaProximo.offerRegistered');
    alert(`${label} ${t(modal.category.titleKey)}`);
    closeModal();
  };

  return (
    <div style={{padding:'20px 0'}}>
      {/* Header */}
      <div style={{textAlign:'center',marginBottom:30,padding:'0 16px'}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2rem',fontWeight:700,color:'var(--text)',marginBottom:8}}>
          {t('ajudaProximo.title')}
        </h1>
        <p style={{color:'var(--muted)',fontSize:'1rem',maxWidth:480,margin:'0 auto'}}>
          {t('ajudaProximo.subtitle')}
        </p>
        <p style={{marginTop:12,fontStyle:'italic',color:'var(--gold)',fontSize:'0.9rem'}}>
          "Servi-vos uns aos outros, cada um conforme o dom que recebeu." — 1 Pedro 4:10
        </p>
      </div>

      {/* Categories */}
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {CATEGORIES.map(cat => (
          <div key={cat.key} style={{background:'var(--card)',borderRadius:14,border:'1px solid var(--border)',overflow:'hidden',boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}>
            {/* Category header */}
            <div style={{padding:'16px 18px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:'1.8rem'}}>{cat.emoji}</span>
              <div style={{flex:1}}>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.15rem',fontWeight:700,color:'var(--text)',marginBottom:2}}>
                  {t(cat.titleKey)}
                </h3>
                <p style={{fontSize:'0.75rem',color:'var(--muted)',fontStyle:'italic'}}>
                  {t(cat.verseKey)}
                </p>
              </div>
            </div>

            {/* Type tags */}
            <div style={{padding:'12px 18px',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                {cat.types.map(type => (
                  <span key={type} style={{background:`${cat.color}20`,border:`1px solid ${cat.color}40`,borderRadius:20,padding:'4px 11px',fontSize:'0.75rem',color:'var(--text)'}}>
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Audience + Buttons */}
            <div style={{padding:'12px 18px',display:'flex',alignItems:'center',flexWrap:'wrap',gap:10}}>
              <p style={{flex:1,fontSize:'0.75rem',color:'var(--muted)'}}>
                <span style={{fontWeight:600,color:'var(--gold)'}}>
                  {t('ajudaProximo.targetAudienceLabel')}
                </span>{' '}
                {t(cat.audienceKey)}
              </p>
              <div style={{display:'flex',gap:8,flexShrink:0}}>
                <button
                  onClick={() => openModal(cat, 'request')}
                  style={{padding:'7px 14px',borderRadius:9,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:'var(--text)',fontSize:'0.8rem',fontWeight:600,cursor:'pointer'}}
                >
                  {t('ajudaProximo.needHelpBtn')}
                </button>
                <button
                  onClick={() => openModal(cat, 'offer')}
                  style={{padding:'7px 14px',borderRadius:9,background:`linear-gradient(135deg,${cat.color},${cat.color}cc)`,border:'none',color:'white',fontSize:'0.8rem',fontWeight:600,cursor:'pointer'}}
                >
                  {t('ajudaProximo.wantToHelpBtn')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:400,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={closeModal}>
          <div style={{background:'var(--card2,#172035)',borderRadius:16,padding:24,maxWidth:480,width:'100%',border:'1px solid var(--border)'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
              <span style={{fontSize:'1.6rem'}}>{modal.category.emoji}</span>
              <div>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.1rem',fontWeight:700,color:'var(--text)'}}>
                  {modal.mode === 'request' ? t('ajudaProximo.makeRequestBtn') : t('ajudaProximo.offerHelpBtn')}
                </h3>
                <p style={{fontSize:'0.8rem',color:'var(--muted)'}}>{t(modal.category.titleKey)}</p>
              </div>
            </div>

            <label style={{display:'block',marginBottom:8,fontSize:'0.85rem',color:'var(--text)',fontWeight:600}}>
              {t('ajudaProximo.messageLabel')}
            </label>
            <p style={{fontSize:'0.8rem',color:'var(--muted)',marginBottom:8}}>
              {modal.mode === 'request' ? t('ajudaProximo.describeRequest') : t('ajudaProximo.describeOffer')}
            </p>
            <textarea
              value={message}
              onChange={e=>setMessage(e.target.value)}
              placeholder={modal.mode === 'request' ? t('ajudaProximo.requestPlaceholder') : t('ajudaProximo.offerPlaceholder')}
              rows={4}
              style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 12px',color:'var(--text)',fontSize:'0.9rem',resize:'vertical',outline:'none',marginBottom:16}}
            />
            {!user && (
              <p style={{color:'#ff6b6b',fontSize:'0.8rem',marginBottom:12}}>
                ⚠️ {t('reflection.loginRequired')}
              </p>
            )}
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={closeModal} style={{padding:'9px 18px',borderRadius:9,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:'var(--text)',fontSize:'0.85rem',cursor:'pointer'}}>
                Cancelar
              </button>
              <button onClick={handleSubmit} style={{padding:'9px 18px',borderRadius:9,background:'linear-gradient(135deg,var(--fb),var(--fb2))',border:'none',color:'white',fontSize:'0.85rem',fontWeight:600,cursor:'pointer'}}>
                {t('ajudaProximo.submitBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
