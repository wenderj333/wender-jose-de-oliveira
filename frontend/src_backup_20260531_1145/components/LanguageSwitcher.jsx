import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'pt', name: '🇧🇷 Português' },
  { code: 'es', name: '🇪🇸 Español' },
  { code: 'en', name: '🇺🇸 English' },
  { code: 'de', name: '🇩🇪 Deutsch' },
  { code: 'fr', name: '🇫🇷 Français' },
  { code: 'ro', name: '🇷🇴 Română' },
  { code: 'ru', name: '🇷🇺 Русский' },
];

/**
 * variant="dark"  → botão branco (para navbar azul do app) — padrão
 * variant="light" → botão azul escuro (para navbar branca da Landing)
 */
export default function LanguageSwitcher({ variant = 'dark' }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const isLight = variant === 'light';
  const currentCode = i18n.language?.substring(0, 2) || 'pt';
  const currentLang = LANGUAGES.find(l => l.code === currentCode) || LANGUAGES[0];

  const handleChange = (code) => {
    localStorage.setItem('i18nextLng', code);
    i18n.changeLanguage(code);
    setOpen(false);
  };

  // Cores do botão principal
  const btnStyle = {
    background: isLight ? 'rgba(74,128,212,0.1)' : 'rgba(255,255,255,0.18)',
    border: isLight ? '1.5px solid rgba(74,128,212,0.3)' : '1px solid rgba(255,255,255,0.25)',
    color: isLight ? '#3568b8' : '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 13px',
    borderRadius: 20,
    fontSize: '0.83rem',
    fontWeight: 600,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={btnStyle}
        onMouseEnter={e => {
          e.currentTarget.style.background = isLight ? 'rgba(74,128,212,0.18)' : 'rgba(255,255,255,0.28)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = isLight ? 'rgba(74,128,212,0.1)' : 'rgba(255,255,255,0.18)';
        }}
      >
        <Globe size={15} />
        {currentLang.name.split(' ')[0]} {currentCode.toUpperCase()}
      </button>

      {open && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            minWidth: 190,
            zIndex: 1000,
            border: '1px solid #e0e6f5',
            overflow: 'hidden',
          }}>
            {LANGUAGES.map(lang => {
              const isCurrent = currentCode === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleChange(lang.code)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: isCurrent ? '#f0f5ff' : 'transparent',
                    color: '#1e2240',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: isCurrent ? 600 : 400,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = '#f8faff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isCurrent ? '#f0f5ff' : 'transparent'; }}
                >
                  <span>{lang.name}</span>
                  {isCurrent && <Check size={14} color="#4a80d4" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
