import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AjudaUmaVida() {
  const { t } = useTranslation();
  const categories = [
    { emoji: '🙏', key: 'spiritual', verse: 'Tiago 5:16' },
    { emoji: '🍞', key: 'diaconia', verse: 'Lucas 3:11' },
    { emoji: '💼', key: 'work', verse: 'Colossenses 3:23' },
    { emoji: '❤️', key: 'emotional', verse: 'Salmos 34:18' },
    { emoji: '🏥', key: 'health', verse: 'Mateus 8:17' },
  ];
  return (
    <div style={{maxWidth:700,margin:'0 auto',padding:24}}>
      <h2 style={{textAlign:'center',marginBottom:8}}>{t('nav.help_life','Ajude o Próximo')}</h2>
      <p style={{textAlign:'center',color:'#666',marginBottom:32}}>{t('ajuda.subtitle','Conecta pessoas')}</p>
      {categories.map((cat, i) => (
        <div key={i} style={{background:'#f9f9f9',borderRadius:12,padding:24,marginBottom:16,border:'1px solid #e0e0e0'}}>
          <h3>{cat.emoji} {t('ajuda.'+cat.key, cat.key)}</h3>
          <p style={{fontStyle:'italic',color:'#7c3aed',fontSize:13}}>{cat.verse}</p>
          <div style={{display:'flex',gap:12,marginTop:12}}>
            <button style={{flex:1,padding:10,background:'#7c3aed',color:'white',border:'none',borderRadius:8,cursor:'pointer'}}>{t('ajuda.request','Fazer Pedido')}</button>
            <button style={{flex:1,padding:10,background:'#10b981',color:'white',border:'none',borderRadius:8,cursor:'pointer'}}>{t('ajuda.offer','Oferecer Ajuda')}</button>
          </div>
        </div>
      ))}
    </div>
  );
}