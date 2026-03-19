import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Nomes dos dias da semana (0=Dom ... 6=Sáb) para exibição
const DAY_NAMES = {
  pt: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  de: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
  en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  es: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  fr: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
  ro: ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'],
  ru: ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
};

export default function Reflection() {
  const { t, i18n } = useTranslation();
  const [answers, setAnswers] = useState(['', '', '']);
  const [saved, setSaved] = useState(false);

  // Escolhe o conjunto de perguntas com base no dia da semana (0=Dom ... 6=Sáb)
  const dayIndex = new Date().getDay();
  const lang = i18n.language?.substring(0, 2) || 'pt';

  // Busca o array de 7 conjuntos do i18n
  const allDays = t('reflection.days', { returnObjects: true });
  const today = Array.isArray(allDays) && allDays[dayIndex] ? allDays[dayIndex] : null;

  // Nome do dia atual
  const dayNames = DAY_NAMES[lang] || DAY_NAMES['en'];
  const todayName = dayNames[dayIndex];

  // Monta as 3 perguntas do dia
  const questions = today
    ? [
        { q: today.q1, verse: today.q1verse },
        { q: today.q2, verse: today.q2verse },
        { q: today.q3, verse: today.q3verse },
      ]
    : [
        // Fallback para as chaves antigas se algo falhar
        { q: t('reflection.q1'), verse: t('reflection.q1verse') },
        { q: t('reflection.q2'), verse: t('reflection.q2verse') },
        { q: t('reflection.q3'), verse: t('reflection.q3verse') },
      ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{maxWidth:640,margin:'0 auto',padding:'20px 16px'}}>
      {/* Header */}
      <div style={{textAlign:'center',marginBottom:28}}>
        <div style={{fontSize:'2.2rem',marginBottom:8}}>🕊️</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.8rem',fontWeight:700,color:'var(--text)',marginBottom:6}}>
          {t('reflection.title')}
        </h1>
        <p style={{color:'var(--muted)',fontSize:'0.95rem',marginBottom:8}}>
          {t('reflection.subtitle')}
        </p>
        {/* Indicador do dia */}
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--fb, #4a80d4)',color:'white',borderRadius:20,padding:'5px 16px',fontSize:'0.78rem',fontWeight:600,letterSpacing:'0.04em'}}>
          <span>📅</span>
          <span>{todayName}</span>
          {/* Dots de progresso dos 7 dias */}
          <div style={{display:'flex',gap:3,marginLeft:4}}>
            {Array.from({length:7}).map((_,i) => (
              <div key={i} style={{width:6,height:6,borderRadius:'50%',background: i === dayIndex ? 'white' : 'rgba(255,255,255,0.3)'}}/>
            ))}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        {questions.map((item, idx) => (
          <div key={idx} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:20,boxShadow:'0 2px 10px rgba(74,128,212,0.06)'}}>
            <div style={{display:'flex',gap:10,marginBottom:10}}>
              <div style={{width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,var(--fb,#4a80d4),var(--fb2,#3568b8))',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'0.75rem',fontWeight:700,flexShrink:0}}>
                {idx + 1}
              </div>
              <div>
                <p style={{fontWeight:600,color:'var(--text)',fontSize:'0.95rem',lineHeight:1.5,margin:0}}>
                  {item.q}
                </p>
                <p style={{fontSize:'0.78rem',color:'var(--gold,#a07820)',fontStyle:'italic',marginTop:4}}>
                  {item.verse}
                </p>
              </div>
            </div>
            <textarea
              value={answers[idx]}
              onChange={e => {
                const updated = [...answers];
                updated[idx] = e.target.value;
                setAnswers(updated);
              }}
              placeholder={t('reflection.placeholder')}
              rows={3}
              style={{
                width:'100%',
                background:'var(--input-bg,#f8faff)',
                border:'1px solid var(--border)',
                borderRadius:10,
                padding:'10px 12px',
                color:'var(--text)',
                fontSize:'0.9rem',
                resize:'vertical',
                outline:'none',
                boxSizing:'border-box',
                fontFamily:'inherit',
              }}
            />
          </div>
        ))}
      </div>

      {/* Save button */}
      <div style={{textAlign:'center',marginTop:24}}>
        <button
          onClick={handleSave}
          style={{
            padding:'11px 40px',
            borderRadius:12,
            background: saved
              ? 'linear-gradient(135deg,#22c55e,#16a34a)'
              : 'linear-gradient(135deg,var(--fb,#4a80d4),var(--fb2,#3568b8))',
            color:'white',
            fontSize:'0.95rem',
            fontWeight:700,
            border:'none',
            cursor:'pointer',
            transition:'all 0.3s',
            boxShadow:'0 4px 14px rgba(74,128,212,0.3)',
          }}
        >
          {saved ? `✓ ${t('reflection.saved')}` : t('reflection.save')}
        </button>
        <p style={{marginTop:10,fontSize:'0.75rem',color:'var(--muted)'}}>
          🔄 {t('reflection.rotateNote') || 'As perguntas mudam automaticamente a cada dia'}
        </p>
      </div>
    </div>
  );
}
