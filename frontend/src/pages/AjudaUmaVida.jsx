import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  {
    key: 'spiritual',
    emoji: '🙏',
    titleKey: 'ajudaProximo.category.spiritual.title',
    verseKey: 'ajudaProximo.category.spiritual.verse',
    typesKey: 'ajudaProximo.category.spiritual.types',
    audienceKey: 'ajudaProximo.category.spiritual.targetAudience',
    color: '#6c47d4',
  },
  {
    key: 'diaconia',
    emoji: '🍞',
    titleKey: 'ajudaProximo.category.diaconia.title',
    verseKey: 'ajudaProximo.category.diaconia.verse',
    typesKey: 'ajudaProximo.category.diaconia.types',
    audienceKey: 'ajudaProximo.category.diaconia.targetAudience',
    color: '#c9a84c',
  },
  {
    key: 'employment',
    emoji: '💼',
    titleKey: 'ajudaProximo.category.employment.title',
    verseKey: 'ajudaProximo.category.employment.verse',
    typesKey: 'ajudaProximo.category.employment.types',
    audienceKey: 'ajudaProximo.category.employment.targetAudience',
    color: '#1e8a5a',
  },
  {
    key: 'emotional',
    emoji: '❤️',
    titleKey: 'ajudaProximo.category.emotional.title',
    verseKey: 'ajudaProximo.category.emotional.verse',
    typesKey: 'ajudaProximo.category.emotional.types',
    audienceKey: 'ajudaProximo.category.emotional.targetAudience',
    color: '#d44747',
  },
  {
    key: 'health',
    emoji: '🏥',
    titleKey: 'ajudaProximo.category.health.title',
    verseKey: 'ajudaProximo.category.health.verse',
    typesKey: 'ajudaProximo.category.health.types',
    audienceKey: 'ajudaProximo.category.health.targetAudience',
    color: '#1e6ab5',
  },
];

const EMOTIONAL_SUPPORT = {
  0: {
    emoji: '🕊️',
    title: 'Luto e Perda',
    message: '"O Senhor está perto dos que têm o coração quebrantado." — Salmos 34:18\n\nNeste momento de dor, você não precisa carregar esse peso sozinho. Deus está ao teu lado em cada lágrima.',
    story: 'Ana perdeu o seu marido após 20 anos de casamento. "Pensei que não sobreviveria à dor. Mas a comunidade da igreja me abraçou, orei muito e hoje posso dizer: Deus restaurou a minha alegria."'
  },
  1: {
    emoji: '💑',
    title: 'Restauração de Casamento',
    message: '"O amor é paciente, o amor é bondoso." — 1 Coríntios 13:4\n\nOs relacionamentos passam por crises, mas com fé, diálogo e ajuda, é possível reconstruir laços que pareciam quebrados.',
    story: 'Maria e João estavam prestes a se separar depois de 10 anos. "Através de aconselhamento pastoral e muita oração, redescubrimos o amor que tinha adormecido. Hoje somos mais fortes do que nunca."'
  },
  2: {
    emoji: '👩‍👧',
    title: 'Apoio a Mães Solo',
    message: '"Tudo posso naquele que me fortalece." — Filipenses 4:13\n\nSer mãe solo é um dos maiores desafios. Mas você é mais forte do que imagina e não está sozinha nessa jornada.',
    story: 'Carla criou dois filhos sozinha trabalhando como faxineira. "Chorei muitas noites. Mas a igreja me ajudou, Deus abriu portas. Hoje meus filhos estudam e tenho orgulho da mulher que me tornei."'
  },
  3: {
    emoji: '🌱',
    title: 'Dependência Química',
    message: '"Portanto, se alguém está em Cristo, é nova criação." — 2 Coríntios 5:17\n\nA libertação é possível. Não precisa enfrentar isso sozinho — há ajuda, esperança e uma nova vida te esperando.',
    story: 'Roberto ficou 8 anos dependente de álcool. "Achei que nunca sairia disso. Uma visita à igreja mudou tudo. Com apoio espiritual e um grupo de ajuda, completo agora 3 anos limpo. Deus é fiel."'
  },
};

export default function AjudaUmaVida() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState('');
  const [emotionalModal, setEmotionalModal] = useState(null);

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

  const openEmotionalModal = (index) => setEmotionalModal(EMOTIONAL_SUPPORT[index]);
  const closeEmotionalModal = () => setEmotionalModal(null);

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
          {t('ajudaProximo.headerVerse')}
        </p>
      </div>

      {/* Categories */}
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {CATEGORIES.map(cat => {
          const types = t(cat.typesKey, { returnObjects: true });
          const typesList = Array.isArray(types) ? types : [];

          return (
            <div key={cat.key} style={{background:'var(--card)',borderRadius:14,border:'1px solid var(--border)',overflow:'hidden',boxShadow:'0 2px 12px rgba(74,128,212,0.07)'}}>
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
              {typesList.length > 0 && (
                <div style={{padding:'12px 18px',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                    {typesList.map((type, idx) => (
                      cat.key === 'emotional' ? (
                        <span
                          key={type}
                          onClick={() => openEmotionalModal(idx)}
                          style={{
                            background:`${cat.color}18`,
                            border:`1px solid ${cat.color}40`,
                            borderRadius:20,
                            padding:'4px 12px',
                            fontSize:'0.75rem',
                            color:'var(--text)',
                            fontWeight:500,
                            cursor:'pointer',
                            transition:'background 0.18s, border-color 0.18s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = `${cat.color}30`;
                            e.currentTarget.style.borderColor = `${cat.color}80`;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = `${cat.color}18`;
                            e.currentTarget.style.borderColor = `${cat.color}40`;
                          }}
                        >
                          {type}
                        </span>
                      ) : (
                        <span key={type} style={{background:`${cat.color}18`,border:`1px solid ${cat.color}40`,borderRadius:20,padding:'4px 12px',fontSize:'0.75rem',color:'var(--text)',fontWeight:500}}>
                          {type}
                        </span>
                      )
                    ))}
                  </div>

                  {/* "Você não está só" block for health */}
                  {cat.key === 'health' && (
                    <div style={{marginTop:10,background:'#e8f0fe',borderRadius:10,padding:'12px 16px'}}>
                      <p style={{fontSize:'0.82rem',color:'#1a3a6b',margin:0,fontWeight:600}}>
                        Você não está só ❤️
                      </p>
                      <p style={{fontSize:'0.82rem',color:'#1a3a6b',margin:'4px 0 0'}}>
                        Mesmo nas horas mais difíceis, Deus está contigo e esta comunidade caminha ao teu lado.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Audience + Buttons */}
              <div style={{padding:'12px 18px',display:'flex',alignItems:'center',flexWrap:'wrap',gap:10}}>
                <p style={{flex:1,fontSize:'0.75rem',color:'var(--muted)'}}>
                  <span style={{fontWeight:600,color:'var(--gold)'}}>{t('ajudaProximo.targetAudienceLabel')}</span>{' '}
                  {t(cat.audienceKey)}
                </p>
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <button
                    onClick={() => openModal(cat, 'request')}
                    style={{padding:'7px 14px',borderRadius:9,background:'rgba(74,128,212,0.07)',border:'1px solid rgba(74,128,212,0.2)',color:'var(--text)',fontSize:'0.8rem',fontWeight:600,cursor:'pointer'}}
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
          );
        })}
      </div>

      {/* Modal — Preciso de ajuda / Quero ajudar */}
      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:400,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={closeModal}>
          <div style={{background:'var(--card)',borderRadius:16,padding:24,maxWidth:480,width:'100%',border:'1px solid var(--border)',boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
              <span style={{fontSize:'1.6rem'}}>{modal.category.emoji}</span>
              <div>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.1rem',fontWeight:700,color:'var(--text)'}}>
                  {modal.mode === 'request' ? t('ajudaProximo.makeRequestBtn') : t('ajudaProximo.offerHelpBtn')}
                </h3>
                <p style={{fontSize:'0.8rem',color:'var(--muted)'}}>{t(modal.category.titleKey)}</p>
              </div>
            </div>

            <label style={{display:'block',marginBottom:6,fontSize:'0.85rem',color:'var(--text)',fontWeight:600}}>
              {t('ajudaProximo.messageLabel')}
            </label>
            <p style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:8}}>
              {modal.mode === 'request' ? t('ajudaProximo.describeRequest') : t('ajudaProximo.describeOffer')}
            </p>
            <textarea
              value={message}
              onChange={e=>setMessage(e.target.value)}
              placeholder={modal.mode === 'request' ? t('ajudaProximo.requestPlaceholder') : t('ajudaProximo.offerPlaceholder')}
              rows={4}
              style={{width:'100%',background:'var(--input-bg,#f8faff)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 12px',color:'var(--text)',fontSize:'0.9rem',resize:'vertical',outline:'none',marginBottom:16,boxSizing:'border-box'}}
            />
            {!user && (
              <p style={{color:'#e05050',fontSize:'0.8rem',marginBottom:12}}>
                ⚠️ {t('reflection.loginRequired')}
              </p>
            )}
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={closeModal} style={{padding:'9px 18px',borderRadius:9,background:'rgba(74,128,212,0.07)',border:'1px solid var(--border)',color:'var(--text)',fontSize:'0.85rem',cursor:'pointer'}}>
                {t('common.cancel')}
              </button>
              <button onClick={handleSubmit} style={{padding:'9px 18px',borderRadius:9,background:'linear-gradient(135deg,var(--fb),var(--fb2))',border:'none',color:'white',fontSize:'0.85rem',fontWeight:600,cursor:'pointer'}}>
                {t('ajudaProximo.submitBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Apoio Emocional */}
      {emotionalModal && (
        <div
          style={{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,0.70)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}
          onClick={closeEmotionalModal}
        >
          <div
            style={{background:'#fff',borderRadius:16,padding:24,maxWidth:420,width:'100%',boxShadow:'0 8px 40px rgba(0,0,0,0.25)'}}
            onClick={e=>e.stopPropagation()}
          >
            {/* Emoji + título */}
            <div style={{textAlign:'center',marginBottom:16}}>
              <div style={{fontSize:'3rem',lineHeight:1.2}}>{emotionalModal.emoji}</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.3rem',fontWeight:700,color:'#1a1a2e',margin:'8px 0 0'}}>
                {emotionalModal.title}
              </h3>
            </div>

            {/* Mensagem de apoio */}
            <p style={{fontSize:'0.88rem',fontStyle:'italic',color:'#1a1a2e',lineHeight:1.6,marginBottom:16,whiteSpace:'pre-line'}}>
              {emotionalModal.message.split('\n').map((line, i) =>
                i === 0
                  ? <span key={i} style={{color:'#b8861b',fontWeight:600}}>{line}</span>
                  : <span key={i}>{line}</span>
              )}
            </p>

            {/* Separador */}
            <hr style={{border:'none',borderTop:'1px solid #e8e8f0',marginBottom:14}} />

            {/* História de superação */}
            <div>
              <p style={{fontSize:'0.75rem',color:'#888',fontWeight:600,marginBottom:6}}>💬 História real:</p>
              <div style={{background:'#f8f9ff',borderRadius:10,padding:'12px'}}>
                <p style={{fontSize:'0.84rem',color:'#2a2a4a',lineHeight:1.55,margin:0,fontStyle:'italic'}}>
                  {emotionalModal.story}
                </p>
              </div>
            </div>

            {/* Botão fechar */}
            <button
              onClick={closeEmotionalModal}
              style={{marginTop:20,width:'100%',padding:'11px',borderRadius:10,background:'linear-gradient(135deg,#4a80d4,#6c47d4)',border:'none',color:'white',fontSize:'0.9rem',fontWeight:700,cursor:'pointer'}}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
