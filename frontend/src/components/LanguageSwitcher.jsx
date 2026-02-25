import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);

  const languages = [
    { code: 'pt', name: '🇧🇷 Português', flag: '🇵🇹' },
    { code: 'es', name: '🇪🇸 Español', flag: '🇪🇸' },
    { code: 'en', name: '🇺🇸 English', flag: '🇬🇧' },
    { code: 'de', name: '🇩🇪 Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: '🇫🇷 Français', flag: '🇫🇷' },
    { code: 'ro', name: '🇷🇴 Română', flag: '🇷🇴' },
    { code: 'ru', name: '🇷🇺 Русский', flag: '🇷🇺' },
  ];

  const handleLanguageChange = (langCode) => {
    // Save to localStorage FIRST
    localStorage.setItem('i18nextLng', langCode);
    // Then change the language in i18n
    i18n.changeLanguage(langCode);
    // Force UI update
    setShowDropdown(false);
    // Verify it was saved
    console.log('Language changed to:', langCode, 'localStorage:', localStorage.getItem('i18nextLng'));
  };

  const currentLang = languages.find(l => l.code === i18n.language?.substring(0, 2));

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0.4rem 0.8rem',
          borderRadius: 20,
          fontSize: '0.85rem',
          fontWeight: 600,
          transition: 'all 0.2s',
          backgroundColor: 'rgba(255,255,255,0.15)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
        }}
      >
        <Globe size={16} />
        {currentLang?.flag} {currentLang?.code.toUpperCase()}
      </button>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: 200,
            zIndex: 1000,
            marginTop: 8,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: i18n.language?.substring(0, 2) === lang.code ? '#f0f0f0' : 'transparent',
                color: '#1a0a3e',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e8e8e8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = i18n.language?.substring(0, 2) === lang.code ? '#f0f0f0' : 'transparent';
              }}
            >
              <span>{lang.name}</span>
              {i18n.language?.substring(0, 2) === lang.code && (
                <Check size={16} color="#daa520" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
