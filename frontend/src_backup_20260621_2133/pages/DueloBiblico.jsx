import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function DueloBiblico() {
  const iframeRef = useRef(null);
  const { user } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.onload = () => {
      const token = localStorage.getItem('token');
      const lang = i18n.language?.substring(0, 2) || 'pt';
      iframe.contentWindow.postMessage({
        type: 'LOGIN_DATA',
        user: {
          nome: user?.full_name || user?.name || 'Jogador',
          foto: user?.profile_photo || user?.avatar_url || null,
          token: token || null,
          idioma: lang
        }
      }, 'https://duelo-biblico.vercel.app');
    };
  }, [user, i18n.language]);

  const lang = i18n.language?.substring(0, 2) || 'pt';
  const url = `https://duelo-biblico.vercel.app?v=${Date.now()}&lang=${lang}`;

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        src={url}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="autoplay; fullscreen"
        title="Duelo Bíblico"
      />
    </div>
  );
}
