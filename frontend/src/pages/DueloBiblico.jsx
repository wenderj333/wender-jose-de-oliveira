import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function DueloBiblico() {
  const iframeRef = useRef(null);
  const { user, token } = useAuth();
  const { i18n } = useTranslation();
  const dueloOrigin = 'https://duelo-biblico.vercel.app';

  const enviarSessaoAoDuelo = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const accessToken = token || localStorage.getItem('token');
    const lang = i18n.language?.substring(0, 2) || 'pt';
    iframe.contentWindow.postMessage({
      type: 'LOGIN_DATA',
      user: {
        nome: user?.full_name || user?.name || 'Jogador',
        nomeDiploma: user?.full_name || user?.name || 'Jogador',
        foto: user?.profile_photo || user?.avatar_url || null,
        token: accessToken || null,
        idioma: lang,
        destaqueRanking: '1.º lugar no Duelo Bíblico'
      }
    }, dueloOrigin);
  }, [i18n.language, token, user]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'duel_entry', { page: 'duelo_biblico' });
    }
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const aoCarregar = () => {
      [100, 450, 1200, 2500].forEach(delay => window.setTimeout(enviarSessaoAoDuelo, delay));
    };
    const aoPedirSessao = (event) => {
      if (event.origin === dueloOrigin && ['SIGO_AUTH_READY', 'SIGO_AUTH_REQUIRED'].includes(event.data?.type)) {
        enviarSessaoAoDuelo();
      }
    };

    iframe.addEventListener('load', aoCarregar);
    window.addEventListener('message', aoPedirSessao);
    aoCarregar();
    return () => {
      iframe.removeEventListener('load', aoCarregar);
      window.removeEventListener('message', aoPedirSessao);
    };
  }, [enviarSessaoAoDuelo]);

  const lang = i18n.language?.substring(0, 2) || 'pt';
  // Mantém o src estável; recriá-lo em cada render reiniciava o iframe e a rolagem.
  const url = useMemo(() => `https://duelo-biblico.vercel.app?lang=${lang}`, [lang]);

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
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
