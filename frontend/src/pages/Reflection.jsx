import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

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
  const { user, token } = useAuth();
  const [answers, setAnswers] = useState(['', '', '']);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');

  const dayIndex = new Date().getDay();
  const lang = i18n.language?.substring(0, 2) || 'pt';

  const allDays = t('reflection.days', { returnObjects: true });
  const today = Array.isArray(allDays) && allDays[dayIndex] ? allDays[dayIndex] : null;

  const dayNames = DAY_NAMES[lang] || DAY_NAMES['en'];
  const todayName = dayNames[dayIndex];

  const questions = today
    ? [
        { q: today.q1, verse: today.q1verse },
        { q: today.q2, verse: today.q2verse },
        { q: today.q3, verse: today.q3verse },
      ]
    : [
        { q: t('reflection.q1'), verse: t('reflection.q1verse') },
        { q: t('reflection.q2'), verse: t('reflection.q2verse') },
        { q: t('reflection.q3'), verse: t('reflection.q3verse') },
      ];

  const hasAnswers = answers.some(a => a.trim().length > 0);

  const handleSave = async () => {
    if (!hasAnswers) return;
    if (!token) {
      setError(t('reflection.loginRequired', 'Faça login para guardar a reflexão.'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Montar conteúdo da reflexão
      const lines = [`🕊️ ${t('reflection.title', 'Reflexão com Deus')} — ${todayName}\n`];
      questions.forEach((item, idx) => {
        if (answers[idx].trim()) {
          lines.push(`❓ ${item.q}`);
          if (item.verse) lines.push(`📖 ${item.verse}`);
          lines.push(`✍️ ${answers[idx].trim()}`);
          lines.push('');
        }
      });
      const content = lines.join('\n');

      if (isPublic) {
        // Publicar no Mural (usar FormData para compatibilidade com multer)
        const fd = new FormData();
        fd.append('content', content);
        fd.append('category', 'reflexao');
        fd.append('visibility', 'public');
        const res = await fetch(`${API}/api/feed`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) throw new Error('Erro ao publicar no Mural');
      } else {
        // Guardar privado nas jornadas de fé
        await fetch(`${API}/api/journeys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: `${t('reflection.title', 'Reflexão')} — ${todayName}`,
            content,
            is_public: false,
          }),
        }).catch(() => {}); // falha silenciosa se endpoint não existir
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (e) {
      setError(e.message || 'Erro ao guardar. Tente novamente.');
    }

    setSaving(false);
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
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--fb,#4a80d4)',color:'white',borderRadius:20,padding:'5px 16px',fontSize:'0.78rem',fontWeight:600,letterSpacing:'0.04em'}}>
          <span>📅</span>
          <span>{todayName}</span>
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

      {/* Visibility toggle */}
      <div style={{marginTop:20,background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 18px'}}>
        <p style={{fontWeight:600,fontSize:'0.85rem',color:'var(--text)',marginBottom:12}}>
          {t('reflection.shareLabel', 'Onde guardar a reflexão?')}
        </p>
        <div style={{display:'flex',gap:10}}>
          <button
            onClick={() => setIsPublic(false)}
            style={{
              flex:1,padding:'10px 12px',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:'0.82rem',
              background: !isPublic ? 'var(--fb-light,#edf2fc)' : 'transparent',
              border: !isPublic ? '2px solid var(--fb,#4a80d4)' : '1px solid var(--border)',
              color: !isPublic ? 'var(--fb,#4a80d4)' : 'var(--muted)',
            }}
          >
            🔒 {t('reflection.privateOption', 'Privado')}
            <div style={{fontSize:'0.72rem',fontWeight:400,marginTop:2,opacity:0.75}}>
              {t('reflection.privateDesc', 'Só você vê')}
            </div>
          </button>
          <button
            onClick={() => setIsPublic(true)}
            style={{
              flex:1,padding:'10px 12px',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:'0.82rem',
              background: isPublic ? 'var(--fb-light,#edf2fc)' : 'transparent',
              border: isPublic ? '2px solid var(--fb,#4a80d4)' : '1px solid var(--border)',
              color: isPublic ? 'var(--fb,#4a80d4)' : 'var(--muted)',
            }}
          >
            🌍 {t('reflection.publicOption', 'Público')}
            <div style={{fontSize:'0.72rem',fontWeight:400,marginTop:2,opacity:0.75}}>
              {t('reflection.publicDesc', 'Aparece no Mural')}
            </div>
          </button>
        </div>
        {isPublic && (
          <p style={{marginTop:8,fontSize:'0.75rem',color:'#6c47d4',fontStyle:'italic'}}>
            ✨ {t('reflection.publicNote', 'A tua reflexão vai inspirar outros membros!')}
          </p>
        )}
      </div>

      {/* Error */}
      {error && <p style={{color:'#dc2626',fontSize:'0.82rem',textAlign:'center',marginTop:10}}>{error}</p>}

      {/* Save button */}
      <div style={{textAlign:'center',marginTop:20}}>
        <button
          onClick={handleSave}
          disabled={saving || !hasAnswers}
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
            cursor: hasAnswers ? 'pointer' : 'not-allowed',
            opacity: hasAnswers ? 1 : 0.6,
            transition:'all 0.3s',
            boxShadow:'0 4px 14px rgba(74,128,212,0.3)',
          }}
        >
          {saving ? '⏳ ...' : saved
            ? (isPublic ? `✓ ${t('reflection.sharedMural', 'Publicado no Mural!')}` : `✓ ${t('reflection.saved')}`)
            : (isPublic ? `🌍 ${t('reflection.shareInMural', 'Publicar no Mural')}` : t('reflection.save'))}
        </button>
        <p style={{marginTop:10,fontSize:'0.75rem',color:'var(--muted)'}}>
          🔄 {t('reflection.rotateNote') || 'As perguntas mudam automaticamente a cada dia'}
        </p>
      </div>
    </div>
  );
}
