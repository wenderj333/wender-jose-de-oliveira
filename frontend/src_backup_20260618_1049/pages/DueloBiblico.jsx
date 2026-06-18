import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DueloBiblico() {
  const iframeRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.onload = () => {
      const token = localStorage.getItem('token');
      iframe.contentWindow.postMessage({
        type: 'LOGIN_DATA',
        user: {
          nome: user?.full_name || user?.name || 'Jogador',
          foto: user?.profile_photo || user?.avatar_url || null,
          token: token || null
        }
      }, 'https://duelo-biblico.vercel.app');
    };
  }, [user]);

  const url = `https://duelo-biblico.vercel.app?v=${Date.now()}`;

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