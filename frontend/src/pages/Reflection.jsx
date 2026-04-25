import React, { useState, useRef } from 'react';
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
  const timerRef = useRef(null);
  const days = t('reflection.days', { returnObjects: true }) || [];
  const currentDay = Array.isArray(days) ? days[selDay] : {};
  const questions = currentDay ? [
    { q: currentDay.q1, verse: currentDay.q1verse, tip: t('reflection.tip1','Pense em momentos onde Deus falou contigo') },
    { q: currentDay.q2, verse: currentDay.q2verse, tip: t('reflection.tip2','Recorda situacoes da ultima semana') },
    { q: currentDay.q3, verse: currentDay.q3verse, tip: t('reflection.tip3','Reflite sobre as tuas emocoes') },
  ] : [];
  const guias = [
    { icon:'🔍', title:t('reflection.guidTitle1','Busque a Deus'), desc:t('reflection.guidDesc1','Reserve este momento so para Ele'), color:'#6C3FA0' },
    { icon:'💬', title:t('reflection.guidTitle2','Seja honesto'), desc:t('reflection.guidDesc2','Deus conhece o seu coracao'), color:'#e67e22' },
    { icon:'🌱', title:t('reflection.guidTitle3','Cresca na fe'), desc:t('reflection.guidDesc3','Reflita profundamente'), color:'#27ae60' },
    { icon:'✨', title:t('reflection.guidTitle4','Coloque em pratica'), desc:t('reflection.guidDesc4','Aplique no seu dia'), color:'#3498db' },
  ];
  const startTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; setTimer(false); setTimerSec(120); return; }
    setTimerSec(120); setTimer(true);
    timerRef.current = setInterval(() => {
      setTimerSec(prev => { if(prev<=1){ clearInterval(timerRef.current); timerRef.current=null; setTimer(false); return 120; } return prev-1; });
    }, 1000);
  };
  const handleSave = async () => {
    if(!user) return;
    try { await fetch(API+'/api/reflection', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({answers,day:selDay,lang}) }); } catch(e){}
    setSaved(true); setTimeout(()=>setSaved(false), 3000);
  };
  const progress = answers.filter(a=>a.trim().length>0).length;

﻿  return (
    <div style={{maxWidth:720,margin:'0 auto',padding:'0 0 80px',fontFamily:'Segoe UI,sans-serif'}}>
      <style>{'.rtextarea{width:100%;border:2px solid #e8e0f5;border-radius:14px;padding:14px 16px;font-size:.95rem;resize:none;outline:none;transition:border 0.2s;box-sizing:border-box;background:#fdfaff;color:#1a0a3e}.rtextarea:focus{border-color:#6C3FA0;background:white}'}</style>
      <div style={{background:'linear-gradient(135deg,#6C3FA0,#4A2270,#2d0a5e)',padding:'36px 24px 28px',borderRadius:'0 0 32px 32px',marginBottom:28,color:'white',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,right:0,fontSize:120,opacity:0.07,lineHeight:1}}>🕊️</div>
        <div style={{position:'relative',zIndex:1}}>
          <p style={{margin:'0 0 6px',fontSize:'0.8rem',opacity:0.7,letterSpacing:2,textTransform:'uppercase'}}>✨ {t('reflection.subtitle','Alguns minutos com Deus')}</p>
          <h1 style={{margin:'0 0 16px',fontSize:'clamp(1.4rem,4vw,2rem)',fontWeight:900}}>{t('reflection.title','Reflexao com Deus')}</h1>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
            {(DAY_NAMES[lang]||DAY_NAMES.pt).map((d,i)=>(
              <button key={i} onClick={()=>{setSelDay(i);setAnswers(['','','']);}} style={{padding:'6px 12px',borderRadius:20,border:'none',background:selDay===i?'white':'rgba(255,255,255,0.15)',color:selDay===i?'#6C3FA0':'white',fontWeight:700,cursor:'pointer',fontSize:'0.75rem'}}>{d}</button>
            ))}
          </div>
          <div style={{background:'rgba(255,255,255,0.2)',borderRadius:20,height:8,marginBottom:8}}>
            <div style={{background:'#f0c040',borderRadius:20,height:8,width:+""+${(progress/3)*100}%+""+,transition:'width 0.5s'}}/>
          </div>
          <p style={{margin:0,fontSize:'0.8rem',opacity:0.8}}>{progress}/3 {t('reflection.rotateNote','perguntas respondidas')}</p>
        </div>
      </div>
      <div style={{padding:'0 16px',marginBottom:28}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
          {guias.map((g,i)=>(
            <div key={i} style={{background:'white',borderRadius:16,padding:16,boxShadow:'0 2px 12px rgba(108,63,160,0.08)',border:+""+2px solid 22+""+}}>
              <div style={{fontSize:28,marginBottom:8}}>{g.icon}</div>
              <p style={{color:g.color,fontWeight:800,margin:'0 0 4px',fontSize:'0.9rem'}}>{g.title}</p>
              <p style={{color:'#888',fontSize:'0.78rem',margin:0}}>{g.desc}</p>
            </div>
          ))}
        </div>
      </div>

﻿      <div style={{padding:'0 16px',marginBottom:20}}>
        <button onClick={startTimer} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:20,border:'2px solid #6C3FA0',background:timer?'#6C3FA0':'white',color:timer?'white':'#6C3FA0',cursor:'pointer',fontWeight:700,fontSize:'0.85rem'}}>
          {timer?+""+${Math.floor(timerSec/60)}: - +""+:t('reflection.timerBtn','Pausa de 2 minutos')}
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
      {user&&(<div style={{padding:'0 16px',marginBottom:20}}><button onClick={handleSave} style={{width:'100%',padding:14,borderRadius:14,border:'none',background:saved?'#27ae60':'linear-gradient(135deg,#6C3FA0,#4A2270)',color:'white',fontWeight:900,cursor:'pointer',fontSize:'1rem'}}>{saved?t('reflection.saved','Guardado!'):t('reflection.saveJournal','Guardar no diario espiritual')}</button></div>)}
      <div style={{padding:'0 16px'}}>
        <div style={{background:'linear-gradient(135deg,#1a0a3e,#2d1054)',borderRadius:20,padding:28,textAlign:'center',color:'white'}}>
          <div style={{fontSize:48,marginBottom:12}}>🙏</div>
          <p style={{fontWeight:800,fontSize:'1.1rem',marginBottom:8}}>{t('reflection.prayerClose','Termine com uma oracao')}</p>
          <p style={{opacity:0.7,fontSize:'0.85rem',marginBottom:20}}>"Buscai o Senhor enquanto pode ser achado" - Isaias 55:6</p>
          <button onClick={()=>navigate('/pedidos-ajuda')} style={{padding:'14px 32px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#f0c040,#e67e22)',color:'#1a0a3e',fontWeight:900,cursor:'pointer',fontSize:'1rem'}}>{t('reflection.prayerBtn','Fazer a minha oracao')} 🙏</button>
        </div>
      </div>
    </div>
  );
}
