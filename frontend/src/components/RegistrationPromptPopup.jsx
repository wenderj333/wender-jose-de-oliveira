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
