import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

const VERSES = [
  { ref: 'Mateus 4:1', text: 'Jesus foi levado pelo Espírito ao deserto para ser tentado.' },
  { ref: 'Joel 2:12', text: 'Convertei-vos a mim de todo o vosso coração, com jejum.' },
  { ref: 'Isaías 58:6', text: 'O jejum que escolhi é soltar os laços da impiedade.' },
  { ref: 'Mateus 6:17', text: 'Quando jejuares, unge a cabeça e lava o rosto.' },
  { ref: 'Daniel 10:3', text: 'Não comi manjar delicado, nem entrou carne na minha boca.' },
  { ref: 'Lucas 4:2', text: 'Durante quarenta dias foi tentado pelo diabo.' },
  { ref: 'Atos 13:2', text: 'Enquanto ministravam ao Senhor e jejuavam.' },
];

export default function Consecration() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totalConsecrations: 0, activeFasting: 0 });
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entering, setEntering] = useState(false);
  const [entered, setEntered] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionAnim, setActionAnim] = useState('');
  const [muralPosts, setMuralPosts] = useState([]);
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState('prayer');
  const [showForm, setShowForm] = useState(false);
  const [dayCount, setDayCount] = useState(1);
  const [flames, setFlames] = useState([]);
  const today = new Date().getDay();
  const verse = VERSES[today % VERSES.length];
  const dayActions = ['dayGuide_1','dayGuide_2','dayGuide_3','dayGuide_4','dayGuide_5','dayGuide_6','dayGuide_7'];
  const todayAction = dayActions[today % dayActions.length];

﻿  useEffect(() => {
    fetch(API+'/api/consecration/stats').then(r=>r.json()).then(d=>setStats(d)).catch(()=>{});
    const saved = localStorage.getItem('consecration_start');
    if (saved) {
      const days = Math.floor((Date.now() - parseInt(saved)) / 86400000) + 1;
      setDayCount(days);
    }
    const active = localStorage.getItem('consecration_active');
    if (active === 'true') { setIsActive(true); setEntered(true); }
    loadMural();
  }, []);

  const loadMural = () => {
    const saved = JSON.parse(localStorage.getItem('consecration_mural') || '[]');
    setMuralPosts(saved);
  };

  const handleEnter = async () => {
    if (!user) return alert(t('consecration.loginRequired','Faz login para consagrar!'));
    setEntering(true);
    setTimeout(async () => {
      setEntering(false);
      setEntered(true);
      setIsActive(true);
      localStorage.setItem('consecration_active', 'true');
      if (!localStorage.getItem('consecration_start')) {
        localStorage.setItem('consecration_start', Date.now().toString());
      }
      // Adicionar chama
      const newFlame = { id: Date.now(), name: user?.full_name?.split(' ')[0] || 'Anonimo', x: Math.random()*80+10 };
      setFlames(prev => [...prev.slice(-15), newFlame]);
      setActionMsg(t('consecration.flameMsg','A tua chama foi acesa 🔥'));
      setTimeout(() => setActionMsg(''), 4000);
      try {
        await fetch(API+'/api/consecration/toggle', { method:'POST', headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'} });
        fetch(API+'/api/consecration/stats').then(r=>r.json()).then(d=>setStats(d)).catch(()=>{});
      } catch(e){}
    }, 2500);
  };

  const handleExit = async () => {
    setIsActive(false); setEntered(false);
    localStorage.setItem('consecration_active', 'false');
    setTimeout(()=>alert(t('consecration.comeBack','Volta amanha Dia {{day}}').replace('{{day}}',dayCount+1)),500);
    try {
      await fetch(API+'/api/consecration/toggle', { method:'DELETE', headers:{'Authorization':'Bearer '+token} });
      fetch(API+'/api/consecration/stats').then(r=>r.json()).then(d=>setStats(d)).catch(()=>{});
    } catch(e){}
  };

  const [prayCount, setPrayCount] = React.useState(()=>parseInt(localStorage.getItem('pray_today')||'0'));
  const handleAction = (key) => {
    setActionAnim(key);
    const nc = prayCount+1; setPrayCount(nc); localStorage.setItem('pray_today',nc);
    setActionMsg(t('consecration.actionAdded','+1 alma orando contigo!'));
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => { setActionMsg(''); setActionAnim(''); }, 3000);
  };

  const handlePost = () => {
    if (!postText.trim()) return;
    const saved = JSON.parse(localStorage.getItem('consecration_mural') || '[]');
    const newPost = { id: Date.now(), text: postText, type: postType, author: user?.full_name || 'Anonimo', avatar: user?.photo_url||user?.avatar_url||'', date: new Date().toLocaleDateString(), reactions: { praying:0, strength:0, amen:0, peace:0 } };
    saved.unshift(newPost);
    const updated = saved.slice(0,30);
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

﻿  // MODO SILENCIOSO
  if (silentMode) return (
    <div style={{minHeight:'100vh',backgroundImage:'url(/fundo-consagracao.png)',backgroundSize:'cover',backgroundPosition:'center',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',textAlign:'center',padding:24}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)'}}/>
      <div style={{position:'relative',zIndex:1}}>
        <div style={{fontSize:60,marginBottom:20}}>🕯️</div>
        <h2 style={{fontSize:24,fontWeight:900,marginBottom:8}}>🌙 {t('consecration.silentMode','Orar em Silencio')}</h2>
        <p style={{opacity:0.7,marginBottom:32,fontSize:14}}>{verse.text} — {verse.ref}</p>
        <div style={{fontSize:80,marginBottom:32,animation:'pulse 2s ease-in-out infinite'}}>🙏</div>
        <button onClick={()=>setSilentMode(false)} style={{padding:'12px 32px',borderRadius:20,border:'1px solid rgba(255,255,255,0.4)',background:'rgba(255,255,255,0.1)',color:'white',cursor:'pointer',fontWeight:700,fontSize:15}}>
          {t('consecration.silentBack','Voltar')}
        </button>
      </div>
    </div>
  );

  // ECRÃ DE ENTRADA
  if (entering) return (
    <div style={{minHeight:'100vh',backgroundImage:'url(/fundo-consagracao.png)',backgroundSize:'cover',backgroundPosition:'center',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',textAlign:'center',padding:24}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.75)',transition:'opacity 1s'}}/>
      <div style={{position:'relative',zIndex:1}}>
        <div style={{fontSize:60,marginBottom:20,animation:'fadeIn 1s ease'}}>🔥</div>
        <h2 style={{fontSize:22,fontWeight:900,marginBottom:12,animation:'fadeIn 1s ease 0.3s both'}}>{t('consecration.enterMsg','Estas a entrar num momento com Deus...')}</h2><p style={{fontSize:20,fontWeight:700,color:'#f0c040',margin:'8px 0',animation:'fadeIn 1s ease 0.5s both'}}>{t('consecration.notAlone','Tu nao estas sozinho.')}</p><p style={{fontSize:18,fontWeight:700,color:'white',margin:'4px 0',animation:'fadeIn 1s ease 0.7s both'}}>{t('consecration.godHere','Deus esta aqui.')}</p>
        <p style={{opacity:0.7,fontSize:14,fontStyle:'italic',animation:'fadeIn 1s ease 0.6s both'}}>{t('consecration.bibleRef','Como Jesus se retirou ao Deserto da Judeia...')}</p>
      </div>
    </div>
  );

  return (
    <div style={{maxWidth:700,margin:'0 auto',padding:'0.5rem',fontFamily:'Segoe UI,sans-serif'}}>
      <style>{`
        @keyframes flameRise{0%{transform:translateY(0) scale(1);opacity:0.8}50%{transform:translateY(-80px) scale(1.3);opacity:1}100%{transform:translateY(-160px) scale(0.6);opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
        @keyframes popIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
        .cons-btn{border:none;border-radius:20px;padding:12px 18px;cursor:pointer;font-weight:700;font-size:14px;transition:all 0.2s;color:white;}
        .cons-btn:hover{transform:scale(1.08);}
        .cons-btn:active{transform:scale(0.95);}
      `}</style>

      {/* HERO */}
      <div style={{position:'relative',width:'100%',height:'88vh',minHeight:500,maxHeight:720,overflow:'hidden',borderRadius:16,backgroundImage:'url(/fundo-consagracao.png)',backgroundSize:'cover',backgroundPosition:'center'}}>
        <div style={{position:'absolute',inset:0,background:isActive?'rgba(0,0,0,0.35)':'rgba(0,0,0,0.55)',borderRadius:16,transition:'background 1s'}}/>
        
        {/* CHAMAS */}
        {flames.map(f => (
          <div key={f.id} style={{position:'absolute',bottom:80,left:`${f.x}%`,textAlign:'center',animation:'flameRise 3s ease-out forwards',zIndex:3}}>
            <div style={{fontSize:32}}>🔥</div>
            <div style={{fontSize:10,color:'#f0c040',fontWeight:700,whiteSpace:'nowrap'}}>{f.name}</div>
          </div>
        ))}

        <div style={{position:'relative',zIndex:2,height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',padding:'20px 16px'}}>
          
          {/* TOPO */}
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
            <p style={{color:'rgba(255,255,255,0.8)',fontSize:13,margin:'0 0 8px'}}>{t('consecration.subtitle','Jejum e oracao - fortaleça sua fe')}</p>
            <p style={{color:'rgba(255,255,255,0.6)',fontSize:12,fontStyle:'italic',margin:0}}>{t('consecration.bibleRef','Como Jesus se retirou ao Deserto...')}</p>
            {isActive && <div style={{marginTop:8,background:'rgba(240,192,64,0.2)',border:'1px solid #f0c040',borderRadius:12,padding:'5px 14px',fontSize:12,color:'#f0c040',fontWeight:700,display:'inline-block'}}>✨ Dia {dayCount} da consagracao</div>}
          </div>

          {/* CENTRO - ACOES */}
          <div style={{width:'100%',maxWidth:480,textAlign:'center'}}>
            {actionMsg && <div style={{color:'#f0c040',fontWeight:800,fontSize:15,marginBottom:12,animation:'popIn 0.3s ease'}}>{actionMsg}</div>}
            
            {entered && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:16}}>
                {[
                  {key:'prayBtn',def:'🙏 Orar',color:'#6C3FA0'},
                  {key:'consecBtn',def:'🔥 Consagrar',color:'#e74c3c'},
                  {key:'faithBtn',def:'✝ Fe',color:'#27ae60'},
                  {key:'familyBtn',def:'❤ Familia',color:'#e67e22'},
                ].map(btn => (
                  <button key={btn.key} className="cons-btn" onClick={()=>handleAction(btn.key)}
                    style={{background:actionAnim===btn.key?'white':btn.color,color:actionAnim===btn.key?btn.color:'white',boxShadow:  4px 15px 55,animation:actionAnim===btn.key?'popIn 0.3s ease':undefined}}>
                    {t(consecration., btn.def)}
                  </button>
                ))}
              </div>
            )}

            {!entered ? (
              <button onClick={handleEnter} style={{width:'100%',padding:'18px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#f0c040,#e67e22)',color:'#1a0a3e',fontWeight:900,cursor:'pointer',fontSize:16,boxShadow:'0 8px 25px rgba(240,192,64,0.5)',animation:'pulse 2s ease-in-out infinite'}}>
                {t('consecration.enterDesert','🏔 Entrar na Consagracao')}
              </button>
            ) : (
              <button onClick={handleExit} style={{width:'100%',padding:'14px',borderRadius:14,border:'1px solid rgba(255,255,255,0.3)',background:'rgba(231,76,60,0.3)',color:'white',fontWeight:700,cursor:'pointer',fontSize:14}}>
                {t('consecration.endFasting','Terminar Jejum')}
              </button>
            )}
          </div>

          {/* RODAPE */}
          <div style={{display:'flex',gap:10,width:'100%',justifyContent:'center'}}>
            <button onClick={()=>setSilentMode(true)} style={{padding:'10px 20px',borderRadius:12,border:'1px solid rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.1)',backdropFilter:'blur(8px)',color:'white',cursor:'pointer',fontWeight:700,fontSize:13}}>
              🌙 {t('consecration.silentMode','Silencio')}
            </button>
            <button onClick={()=>setShowForm(!showForm)} style={{padding:'10px 20px',borderRadius:12,border:'1px solid rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.1)',backdropFilter:'blur(8px)',color:'white',cursor:'pointer',fontWeight:700,fontSize:13}}>
              📝 {t('consecration.postBtn','Publicar')}
            </button>
          </div>
        </div>
      </div>

﻿      {/* GUIA DIARIO */}
      <div style={{background:'linear-gradient(135deg,#1a0a3e,#2d1054)',borderRadius:16,padding:20,marginTop:16,color:'white',border:'1px solid rgba(240,192,64,0.3)'}}>
        <h3 style={{color:'#f0c040',fontWeight:800,fontSize:16,margin:'0 0 12px'}}>📖 {t('consecration.dailyTitle','Guia do Dia')} — {new Date().toLocaleDateString()}</h3>
        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:12,padding:'12px 16px',marginBottom:12,borderLeft:'3px solid #f0c040'}}>
          <p style={{color:'rgba(255,255,255,0.7)',fontSize:12,fontStyle:'italic',margin:'0 0 4px'}}>📖 {verse.ref}</p>
          <p style={{color:'white',fontSize:14,margin:0,lineHeight:1.5}}>{verse.text}</p>
        </div>
        <div style={{background:'rgba(240,192,64,0.1)',borderRadius:12,padding:'10px 16px',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:24}}>✨</span>
          <div>
            <p style={{color:'#f0c040',fontWeight:700,fontSize:12,margin:'0 0 2px'}}>{t('consecration.dailyAction','Acao de hoje')}</p>
            <p style={{color:'white',fontSize:14,margin:0}}>{t(consecration.,'Ora pela tua familia')}</p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      {showForm && (
        <div style={{background:'linear-gradient(135deg,#1a0a3e,#2d1054)',borderRadius:16,padding:20,marginTop:12,color:'white'}}>
          <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
            {['prayer','testimony','reflection'].map(type => (
              <button key={type} onClick={()=>setPostType(type)} style={{padding:'6px 14px',borderRadius:20,border:'none',background:postType===type?'#f0c040':'rgba(255,255,255,0.15)',color:postType===type?'#1a0a3e':'white',fontWeight:700,cursor:'pointer',fontSize:12}}>
                {t(consecration.type_,type)}
              </button>
            ))}
          </div>
          <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder={t('consecration.postPlaceholder','Partilha o que Deus esta a fazer em ti...')} style={{width:'100%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:12,padding:12,color:'white',fontSize:14,resize:'none',outline:'none',boxSizing:'border-box'}} rows={3}/>
          <button onClick={handlePost} style={{marginTop:10,width:'100%',padding:12,borderRadius:12,border:'none',background:'linear-gradient(135deg,#f0c040,#e67e22)',color:'#1a0a3e',fontWeight:900,cursor:'pointer',fontSize:15}}>
            {t('consecration.postBtn','Publicar')} 🙏
          </button>
        </div>
      )}

      {/* MURAL */}
      <div style={{marginTop:16,marginBottom:40}}>
        <h3 style={{color:'white',fontWeight:800,fontSize:18,margin:'0 0 16px',textAlign:'center'}}>{t('consecration.muralTitle','🕊 Mural Espiritual')}</h3>
        {muralPosts.length === 0 ? (
          <div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.5)',background:'rgba(255,255,255,0.05)',borderRadius:16,border:'1px solid rgba(255,255,255,0.1)'}}>
            <div style={{fontSize:40,marginBottom:12}}>🕊️</div>
            <p>{t('consecration.muralEmpty','Se o primeiro a partilhar algo espiritual!')}</p>
          </div>
        ) : muralPosts.map((post,i) => (
          <div key={post.id} style={{background:'rgba(255,255,255,0.07)',backdropFilter:'blur(8px)',borderRadius:16,padding:16,marginBottom:12,border:'1px solid rgba(255,255,255,0.1)',animation:'fadeIn 0.4s ease',animationDelay:${i*0.05}s}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              {post.avatar?<img src={post.avatar} style={{width:36,height:36,borderRadius:'50%',objectFit:'cover'}}/>:<div style={{width:36,height:36,borderRadius:'50%',background:'#6C3FA0',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,flexShrink:0}}>{post.author?.charAt(0)||'?'}</div>}
              <div>
                <p style={{color:'white',fontWeight:700,margin:0,fontSize:14}}>{post.author}</p>
                <p style={{color:'rgba(255,255,255,0.4)',margin:0,fontSize:11}}>{post.date} • {t(consecration.type_,post.type)}</p>
              </div>
            </div>
            <p style={{color:'rgba(255,255,255,0.9)',fontSize:14,lineHeight:1.6,margin:'0 0 12px'}}>{post.text}</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {[
                {key:'praying',label:t('consecration.prayingFor','🙏 Orando')},
                {key:'strength',label:t('consecration.strengthFor','🔥 Forca')},
                {key:'amen',label:t('consecration.amenFor','✝ Amem')},
                {key:'peace',label:t('consecration.peaceFor','🕊 Paz')},
              ].map(r => (
                <button key={r.key} onClick={()=>handleReaction(post.id,r.key)} style={{padding:'5px 12px',borderRadius:20,border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.08)',color:'white',cursor:'pointer',fontSize:12,fontWeight:600,transition:'all 0.2s'}}>
                  {r.label} {post.reactions[r.key]>0?():'' }
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
