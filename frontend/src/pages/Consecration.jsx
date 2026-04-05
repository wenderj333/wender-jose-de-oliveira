import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Flame, ChevronDown, ChevronUp } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

function FireScene() {
  const { user } = useAuth();
  const [flames, setFlames] = useState([]);

  function addUserFlame(name) {
    const newFlame = {
      id: Date.now(),
      name,
      x: Math.random() * 90,
      delay: Math.random() * 2,
      day: 0
    };
    setFlames(prev => [...prev, newFlame]);
  }

  useEffect(() => {
    const userName = user?.full_name || user?.name || "Convidado";
    addUserFlame(userName);
  }, [user]);

  return (
    <div>
      {flames.map(f => (
        <div key={f.id}>{f.name}</div>
      ))}
    </div>
  );
}

export default function Consecration() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totalConsecrations: 0, activeFasting: 0 });
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPrayer, setShowPrayer] = useState(false);
  const [prayerText, setPrayerText] = useState('');
  const [prayerVis, setPrayerVis] = useState('public');
  const [prayerSent, setPrayerSent] = useState(false);

  useEffect(() => { fetchStats(); if(token) fetchStatus(); }, [token]);

  async function fetchStats() {
    try { const res = await fetch(API+'/consecration/stats'); if(res.ok){const d=await res.json();if(d&&!d.error)setStats(d);} } catch(e){}
    finally { setLoading(false); }
  }
  async function fetchStatus() {
    try { const res = await fetch(API+'/consecration/status',{headers:{Authorization:'Bearer '+token}}); if(res.ok){const d=await res.json();setIsActive(d.active);} } catch(e){}
  }

  function handleStartClick() {
    if(!user){alert(t('consecration.loginRequired'));return;}
    if(isActive){ doToggle(); } else { setShowWarning(true); }
  }

  async function doToggle() {
    if(toggling)return; setToggling(true);
    try { const res=await fetch(API+'/consecration/toggle',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'}}); if(res.ok){const d=await res.json();setIsActive(d.active);fetchStats();} } catch(e){}
    finally { setTimeout(()=>setToggling(false),500); }
  }

  async function confirmStart() {
    setShowWarning(false);
    await doToggle();
  }

  async function sendPrayer() {
    if(!prayerText.trim())return;
    try {
      await fetch(API+'/prayer-requests',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({text:prayerText,visibility:prayerVis})});
    } catch(e){}
    setPrayerSent(true);
    setTimeout(()=>{setShowPrayer(false);setPrayerText('');setPrayerSent(false);},2000);
  }

  const sceneStyle = {
    position:'relative', width:'100%', height:'85vh', minHeight:500, maxHeight:700,
    overflow:'hidden', borderRadius:16,
    background: isActive
      ? 'linear-gradient(180deg,#000a14 0%,#000e1e 35%,#001428 65%,#000e1e 100%)'
      : 'linear-gradient(180deg,#010a18 0%,#021428 35%,#031e3e 65%,#042450 100%)',
    transition:'background 1s ease',
  };

  return (
    <div style={{maxWidth:700,margin:'0 auto',padding:'0.5rem',position:'relative'}}>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        .warning-anim{animation:fadeIn 0.3s ease;}
        .sidebar-slide{transition:transform 0.35s ease;}
      `}</style>

      <div style={sceneStyle}>
        <FireScene isActive={isActive} activeFasting={stats.activeFasting} />

        <div style={{position:'absolute',inset:0,zIndex:10,pointerEvents:'none',
          background: isActive ? 'rgba(0,5,15,0.35)' : 'transparent',
          transition:'background 1s ease'}} />

        {showWarning && (
          <div style={{position:'absolute',inset:0,zIndex:60,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,5,20,0.75)'}}>
            <div className="warning-anim" style={{background:'rgba(4,12,32,0.97)',border:'1px solid rgba(60,120,220,0.4)',borderRadius:18,padding:'24px 22px',maxWidth:300,textAlign:'center',boxShadow:'0 0 50px rgba(20,80,200,0.3)'}}>
              <div style={{fontSize:32,marginBottom:12}}>⚡</div>
              <div style={{color:'#fff',fontSize:16,fontWeight:700,marginBottom:8}}>{'Vigila as tuas palavras'}</div>
              <div style={{color:'rgba(180,210,255,0.8)',fontSize:11,lineHeight:1.7,marginBottom:10}}>
                {'Durante o jejum, cada palavra tem peso. Evita conversas vãs, críticas e conflitos. Guarda o teu coração com toda diligência.'}
              </div>
              <div style={{color:'rgba(140,180,255,0.6)',fontSize:10,fontStyle:'italic',marginBottom:16,lineHeight:1.6}}>
                "Que saiam da vossa boca somente palavras boas para edificação." — Efésios 4:29
              </div>
              <button onClick={confirmStart} style={{width:'100%',background:'linear-gradient(135deg,#1a6fd4,#0d4fa8)',color:'#fff',border:'none',borderRadius:20,padding:'10px 20px',fontSize:12,fontWeight:700,cursor:'pointer',marginBottom:8}}>
                {'Entendo — Começar a Consagração'}
              </button>
              <button onClick={()=>setShowWarning(false)} style={{background:'none',border:'none',color:'rgba(140,180,255,0.5)',fontSize:11,cursor:'pointer'}}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div style={{position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',background:'rgba(255,140,20,0.12)',border:'1px solid rgba(255,140,20,0.4)',borderRadius:20,padding:'5px 18px',fontSize:12,color:'#ffb060',whiteSpace:'nowrap',zIndex:30,fontWeight:600}}>
          {stats.activeFasting} {t('consecration.activeFasting') || 'llamas encendidas ahora'}
        </div>

        <div style={{position:'absolute',top:52,left:'50%',transform:'translateX(-50%)',textAlign:'center',zIndex:30,width:'90%',pointerEvents:'none'}}>
          <h2 style={{color:'#fff',fontSize:22,fontWeight:700,textShadow:'0 0 24px rgba(80,140,255,0.7)',margin:0}}>{t('consecration.title')}</h2>
          <p style={{color:'rgba(180,210,255,0.65)',fontSize:11,marginTop:4}}>{t('consecration.subtitle')}</p>
        </div>

        <div style={{position:'absolute',top:135,left:'50%',transform:'translateX(-50%)',textAlign:'center',zIndex:30,width:'72%',color:'rgba(200,220,255,0.75)',fontSize:11,lineHeight:1.7,fontStyle:'italic',pointerEvents:'none'}}>
          {'Cada llama representa una vida buscando a Dios... y juntas iluminan el cielo'}
        </div>

        {showPrayer && (
          <div style={{position:'absolute',left:14,bottom:120,zIndex:50,width:240,background:'rgba(4,12,30,0.97)',border:'1px solid rgba(60,120,220,0.3)',borderRadius:14,padding:14}}>
            <div style={{color:'#7ab4ff',fontSize:11,fontWeight:700,marginBottom:4}}>{'Pedido de Oração'}</div>
            <div style={{color:'rgba(150,190,255,0.6)',fontSize:10,marginBottom:8,lineHeight:1.5}}>Estamos orando por ti. Partilha o teu pedido.</div>
            {prayerSent ? (
              <div style={{textAlign:'center',color:'#80d8a0',fontSize:11,padding:'8px 0'}}>{prayerVis==='public'?'Publicado no Mural!':'Recebido em privado!'} Oramos por ti!</div>
            ) : (
              <>
                <textarea value={prayerText} onChange={e=>setPrayerText(e.target.value)} rows={3} placeholder="Senhor, eu preciso de..." style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(60,120,220,0.25)',borderRadius:8,padding:'7px 10px',color:'#fff',fontSize:10,resize:'none',outline:'none',fontFamily:'sans-serif',lineHeight:1.5}} />
                <div style={{display:'flex',gap:5,margin:'7px 0'}}>
                  <button onClick={()=>setPrayerVis('public')} style={{flex:1,padding:'5px 3px',borderRadius:8,border:'1px solid '+(prayerVis==='public'?'rgba(255,130,20,0.4)':'rgba(60,120,220,0.2)'),background:prayerVis==='public'?'rgba(255,130,20,0.12)':'transparent',color:prayerVis==='public'?'#ffb060':'rgba(150,190,255,0.6)',fontSize:9,cursor:'pointer',fontWeight:600}}>Publicar no Mural</button>
                  <button onClick={()=>setPrayerVis('private')} style={{flex:1,padding:'5px 3px',borderRadius:8,border:'1px solid '+(prayerVis==='private'?'rgba(80,140,255,0.4)':'rgba(60,120,220,0.2)'),background:prayerVis==='private'?'rgba(30,80,180,0.15)':'transparent',color:prayerVis==='private'?'#7ab4ff':'rgba(150,190,255,0.6)',fontSize:9,cursor:'pointer',fontWeight:600}}>Privado</button>
                </div>
                <button onClick={sendPrayer} style={{width:'100%',background:'linear-gradient(135deg,#1a4fa8,#0d3a80)',color:'#fff',fontSize:10,fontWeight:700,border:'none',borderRadius:10,padding:7,cursor:'pointer'}}>Enviar Pedido</button>
              </>
            )}
          </div>
        )}

        <button onClick={()=>setShowPrayer(!showPrayer)} style={{position:'absolute',left:14,bottom:72,zIndex:30,background:'rgba(5,15,40,0.75)',border:'1px solid rgba(80,140,255,0.35)',borderRadius:22,padding:'7px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:7,color:'rgba(180,210,255,0.85)',fontSize:11,fontWeight:600}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:'#4a8fff',display:'inline-block'}}></span>
          {'Pedido de Oração'}
        </button>

        <button onClick={()=>setShowSidebar(true)} style={{position:'absolute',right:14,bottom:72,zIndex:30,background:'rgba(5,15,40,0.75)',border:'1px solid rgba(80,140,255,0.35)',borderRadius:22,padding:'7px 14px',cursor:'pointer',color:'rgba(180,210,255,0.85)',fontSize:11,fontWeight:600}}>
          Guia
        </button>

        <button onClick={handleStartClick} disabled={toggling} style={{position:'absolute',bottom:14,left:'50%',transform:'translateX(-50%)',background:isActive?'linear-gradient(135deg,#0d4fa8,#1a6fd4)':'linear-gradient(135deg,#ff5500,#cc2200)',color:'#fff',fontSize:12,fontWeight:700,border:'none',borderRadius:28,padding:'12px 30px',zIndex:30,cursor:'pointer',boxShadow:isActive?'0 0 28px rgba(30,100,220,0.5)':'0 0 28px rgba(255,80,0,0.5)',transition:'all 0.5s',whiteSpace:'nowrap'}}>
          {isActive ? (t('consecration.consecrating')||'CONSAGRANDO... (parar)') : (t('consecration.startButton')||'COMEÇAR CONSAGRAÇÃO')}
        </button>

        {showSidebar && (
          <div style={{position:'absolute',right:0,top:0,bottom:0,width:270,zIndex:60,background:'rgba(4,12,30,0.97)',borderLeft:'1px solid rgba(60,120,220,0.2)',overflowY:'auto',padding:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <span style={{color:'#a0c8ff',fontSize:13,fontWeight:700}}>Guia da Consagração</span>
              <span onClick={()=>setShowSidebar(false)} style={{color:'rgba(140,180,255,0.5)',fontSize:20,cursor:'pointer',lineHeight:1}}>×</span>
            </div>
            {[
              {title:'O Poder do Jejum',text:'O jejum é uma das armas espirituais mais poderosas. Não é dieta — é entrega total a Deus.',verse:'"Quando jejuares... teu Pai, que vê em secreto, te recompensará." — Mateus 6:17-18'},
              {title:'Como Funciona',steps:['Clica em Começar — a tua chama acende','A chama cresce com as horas','Dias consecutivos mudam a cor da chama','Clica novamente para terminar']},
              {title:'Evolução das Chamas',flames:[{c:'#ff6622',l:'Início — laranja'},{c:'#ffaa22',l:'1h+ — crescendo'},{c:'#88dd55',l:'Dia 1 — verde inicio'},{c:'#44cc77',l:'Dia 2 — verde forte'},{c:'#22ff88',l:'Dia 3+ — tocha épica'}]},
              {title:'Benefícios Espirituais',text:'Força espiritual · Direção divina · Quebra de opressão · Intimidade com Deus',verse:'"Jejuamos e pedimos a Deus, e Ele nos ouviu." — Esdras 8:23'},
              {title:'Quebrar o Jejum',text:'Termina com gratidão e simplicidade. Toma alimentos leves e dá graças.',verse:'"Fazei tudo para a glória de Deus." — 1 Coríntios 10:31'},
            ].map((s,i)=>(
              <div key={i} style={{marginBottom:16}}>
                <div style={{color:'#7ab4ff',fontSize:11,fontWeight:700,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.title}</div>
                {s.text && <p style={{color:'rgba(180,210,255,0.7)',fontSize:11,lineHeight:1.6,margin:0}}>{s.text}</p>}
                {s.verse && <div style={{color:'rgba(140,180,255,0.6)',fontSize:10,fontStyle:'italic',marginTop:4,lineHeight:1.5}}>{s.verse}</div>}
                {s.steps && <div style={{display:'flex',flexDirection:'column',gap:7}}>{s.steps.map((st,j)=>(
                  <div key={j} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                    <div style={{width:18,height:18,borderRadius:'50%',background:'rgba(30,80,180,0.5)',border:'1px solid rgba(80,140,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#7ab4ff',fontWeight:700,flexShrink:0}}>{j+1}</div>
                    <span style={{color:'rgba(180,210,255,0.75)',fontSize:10,lineHeight:1.5}}>{st}</span>
                  </div>
                ))}</div>}
                {s.flames && <div style={{display:'flex',flexDirection:'column',gap:5}}>{s.flames.map((f,j)=>(
                  <div key={j} style={{display:'flex',alignItems:'center',gap:8,fontSize:10,color:'rgba(180,210,255,0.7)'}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:f.c,flexShrink:0}}></div>{f.l}
                  </div>
                ))}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}