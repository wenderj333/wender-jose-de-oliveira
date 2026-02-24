<<<<<<< HEAD
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './RegistrationPromptPopup.css';

function RegistrationPromptPopup({ isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="registration-popup-overlay" onClick={onClose}>
      <div className="registration-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="registration-popup-close" onClick={onClose}>X</button>
        <p className="popup-verse">{t('nav.popup.verse')}</p>
        <h3 className="popup-title">{t('nav.popup.joinCommunity')}</h3>
        <ul className="popup-features">
          <li>{t('nav.popup.bullet1')}</li>
          <li>{t('nav.popup.bullet2')}</li>
          <li>{t('nav.popup.bullet3')}</li>
          <li>{t('nav.popup.bullet4')}</li>
        </ul>
        <Link to="/cadastro" className="btn btn-primary popup-register-btn" onClick={onClose}>
          {t('nav.popup.registerBtn')}
        </Link>
        <Link to="/login" className="btn btn-outline popup-login-btn" onClick={onClose}>
          {t('nav.popup.signInBtn')}
        </Link>
      </div>
    </div>
  );
}

export default RegistrationPromptPopup;
=======
import { useNavigate } from 'react-router-dom';

export default function RegistrationPromptPopup({ onClose }) {
  const navigate = useNavigate();
  return (
    <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{background:'white',borderRadius:'16px',padding:'30px',maxWidth:'400px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'40px',marginBottom:'10px'}}>🙏</div>
        <p style={{color:'#8B4513',fontStyle:'italic',fontSize:'14px',marginBottom:'15px'}}>"Onde dois ou tres estiverem reunidos em meu nome, ali estou eu." - Mateus 18:20</p>
        <h2 style={{color:'#2d6a4f',marginBottom:'10px'}}>Junte-se a nossa comunidade crista!</h2>
        <ul style={{textAlign:'left',color:'#555',fontSize:'14px',marginBottom:'20px',paddingLeft:'20px'}}>
          <li>Orar juntos</li>
          <li>Partilhar testemunhos</li>
          <li>Encontrar igrejas</li>
          <li>Conectar com irmaos de fe</li>
        </ul>
        <button onClick={() => navigate('/register')} style={{background:'#2d6a4f',color:'white',border:'none',padding:'12px 30px',borderRadius:'8px',fontSize:'16px',cursor:'pointer',width:'100%',marginBottom:'10px'}}>Registrar Gratis</button>
        <button onClick={() => navigate('/login')} style={{background:'transparent',color:'#2d6a4f',border:'2px solid #2d6a4f',padding:'10px 30px',borderRadius:'8px',fontSize:'14px',cursor:'pointer',width:'100%',marginBottom:'10px'}}>Ja tenho conta - Entrar</button>
        <button onClick={onClose} style={{background:'transparent',color:'#999',border:'none',fontSize:'12px',cursor:'pointer'}}>Fechar</button>
      </div>
    </div>
  );
}
>>>>>>> ae3430498bffb3fe64c298d720b8491f5b3961ff
