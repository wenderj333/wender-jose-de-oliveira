import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL || '';
const DAY_NAMES = {
  pt:['Domingo','Segunda','Terca','Quarta','Quinta','Sexta','Sabado'],
  en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  es:['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
  de:['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
  fr:['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
  ro:['Duminica','Luni','Marti','Miercuri','Joi','Vineri','Sambata'],
  ru:['Voskresenye','Ponedelnik','Vtornik','Sreda','Chetverg','Pyatnitsa','Subbota'],
};
const cleanText = (value = '') => String(value)
  .replaceAll('ðŸ™', '🙏').replaceAll('ðŸ’­', '💭').replaceAll('â€”', '—')
  .replaceAll('Â¿', '¿').replaceAll('Â¡', '¡').replaceAll('Ã ', 'à')
  .replaceAll('Ã©', 'é').replaceAll('Ã­', 'í').replaceAll('Ã³', 'ó')
  .replaceAll('Ãº', 'ú').replaceAll('Ã±', 'ñ');
export default function Reflection() {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const lang = i18n.language?.substring(0,2) || 'pt';
  const today = new Date().getDay();
  const [selDay, setSelDay] = useState(today);
  const [answers, setAnswers] = useState(['','','']);
  const [saved, setSaved] = useState(false);
  const [touched, setTouched] = useState([false,false,false]);
  const [timer, setTimer] = useState(false);
  const [timerSec, setTimerSec] = useState(120);
  const [activeQ, setActiveQ] = useState(0);
  const [activeGuia, setActiveGuia] = useState(null);
  const [faithStep, setFaithStep] = useState('');
  const [streak, setStreak] = useState(0);
  const [totalReflections, setTotalReflections] = useState(0);
  const [loadingDiary, setLoadingDiary] = useState(Boolean(user));
  const [saveError, setSaveError] = useState('');
  const [showPrayer, setShowPrayer] = useState(false);
  const timerRef = useRef(null);
  const draftsRef = useRef({});
  const days = t('reflection.days', { returnObjects: true }) || [];
  const currentDay = Array.isArray(days) ? days[selDay] : {};
  const questions = currentDay ? [
    { q: cleanText(currentDay.q1), verse: cleanText(currentDay.q1verse), tip: cleanText(t('reflection.tip1','Pense em momentos onde Deus falou contigo')) },
    { q: cleanText(currentDay.q2), verse: cleanText(currentDay.q2verse), tip: cleanText(t('reflection.tip2','Recorda situacoes da ultima semana')) },
    { q: cleanText(currentDay.q3), verse: cleanText(currentDay.q3verse), tip: cleanText(t('reflection.tip3','Reflite sobre as tuas emocoes')) },
  ] : [];
  const hora = new Date().getHours();
  const periodo = hora < 12 ? 0 : 1;
  const diaSemana = new Date().getDay();
  const idx_guia = (diaSemana * 2 + periodo) % 7;

  const REFLEXOES = {
    guidTitle1: [
      "Fecha os olhos por 1 minuto. Respira fundo. Deus esta aqui contigo agora.",
      "O que te impede de confiar completamente em Deus hoje?",
      "Imagina Deus olhando para ti com amor. O que sentes?",
      "Existe algo que guardas so para ti e nao partilhas com Deus?",
      "Em que area da tua vida precisas mais da presenca de Deus?",
      "O que significa para ti 'buscar a Deus de todo o coracao'?",
      "Quando foi a ultima vez que sentiste Deus muito perto de ti?",
    ],
    guidTitle2: [
      "Qual e o pensamento que mais te preocupa hoje? Entrega-o a Deus.",
      "Existe algo que fizeste e ainda nao perdoaste a ti mesmo?",
      "O que e que Deus sabe sobre ti que ninguem mais sabe?",
      "Qual e a tua maior luta interior neste momento?",
      "Tens sido honesto contigo mesmo sobre o teu estado espiritual?",
      "O que evitas pensar porque te causa dor ou vergonha?",
      "Deus ja conhece tudo. Podes ser completamente honesto. O que dizes?",
    ],
    guidTitle3: [
      "O que aprendeste sobre Deus esta semana que nao sabias antes?",
      "Qual e a area da tua vida onde mais cresceste nos ultimos meses?",
      "O que a Biblia te tem dito ultimamente que ainda nao aplicaste?",
      "Que habito espiritual queres desenvolver nos proximos 30 dias?",
      "Como seria a tua vida se confiances 100% em Deus?",
      "O que te faz recuar quando se trata de crescer na fe?",
      "Que versículo tem falado mais ao teu coracao ultimamente?",
    ],
    guidTitle4: [
      "O que vais fazer de diferente hoje por causa da tua fe?",
      "Quem na tua vida precisa ver Cristo atraves de ti hoje?",
      "Qual e uma acao concreta que podes fazer hoje para amar alguem?",
      "O que Deus te tem pedido que ainda nao fizeste?",
      "Como podes ser uma bencao para alguem antes do fim do dia?",
      "Qual e um habito que precisas abandonar para crescer espiritualmente?",
      "Se hoje fosse o ultimo dia, o que farias de diferente?",
    ],
  };

  const guias = [
    { key:'guidTitle1', icon:'🔍', title:t('reflection.guidTitle1','Busque a Deus'), desc:t('reflection.guidDesc1','Reserve este momento so para Ele'), color:'#6C3FA0' },
    { key:'guidTitle2', icon:'💬', title:t('reflection.guidTitle2','Seja honesto'), desc:t('reflection.guidDesc2','Deus conhece o seu coracao'), color:'#e67e22' },
    { key:'guidTitle3', icon:'🌱', title:t('reflection.guidTitle3','Cresca na fe'), desc:t('reflection.guidDesc3','Reflita profundamente'), color:'#27ae60' },
    { key:'guidTitle4', icon:'✨', title:t('reflection.guidTitle4','Coloque em pratica'), desc:t('reflection.guidDesc4','Aplique no seu dia'), color:'#3498db' },
  ];
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  useEffect(() => {
    if (!user || !token) { setLoadingDiary(false); return; }
    let alive = true;
    (async () => {
      try {
        const response = await fetch(API + '/api/reflection/today', { headers: { Authorization: 'Bearer ' + token } });
        if (!response.ok) throw new Error('diary');
        const data = await response.json();
        if (!alive) return;
        setStreak(data.streak || 0); setTotalReflections(data.total || 0);
        if (data.entry) {
          const restored = Array.isArray(data.entry.answers) ? data.entry.answers.map(answer => String(answer || '')) : ['','',''];
          setAnswers(restored); draftsRef.current[today] = restored;
          setFaithStep(data.entry.faith_step || '');
        }
      } catch { if (alive) setSaveError(t('reflection.diaryLoadError','Não foi possível carregar o diário agora.')); }
      finally { if (alive) setLoadingDiary(false); }
    })();
    return () => { alive = false; };
  }, [user, token, today, t]);
  const startTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; setTimer(false); setTimerSec(120); return; }
    setTimerSec(120); setTimer(true);
    timerRef.current = setInterval(() => {
      setTimerSec(prev => { if(prev<=1){ clearInterval(timerRef.current); timerRef.current=null; setTimer(false); return 120; } return prev-1; });
    }, 1000);
  };
  const handleSave = async () => {
    if(!user) return;
    setSaveError('');
    try {
      const response = await fetch(API+'/api/reflection', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({answers,day:selDay,lang,faithStep}) });
      if (!response.ok) throw new Error('save');
      const data = await response.json();
      setStreak(current => Math.max(current, 1));
      setTotalReflections(current => Math.max(current, 1));
      draftsRef.current[selDay] = [...answers];
      setSaved(true); setTimeout(()=>setSaved(false), 3000);
      return data;
    } catch(e) { setSaveError(t('reflection.saveError','Não foi possível guardar. Tente novamente.')); }
  };
  const chooseDay = (day) => {
    draftsRef.current[selDay] = [...answers];
    setSelDay(day); setAnswers(draftsRef.current[day] || ['','','']);
    setSaved(false); setSaveError(''); setShowPrayer(false);
  };
  const progress = answers.filter(a=>a.trim().length>0).length;
  const prayer = answers.filter(Boolean).length
    ? `${t('reflection.prayerDear','Senhor,')} ${answers.filter(Boolean).join(' ')} ${t('reflection.prayerCloseText','Entrego este momento nas Tuas mãos. Amém.')}`
    : t('reflection.prayerEmpty','Senhor, guia o meu coração e ajuda-me a caminhar Contigo hoje. Amém.');

  return (
    <div style={{maxWidth:720,margin:'0 auto',padding:'0 0 80px',fontFamily:'Segoe UI,sans-serif'}}>
      <style>{'.rtextarea{width:100%;border:2px solid #e8e0f5;border-radius:14px;padding:14px 16px;font-size:.95rem;resize:none;outline:none;transition:border 0.2s;box-sizing:border-box;background:#fdfaff;color:#1a0a3e}.rtextarea:focus{border-color:#6C3FA0;background:white}'}</style>
      <div style={{backgroundImage:'linear-gradient(135deg,rgba(108,63,160,0.4),rgba(45,10,94,0.5)),url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80)',backgroundSize:'cover',backgroundPosition:'center',padding:'36px 24px 28px',borderRadius:'0 0 32px 32px',marginBottom:28,color:'white',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,right:0,fontSize:120,opacity:0.07,lineHeight:1}}>🕊️</div>
        <div style={{position:'relative',zIndex:1}}>
          <p style={{margin:'0 0 6px',fontSize:'0.8rem',opacity:0.7,letterSpacing:2,textTransform:'uppercase'}}>✨ {t('reflection.subtitle','Alguns minutos com Deus')}</p>
          <h1 style={{margin:'0 0 16px',fontSize:'clamp(1.4rem,4vw,2rem)',fontWeight:900}}>{t('reflection.title','Reflexao com Deus')}</h1>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
            {(DAY_NAMES[lang]||DAY_NAMES.pt).map((d,i)=>(
              <button key={i} onClick={()=>chooseDay(i)} style={{padding:'6px 12px',borderRadius:20,border:'none',background:selDay===i?'white':'rgba(255,255,255,0.15)',color:selDay===i?'#6C3FA0':'white',fontWeight:700,cursor:'pointer',fontSize:'0.75rem'}}>{d}</button>
            ))}
          </div>
          <div style={{background:'rgba(255,255,255,0.2)',borderRadius:20,height:8,marginBottom:8}}>
            <div style={{background:'#f0c040',borderRadius:20,height:8,width:`${(progress/3)*100}%`,transition:'width 0.5s'}}/>
          </div>
          <p style={{margin:0,fontSize:'0.8rem',opacity:0.8}}>{progress}/3 {cleanText(t('reflection.rotateNote','perguntas respondidas'))}</p>
        </div>
      </div>
      {user && <div style={{margin:'-14px 16px 22px',background:'white',border:'1px solid #e9ddfa',borderRadius:18,padding:'12px 16px',display:'flex',justifyContent:'space-between',gap:12,boxShadow:'0 5px 18px rgba(74,34,112,.1)'}}>
        <span style={{color:'#4A2270',fontWeight:800}}>🔥 {loadingDiary ? t('common.loading','A carregar...') : `${streak} ${t('reflection.daysInFaith','dias com Deus')}`}</span>
        <span style={{color:'#76678e',fontSize:'.85rem'}}>{totalReflections} {t('reflection.entries','reflexões guardadas')}</span>
      </div>}
      <div style={{padding:'0 16px',marginBottom:28}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
          {guias.map((g,i)=>(
            <div key={i} onClick={()=>setActiveGuia(activeGuia===i?null:i)} style={{background:activeGuia===i?g.color:'white',borderRadius:16,padding:16,boxShadow:'0 2px 12px rgba(108,63,160,0.08)',border:activeGuia===i?'2px solid '+g.color:'2px solid #e8e0f5',cursor:'pointer',transition:'all 0.3s'}}>
              <div style={{fontSize:28,marginBottom:8}}>{g.icon}</div>
              <p style={{color:activeGuia===i?'white':g.color,fontWeight:800,margin:'0 0 4px',fontSize:'0.9rem'}}>{g.title}</p>
              <p style={{color:activeGuia===i?'rgba(255,255,255,0.85)':'#888',fontSize:'0.78rem',margin:0}}>{g.desc}</p>
              {activeGuia===i && <p style={{color:'white',fontSize:'0.88rem',marginTop:10,lineHeight:1.6,fontStyle:'italic',background:'rgba(255,255,255,0.15)',borderRadius:10,padding:'10px 12px'}}>✨ {REFLEXOES[g.key]?.[idx_guia] || g.desc}</p>}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'0 16px',marginBottom:20}}>
        <button onClick={startTimer} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:20,border:'2px solid #6C3FA0',background:timer?'#6C3FA0':'white',color:timer?'white':'#6C3FA0',cursor:'pointer',fontWeight:700,fontSize:'0.85rem'}}>
          {timer?`${Math.floor(timerSec/60)}:${String(timerSec%60).padStart(2,'0')}`:t('reflection.timerBtn','Pausa de 2 minutos')}
        </button>
      </div>
      <div style={{padding:'0 16px'}}>
        {questions.map((q,i)=>q.q&&(
          <div key={i} style={{marginBottom:24}} onClick={()=>setActiveQ(i)}>
            <div style={{background:'white',borderRadius:20,padding:24,boxShadow:'0 4px 20px rgba(108,63,160,0.08)',border:activeQ===i?'2px solid #6C3FA0':'2px solid #f0ebff'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#6C3FA0,#4A2270)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:'1rem',flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,background:'#f0ebff',borderRadius:20,height:6}}>
                  <div style={{background:'linear-gradient(135deg,#6C3FA0,#f0c040)',borderRadius:20,height:6,width:answers[i]?.trim()?'100%':'0%',transition:'width 0.5s'}}/>
                </div>
              </div>
              <p style={{color:'#1a0a3e',fontWeight:700,fontSize:'1rem',lineHeight:1.6,margin:'0 0 12px'}}>{q.q}</p>
              {q.verse&&<div style={{background:'linear-gradient(135deg,#f8f0ff,#ede0ff)',borderRadius:12,padding:'10px 14px',marginBottom:14,borderLeft:'3px solid #6C3FA0'}}><p style={{color:'#6C3FA0',fontSize:'0.82rem',fontStyle:'italic',margin:0}}>📖 {q.verse}</p></div>}
              <div style={{background:'#fffbf0',borderRadius:12,padding:'10px 14px',marginBottom:14,border:'1px solid rgba(240,192,64,0.3)'}}>
                <p style={{color:'#e67e22',fontSize:'0.78rem',fontWeight:700,margin:'0 0 2px'}}>💡 {t('reflection.tipLabel','Dica')}</p>
                <p style={{color:'#888',fontSize:'0.78rem',margin:0}}>{q.tip}</p>
              </div>
              <textarea className="rtextarea" rows={4} value={answers[i]} onChange={e=>{const a=[...answers];a[i]=e.target.value;setAnswers(a);}} placeholder={t('reflection.placeholder','Escreve a tua reflexao aqui...')}/>
              <button onClick={e=>{e.stopPropagation();const t2=[...touched];t2[i]=!t2[i];setTouched(t2);}} style={{marginTop:10,padding:'6px 14px',borderRadius:20,border:'none',background:touched[i]?'#e74c3c':'#f8f9ff',color:touched[i]?'white':'#aaa',cursor:'pointer',fontWeight:700,fontSize:'0.78rem'}}>
                {touched[i]?'❤️ '+t('reflection.touched','Tocou-me!'):t('reflection.touchedBtn','Isto tocou-me')}
              </button>
            </div>
          </div>
        ))}
      </div>
      {user&&(<div style={{padding:'0 16px',marginBottom:20}}>
        <div style={{background:'#fffaf0',border:'1px solid #f0d798',borderRadius:16,padding:16,marginBottom:12}}>
          <p style={{margin:'0 0 9px',color:'#6b4a00',fontWeight:800}}>🌱 {t('reflection.faithStepTitle','Meu pequeno passo de fé')}</p>
          <p style={{margin:'0 0 11px',color:'#856c32',fontSize:'.84rem'}}>{t('reflection.faithStepDesc','Escolha uma ação simples para viver hoje.')}</p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[t('reflection.stepPray','Orar por alguém'),t('reflection.stepCare','Enviar uma mensagem de carinho'),t('reflection.stepRead','Ler um capítulo da Bíblia')].map(step => <button key={step} onClick={()=>setFaithStep(step)} style={{border:'none',padding:'8px 10px',borderRadius:18,cursor:'pointer',fontWeight:700,fontSize:'.78rem',background:faithStep===step?'#e6a100':'#fff',color:faithStep===step?'white':'#6b4a00'}}>{faithStep===step?'✓ ':''}{step}</button>)}
          </div>
        </div>
        {saveError && <p style={{color:'#c0392b',fontWeight:700,textAlign:'center',fontSize:'.85rem'}}>{saveError}</p>}
        <button onClick={handleSave} style={{width:'100%',padding:14,borderRadius:14,border:'none',background:saved?'#27ae60':'linear-gradient(135deg,#6C3FA0,#4A2270)',color:'white',fontWeight:900,cursor:'pointer',fontSize:'1rem'}}>{saved?t('reflection.saved','Guardado!'):t('reflection.saveJournal','Guardar no diário espiritual')}</button>
      </div>)}
      <div style={{padding:'0 16px'}}>
        <div style={{background:'linear-gradient(135deg,#1a0a3e,#2d1054)',borderRadius:20,padding:28,textAlign:'center',color:'white'}}>
          <div style={{fontSize:48,marginBottom:12}}>🙏</div>
          <p style={{fontWeight:800,fontSize:'1.1rem',marginBottom:8}}>{t('reflection.prayerClose','Termine com uma oracao')}</p>
          <p style={{opacity:0.7,fontSize:'0.85rem',marginBottom:20}}>"Buscai o Senhor enquanto pode ser achado" - Isaias 55:6</p>
          <button onClick={()=>setShowPrayer(value=>!value)} style={{padding:'14px 32px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#f0c040,#e67e22)',color:'#1a0a3e',fontWeight:900,cursor:'pointer',fontSize:'1rem'}}>{t('reflection.prayerBtn','Fazer a minha oração')} 🙏</button>
          {showPrayer && <div style={{marginTop:18,textAlign:'left',background:'rgba(255,255,255,.12)',padding:16,borderRadius:14,lineHeight:1.7,fontStyle:'italic'}}>{prayer}</div>}
        </div>
      </div>
      <div style={{padding:'0 16px',marginTop:20}}>
        <div style={{background:'linear-gradient(135deg,#f8f0ff,#ede0ff)',borderRadius:20,padding:24,textAlign:'center',border:'2px solid #6C3FA0'}}>
          <p style={{color:'#6C3FA0',fontWeight:700,fontSize:'1rem',marginBottom:8}}>📖 {t('reflection.gameDesc','Quer aprofundar mais na Palavra de Deus?')}</p>
          <button onClick={()=>navigate('/desafio-biblico')} style={{padding:'14px 32px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#6C3FA0,#4A2270)',color:'white',fontWeight:900,cursor:'pointer',fontSize:'1rem',boxShadow:'0 4px 15px rgba(108,63,160,0.4)'}}>{t('reflection.gameBtn','Jogar Desafio Biblico')} 🎮</button>
        </div>
      </div>
    </div>
  );
}
