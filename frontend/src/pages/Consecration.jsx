import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

const VERSES = [
  { ref: 'Mateus 4:1', text: 'Jesus foi levado pelo Espirito ao deserto.' },
  { ref: 'Joel 2:12', text: 'Convertei-vos a mim de todo o coracao, com jejum.' },
  { ref: 'Isaias 58:6', text: 'O jejum que escolhi e soltar os lacos da impiedade.' },
  { ref: 'Mateus 6:17', text: 'Quando jejuares, unge a cabeca e lava o rosto.' },
  { ref: 'Daniel 10:3', text: 'Nao comi manjar delicado, nem entrou carne na minha boca.' },
  { ref: 'Lucas 4:2', text: 'Durante quarenta dias foi tentado pelo diabo.' },
  { ref: 'Atos 13:2', text: 'Enquanto ministravam ao Senhor e jejuavam.' },
];

const ACTIONS = ['dayGuide_1','dayGuide_2','dayGuide_3','dayGuide_4','dayGuide_5','dayGuide_6','dayGuide_7'];

export default function Consecration() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totalConsecrations:0, activeFasting:0 });
  const [isActive, setIsActive] = useState(false);
  const [entering, setEntering] = useState(false);
  const [entered, setEntered] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [muralPosts, setMuralPosts] = useState([]);
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState('prayer');
  const [showForm, setShowForm] = useState(false);
  const [dayCount, setDayCount] = useState(1);
  const [prayCount, setPrayCount] = useState(()=>{
    const today = new Date().toDateString();
    if (localStorage.getItem('pray_date') !== today) {
      localStorage.setItem('pray_date', today);
      localStorage.setItem('pray_today', '0');
      return 0;
    }
    return parseInt(localStorage.getItem('pray_today')||'0');
  });
  const [timerSec, setTimerSec] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);
  const today = new Date().getDay();
  const verse = VERSES[today % VERSES.length];
  const todayAction = ACTIONS[today % ACTIONS.length];
  const flameIcon = dayCount >= 21 ? '🔥🔥🔥' : dayCount >= 7 ? '🔥🔥' : dayCount >= 3 ? '🔥' : '🕯️';

﻿  useEffect(() => {
    fetch(API+'/api/consecration/stats').then(r=>r.json()).then(d=>setStats(d)).catch(()=>{});
    const saved = localStorage.getItem('consecration_start');
    if (saved) {
      const days = Math.floor((Date.now() - parseInt(saved)) / 86400000) + 1;
      setDayCount(days);
    }
    const active = localStorage.getItem('consecration_active');
    if (active === 'true') { setIsActive(true); setEntered(true); }
    const pc = parseInt(localStorage.getItem('pray_today') || '0');
    setPrayCount(pc);
    const mural = JSON.parse(localStorage.getItem('consecration_mural') || '[]');
    setMuralPosts(mural);
  }, []);

  const handleEnter = async () => {
    if (!user) return alert('Faz login para consagrar!');
    setEntering(true);
    setTimeout(async () => {
      setEntering(false);
      setEntered(true);
      setIsActive(true);
      localStorage.setItem('consecration_active', 'true');
      if (!localStorage.getItem('consecration_start')) {
        localStorage.setItem('consecration_start', Date.now().toString());
      }
      try {
        await fetch(API+'/api/consecration/toggle', { method:'POST', headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'} });
        fetch(API+'/api/consecration/stats').then(r=>r.json()).then(d=>setStats(d)).catch(()=>{});
      } catch(e){}
    }, 2500);
  };

  const handleExit = async () => {
    setIsActive(false); setEntered(false);
    localStorage.setItem('consecration_active', 'false');
    setTimeout(()=>alert(t('consecration.comeBack','Volta amanha Dia {{day}}').replace('{{day}}', dayCount+1)), 300);
    try {
      await fetch(API+'/api/consecration/toggle', { method:'DELETE', headers:{'Authorization':'Bearer '+token} });
      fetch(API+'/api/consecration/stats').then(r=>r.json()).then(d=>setStats(d)).catch(()=>{});
    } catch(e){}
  };

  const handleAction = () => {
    const nc = prayCount + 1;
    setPrayCount(nc);
    localStorage.setItem('pray_today', nc);
    setActionMsg(t('consecration.actionAdded', '+1 alma orando contigo!'));
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handlePost = () => {
    if (!postText.trim()) return;
    const saved = JSON.parse(localStorage.getItem('consecration_mural') || '[]');
    const newPost = { id: Date.now(), text: postText, type: postType, author: user?.full_name || 'Anonimo', avatar: user?.photo_url||user?.avatar_url||'', date: new Date().toLocaleDateString(), reactions: { praying:0, strength:0, amen:0, peace:0 } };
    saved.unshift(newPost);
    const updated = saved.slice(0, 30);
    localStorage.setItem('consecration_mural', JSON.stringify(updated));
    setMuralPosts(updated);
    setPostText(''); setShowForm(false);
  };

  const handleReaction = (postId, reaction) => {
    const saved = JSON.parse(localStorage.getItem('consecration_mural') || '[]');
    const updated = saved.map(p => p.id === postId ? {...p, reactions:{...p.reactions,[reaction]:(p.reactions[reaction]||0)+1}} : p);
    localStorage.setItem('consecration_mural', JSON.stringify(updated));
    setMuralPosts(updated);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const startTimer = (min) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSec(min * 60);
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimerSec(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setTimerActive(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

﻿  if (silentMode) return (
    <div style={{position:'fixed',inset:0,backgroundImage:'url(/fundo-consagracao.png)',backgroundSize:'cover',backgroundPosition:'center',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',textAlign:'center',padding:24,zIndex:100}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.75)'}}/>
      <div style={{position:'relative',zIndex:1}}>
        <div style={{fontSize:60,marginBottom:16}}>🕯️</div>
        <h2 style={{fontSize:22,fontWeight:900,marginBottom:8,color:'white'}}>🌙 {t('consecration.silentMode','Orar em Silencio')}</h2>
        <p style={{opacity:0.7,marginBottom:24,fontSize:14,fontStyle:'italic'}}>{verse.text} — {verse.ref}</p>
        <div style={{background:'rgba(255,255,255,0.1)',borderRadius:16,padding:'16px 32px',marginBottom:24}}>
          <p style={{color:'#f0c040',fontWeight:700,margin:'0 0 8px',fontSize:14}}>{t('consecration.timerTitle','Tempo de Oracao')}</p>
          <p style={{fontSize:40,fontWeight:900,margin:'0 0 12px',color:'white'}}>{Math.floor(timerSec/60).toString().padStart(2,'0')}:{(timerSec%60).toString().padStart(2,'0')}</p>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            {[5,10,15].map(min=>(
              <button key={min} onClick={()=>startTimer(min)} style={{padding:'8px 16px',borderRadius:20,border:'none',background:timerActive?'rgba(255,255,255,0.1)':'rgba(240,192,64,0.8)',color:'white',cursor:'pointer',fontWeight:700,fontSize:14}}>{min}min</button>
            ))}
          </div>
        </div>
        <div style={{fontSize:70,marginBottom:24}}>🙏</div>
        <button onClick={()=>{setSilentMode(false);if(timerRef.current)clearInterval(timerRef.current);}} style={{padding:'12px 32px',borderRadius:20,border:'1px solid rgba(255,255,255,0.4)',background:'rgba(255,255,255,0.1)',color:'white',cursor:'pointer',fontWeight:700,fontSize:15}}>
          {t('consecration.silentBack','Voltar')}
        </button>
      </div>
    </div>
  );

  if (entering) return (
    <div style={{position:'fixed',inset:0,backgroundImage:'url(/fundo-consagracao.png)',backgroundSize:'cover',backgroundPosition:'center',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',textAlign:'center',padding:24,zIndex:100}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.8)'}}/>
      <div style={{position:'relative',zIndex:1}}>
        <div style={{fontSize:60,marginBottom:16}}>🔥</div>
        <h2 style={{fontSize:22,fontWeight:900,marginBottom:16,color:'white'}}>{t('consecration.enterMsg','Estas a entrar num momento com Deus...')}</h2>
        <p style={{fontSize:20,fontWeight:700,color:'#f0c040',margin:'0 0 8px'}}>{t('consecration.notAlone','Tu nao estas sozinho.')}</p>
        <p style={{fontSize:18,fontWeight:700,color:'white',margin:'0 0 16px'}}>{t('consecration.godHere','Deus esta aqui.')}</p>
        <p style={{opacity:0.6,fontSize:13,fontStyle:'italic'}}>{t('consecration.bibleRef','Como Jesus se retirou ao Deserto da Judeia...')}</p>
      </div>
    </div>
  );

﻿  return (
    <div style={{maxWidth:700,margin:'0 auto',padding:'0.5rem',fontFamily:'Segoe UI,sans-serif'}}>
      <div style={{position:'relative',width:'100%',minHeight:'92vh',borderRadius:16,overflow:'hidden',backgroundImage:'url(/fundo-consagracao.png)',backgroundSize:'cover',backgroundPosition:'center'}}>
        <div style={{position:'absolute',inset:0,background:isActive?'rgba(0,0,0,0.3)':'rgba(0,0,0,0.55)',borderRadius:16,transition:'background 1s'}}/>
        <div style={{position:'relative',zIndex:2,height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',padding:'20px 16px'}}>
          <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{position:'absolute',top:12,left:12,padding:'8px 16px',borderRadius:20,border:'none',background:'rgba(0,0,0,0.5)',color:'white',cursor:'pointer',fontWeight:700,fontSize:13,backdropFilter:'blur(8px)',zIndex:10}}>⬆️ Topo</button>

          <div style={{textAlign:'center',color:'white',width:'100%'}}>
            <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:12,flexWrap:'wrap'}}>
              <div style={{background:'rgba(255,255,255,0.12)',backdropFilter:'blur(8px)',borderRadius:20,padding:'6px 14px',fontSize:12,color:'white',fontWeight:700}}>
                🔥 {stats.activeFasting||0} {t('consecration.fastingLabel','almas em jejum agora')}
              </div>
              <div style={{background:'rgba(255,255,255,0.12)',backdropFilter:'blur(8px)',borderRadius:20,padding:'6px 14px',fontSize:12,color:'white',fontWeight:700}}>
                🙏 {stats.totalConsecrations||0} {t('consecration.soulsNow','almas buscando a Deus agora')}
              </div>
            </div>
            <h1 style={{fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'white',margin:'0 0 6px',textShadow:'0 2px 8px rgba(0,0,0,0.5)'}}>{t('consecration.title','Consagracao')}</h1>
            <p style={{color:'rgba(255,255,255,0.8)',fontSize:13,margin:'0 0 6px'}}>{t('consecration.subtitle','Jejum e oracao')}</p>
            <p style={{color:'rgba(255,255,255,0.55)',fontSize:12,fontStyle:'italic',margin:0}}>{t('consecration.bibleRef','Como Jesus se retirou ao Deserto...')}</p>
            {isActive && <div style={{marginTop:8,background:'rgba(240,192,64,0.2)',border:'1px solid #f0c040',borderRadius:12,padding:'5px 14px',fontSize:12,color:'#f0c040',fontWeight:700,display:'inline-block'}}>
              {flameIcon} Dia {dayCount} • {prayCount} {t('consecration.prayingFor','oracoes hoje')}
            </div>}
          </div>

          <div style={{width:'100%',maxWidth:480,textAlign:'center'}}>
            {actionMsg && <div style={{color:'#f0c040',fontWeight:800,fontSize:15,marginBottom:12}}>{actionMsg}</div>}
            {entered && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:14}}>
                {[
                  {key:'prayBtn',def:'🙏 Orar',color:'#6C3FA0'},
                  {key:'consecBtn',def:'🔥 Consagrar',color:'#e74c3c'},
                  {key:'faithBtn',def:'✝ Fe',color:'#27ae60'},
                  {key:'familyBtn',def:'❤ Familia',color:'#e67e22'},
                ].map(btn=>(
                  <button key={btn.key} onClick={handleAction} style={{border:'none',borderRadius:20,padding:'12px 18px',cursor:'pointer',fontWeight:700,fontSize:14,color:'white',background:btn.color,boxShadow:'0 4px 15px rgba(0,0,0,0.3)',transition:'transform 0.2s'}}
                    onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                    onMouseLeave={e=>e.target.style.transform='scale(1)'}>
                    {t('consecration.'+btn.key, btn.def)}
                  </button>
                ))}
              </div>
            )}
            {!entered ? (
              <button onClick={handleEnter} style={{width:'100%',padding:'18px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#f0c040,#e67e22)',color:'#1a0a3e',fontWeight:900,cursor:'pointer',fontSize:16,boxShadow:'0 8px 25px rgba(240,192,64,0.4)'}}>
                {t('consecration.enterDesert','🏔 Entrar na Consagracao')}
              </button>
            ) : (
              <button onClick={handleExit} style={{width:'100%',padding:'14px',borderRadius:14,border:'1px solid rgba(255,255,255,0.3)',background:'rgba(231,76,60,0.3)',color:'white',fontWeight:700,cursor:'pointer',fontSize:14}}>
                {t('consecration.endFasting','Terminar Jejum')}
              </button>
            )}
          </div>

          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <button onClick={()=>setSilentMode(true)} style={{padding:'10px 20px',borderRadius:12,border:'1px solid rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.1)',backdropFilter:'blur(8px)',color:'white',cursor:'pointer',fontWeight:700,fontSize:13}}>
              🌙 {t('consecration.silentMode','Silencio')}
            </button>
            <button onClick={()=>setShowForm(!showForm)} style={{padding:'10px 20px',borderRadius:12,border:'1px solid rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.1)',backdropFilter:'blur(8px)',color:'white',cursor:'pointer',fontWeight:700,fontSize:13}}>
              📝 {t('consecration.postBtn','Publicar')}
            </button>
          </div>
        </div>
      </div>

﻿      <div style={{background:'linear-gradient(135deg,#1a0a3e,#2d1054)',borderRadius:16,padding:20,marginTop:16,color:'white',border:'1px solid rgba(240,192,64,0.3)'}}>
        <h3 style={{color:'#f0c040',fontWeight:800,fontSize:16,margin:'0 0 12px'}}>📖 {t('consecration.dailyTitle','Guia do Dia')}</h3>
        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:12,padding:'12px 16px',marginBottom:12,borderLeft:'3px solid #f0c040'}}>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:12,fontStyle:'italic',margin:'0 0 4px'}}>📖 {verse.ref}</p>
          <p style={{color:'white',fontSize:14,margin:0,lineHeight:1.5}}>{verse.text}</p>
        </div>
        <div style={{background:'rgba(240,192,64,0.1)',borderRadius:12,padding:'10px 16px',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:24}}>✨</span>
          <div>
            <p style={{color:'#f0c040',fontWeight:700,fontSize:12,margin:'0 0 2px'}}>{t('consecration.dailyAction','Acao de hoje')}</p>
            <p style={{color:'white',fontSize:14,margin:0}}>{t('consecration.'+todayAction,'Ora pela tua familia')}</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div style={{background:'linear-gradient(135deg,#1a0a3e,#2d1054)',borderRadius:16,padding:20,marginTop:12,color:'white'}}>
          <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
            {['prayer','testimony','reflection'].map(type=>(
              <button key={type} onClick={()=>setPostType(type)} style={{padding:'6px 14px',borderRadius:20,border:'none',background:postType===type?'#f0c040':'rgba(255,255,255,0.15)',color:postType===type?'#1a0a3e':'white',fontWeight:700,cursor:'pointer',fontSize:12}}>
                {t('consecration.type_'+type, type)}
              </button>
            ))}
          </div>
          <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder={t('consecration.postPlaceholder','Partilha o que Deus esta a fazer em ti...')} style={{width:'100%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:12,padding:12,color:'white',fontSize:14,resize:'none',outline:'none',boxSizing:'border-box'}} rows={3}/>
          <button onClick={handlePost} style={{marginTop:10,width:'100%',padding:12,borderRadius:12,border:'none',background:'linear-gradient(135deg,#f0c040,#e67e22)',color:'#1a0a3e',fontWeight:900,cursor:'pointer',fontSize:15}}>
            {t('consecration.postBtn','Publicar')} 🙏
          </button>
        </div>
      )}

      <div style={{marginTop:16,marginBottom:40}}>
        <h3 style={{color:'white',fontWeight:800,fontSize:18,margin:'0 0 16px',textAlign:'center'}}>{t('consecration.muralTitle','🕊 Mural Espiritual')}</h3>
        {muralPosts.length===0 ? (
          <div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.5)',background:'rgba(255,255,255,0.05)',borderRadius:16,border:'1px solid rgba(255,255,255,0.1)'}}>
            <div style={{fontSize:40,marginBottom:12}}>🕊️</div>
            <p>{t('consecration.muralEmpty','Se o primeiro a partilhar algo espiritual!')}</p>
          </div>
        ) : muralPosts.map(post=>(
          <div key={post.id} style={{background:'rgba(255,255,255,0.07)',borderRadius:16,padding:16,marginBottom:12,border:'1px solid rgba(255,255,255,0.1)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              {post.avatar?<img src={post.avatar} style={{width:36,height:36,borderRadius:'50%',objectFit:'cover'}}/>:<div style={{width:36,height:36,borderRadius:'50%',background:'#6C3FA0',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,flexShrink:0}}>{post.author?.charAt(0)||'?'}</div>}
              <div>
                <p style={{color:'white',fontWeight:700,margin:0,fontSize:14}}>{post.author}</p>
                <p style={{color:'rgba(255,255,255,0.4)',margin:0,fontSize:11}}>{post.date} • {t('consecration.type_'+post.type,post.type)}</p>
              </div>
            </div>
            <p style={{color:'rgba(255,255,255,0.9)',fontSize:14,lineHeight:1.6,margin:'0 0 12px'}}>{post.text}</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {[{key:'praying',label:t('consecration.prayingFor','🙏 Orando')},{key:'strength',label:t('consecration.strengthFor','🔥 Forca')},{key:'amen',label:t('consecration.amenFor','✝ Amem')},{key:'peace',label:t('consecration.peaceFor','🕊 Paz')}].map(r=>(
                <button key={r.key} onClick={()=>handleReaction(post.id,r.key)} style={{padding:'5px 12px',borderRadius:20,border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.08)',color:'white',cursor:'pointer',fontSize:12,fontWeight:600}}>
                  {r.label} {post.reactions[r.key]>0?'('+post.reactions[r.key]+')':''}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
