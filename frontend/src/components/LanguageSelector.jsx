import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div style={{position:'relative', display:'flex', alignItems:'center'}}>
      <Globe size={16} style={{position:'absolute', left:8, color:'rgba(255,255,255,0.7)', pointerEvents:'none'}} />
      <select 
        value={i18n.language} 
        onChange={changeLanguage}
        style={{
          padding:'5px 10px 5px 30px',
          borderRadius:16,
          background:'rgba(255,255,255,0.14)',
          border:'1px solid rgba(255,255,255,0.2)',
          fontSize:'0.72rem',
          color:'rgba(255,255,255,0.9)',
          appearance:'none',
          cursor:'pointer',
          outline:'none'
        }}
      >
        <option style={{color:'#000'}} value="pt">🇧🇷 PT</option>
        <option style={{color:'#000'}} value="es">🇪🇸 ES</option>
        <option style={{color:'#000'}} value="en">🇺🇸 EN</option>
        <option style={{color:'#000'}} value="de">🇩🇪 DE</option>
        <option style={{color:'#000'}} value="fr">🇫🇷 FR</option>
        <option style={{color:'#000'}} value="ro">🇷🇴 RO</option>
        <option style={{color:'#000'}} value="ru">🇷🇺 RU</option>
      </select>
    </div>
  );
}
