import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'pt', flag: '🇧🇷', label: 'PT' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.substring(0, 2) || 'pt';

  return (
    <div className="lang-switcher" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      <Globe size={14} style={{ color: 'var(--gray-500)', marginRight: '4px' }} />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          title={lang.label}
          style={{
            background: current === lang.code ? 'var(--primary)' : 'transparent',
            color: current === lang.code ? '#fff' : 'var(--gray-500)',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontWeight: current === lang.code ? 700 : 400,
          }}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}
