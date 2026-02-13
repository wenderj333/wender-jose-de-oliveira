import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'pt', flag: '🇧🇷', label: 'Português' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = i18n.language?.substring(0, 2) || 'pt';
  const currentLang = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: 'var(--gray-500)',
        }}
        title="Idioma"
      >
        <Globe size={16} />
        <span>{currentLang.flag}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: '140px',
          overflow: 'hidden',
          marginTop: '4px',
        }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                background: current === lang.code ? '#f0f4ff' : 'transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: current === lang.code ? 600 : 400,
                color: '#333',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
