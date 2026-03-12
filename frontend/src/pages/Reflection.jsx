import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Reflection() {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState(['', '', '']);
  const [saved, setSaved] = useState(false);

  const questions = [
    { q: t('reflection.q1'), verse: t('reflection.q1verse') },
    { q: t('reflection.q2'), verse: t('reflection.q2verse') },
    { q: t('reflection.q3'), verse: t('reflection.q3verse') },
  ];

  const handleChange = (i, value) => {
    const updated = [...answers];
    updated[i] = value;
    setAnswers(updated);
  };

  return (
    <div style={{maxWidth:700,margin:'0 auto',padding:24}}>
      <h2 style={{textAlign:'center',marginBottom:8}}>{t('reflection.title')}</h2>
      <p style={{textAlign:'center',color:'#666',marginBottom:32}}>{t('reflection.subtitle')}</p>
      {questions.map((q, i) => (
        <div key={i} style={{background:'#f9f9f9',borderRadius:12,padding:24,marginBottom:20,border:'1px solid #e0e0e0'}}>
          <h4>Pergunta {i+1}</h4>
          <p style={{fontWeight:600}}>{q.q}</p>
          <p style={{fontStyle:'italic',color:'#7c3aed'}}>{q.verse}</p>
          <textarea value={answers[i]} onChange={e => handleChange(i, e.target.value)} placeholder={t('reflection.placeholder')} style={{width:'100%',minHeight:100,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:14}} />
        </div>
      ))}
      {saved ? (
        <p style={{textAlign:'center',color:'green',fontWeight:600}}>{t('reflection.saved')}</p>
      ) : (
        <button onClick={() => setSaved(true)} style={{width:'100%',padding:14,background:'#7c3aed',color:'white',border:'none',borderRadius:12,fontSize:16,cursor:'pointer'}}>
          {t('reflection.save')}
        </button>
      )}
    </div>
  );
}