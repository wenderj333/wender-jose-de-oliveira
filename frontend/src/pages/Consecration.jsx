import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

const VERSES = [
  { ref: 'Mateus 4:1', text: 'Jesus foi levado pelo Espírito ao deserto.' },
  { ref: 'Joel 2:12', text: 'Convertei-vos a mim de todo o coração, com jejum.' },
  { ref: 'Isaías 58:6', text: 'O jejum que escolhi é soltar os laços da impiedade.' },
  { ref: 'Mateus 6:17', text: 'Quando jejuares, unge a cabeça e lava o rosto.' },
  { ref: 'Daniel 10:3', text: 'Não comi manjar delicado, nem entrou carne na minha boca.' },
  { ref: 'Lucas 4:2', text: 'Durante quarenta dias foi tentado pelo diabo.' },
  { ref: 'Atos 13:2', text: 'Enquanto ministravam ao Senhor e jejuavam.' },
];

const ACTIONS = ['dayGuide_1','dayGuide_2','dayGuide_3','dayGuide_4','dayGuide_5','dayGuide_6','dayGuide_7'];

const BIBLICAL_GUIDE = {
  pt: { button: 'Jejum Bíblico', title: 'Jejum bíblico: vigia e consagração', intro: 'Um tempo separado para buscar Deus com sinceridade, oração e sabedoria.', watch: 'Vigilância no olhar', watchText: 'Protege o que entra pelos olhos: escolhe conteúdos que edificam e mantém o coração atento à Palavra.', benefits: 'Frutos de uma consagração pura', benefitsText: 'Mais clareza espiritual, domínio próprio, sensibilidade para ouvir Deus e amor renovado pelas pessoas.', steps: ['Começa com oração e um propósito claro.', 'Escolhe um período seguro e hidrata-te quando necessário.', 'Troca distrações por Bíblia, silêncio e oração.', 'Termina agradecendo e retoma a alimentação com cuidado.'], note: 'O jejum não substitui cuidados médicos. Se tens alguma condição de saúde, procura orientação profissional.' },
  es: { button: 'Ayuno bíblico', title: 'Ayuno bíblico: vigilancia y consagración', intro: 'Un tiempo separado para buscar a Dios con sinceridad, oración y sabiduría.', watch: 'Vigilancia en la mirada', watchText: 'Protege lo que entra por tus ojos: elige contenidos que edifican y mantén el corazón atento a la Palabra.', benefits: 'Frutos de una consagración pura', benefitsText: 'Más claridad espiritual, dominio propio, sensibilidad para escuchar a Dios y amor renovado por las personas.', steps: ['Comienza con oración y un propósito claro.', 'Elige un período seguro y cuida tu hidratación.', 'Cambia distracciones por Biblia, silencio y oración.', 'Termina agradeciendo y vuelve a comer con cuidado.'], note: 'El ayuno no sustituye la atención médica. Si tienes una condición de salud, busca orientación profesional.' },
  en: { button: 'Biblical fast', title: 'Biblical fast: watchfulness and dedication', intro: 'Set aside time to seek God with sincerity, prayer and wisdom.', watch: 'Watchfulness in what you see', watchText: 'Guard what enters through your eyes: choose things that build you up and keep your heart attentive to the Word.', benefits: 'Fruit of a sincere dedication', benefitsText: 'Greater spiritual clarity, self-control, sensitivity to God and renewed love for people.', steps: ['Begin with prayer and a clear purpose.', 'Choose a safe period and stay hydrated as needed.', 'Replace distractions with Scripture, silence and prayer.', 'Finish with thanksgiving and return to food gently.'], note: 'Fasting does not replace medical care. If you have a health condition, seek professional advice.' },
};

const CHALLENGE_COPY = {
  pt: { title: 'Desafio de 7 dias', intro: 'Caminha um dia de cada vez com oração, Palavra e atitudes de fé.', mark: 'Marcar dia como concluído', done: 'Dia concluído', invite: 'Convidar amigos', reminder: 'Ativar lembrete diário', reminderOn: 'Lembrete ativado neste dispositivo', reminderInfo: 'O lembrete funciona neste dispositivo enquanto permitido.' },
  es: { title: 'Desafío de 7 días', intro: 'Camina un día a la vez con oración, Palabra y actitudes de fe.', mark: 'Marcar día como completado', done: 'Día completado', invite: 'Invitar amigos', reminder: 'Activar recordatorio diario', reminderOn: 'Recordatorio activado en este dispositivo', reminderInfo: 'El recordatorio funciona en este dispositivo mientras esté permitido.' },
  en: { title: '7-day challenge', intro: 'Walk one day at a time with prayer, Scripture and acts of faith.', mark: 'Mark day complete', done: 'Day complete', invite: 'Invite friends', reminder: 'Enable daily reminder', reminderOn: 'Reminder enabled on this device', reminderInfo: 'The reminder works on this device while permission is allowed.' },
};

const CHAT_COPY = {
  pt: { title: '💬 Chat da Consagração', text: 'Conversa com outras pessoas que estão a jejuar, partilha uma palavra de fé e apoia a comunidade.', button: 'Abrir chat comunitário', note: 'Respeita as pessoas e não partilhes dados pessoais.' },
  es: { title: '💬 Chat de la consagración', text: 'Habla con otras personas que están ayunando, comparte una palabra de fe y apoya a la comunidad.', button: 'Abrir chat comunitario', note: 'Respeta a las personas y no compartas datos personales.' },
  en: { title: '💬 Dedication chat', text: 'Talk with people who are fasting, share a word of faith and support the community.', button: 'Open community chat', note: 'Be respectful and do not share personal information.' },
};

// Avatares demonstrativos para a sala não ficar vazia antes da chegada de participantes reais.
// Eles são sempre identificados como exemplo e não entram nas contagens do servidor.
const DEMO_PARTICIPANTS = Array.from({ length: 10 }, (_, index) => ({
  user_id: `demo-${index + 1}`,
  name: ['Ana', 'João', 'Maria', 'Rui', 'Sara', 'Davi', 'Ester', 'Lucas', 'Noemi', 'Paulo'][index],
  start_date: new Date(Date.now() - (index + 1) * 2 * 3600000).toISOString(),
  avatar_url: '/pro.jpg',
}));

export default function Consecration() {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totalConsecrations:0, activeFasting:0 });
  const [participants, setParticipants] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [entering, setEntering] = useState(false);
  const [entered, setEntered] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [muralPosts, setMuralPosts] = useState([]);
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState('prayer');
  const [showForm, setShowForm] = useState(false);
  const [showBiblicalGuide, setShowBiblicalGuide] = useState(false);
  const [challengeDone, setChallengeDone] = useState(() => Number(localStorage.getItem('consecration_challenge_day') || 0));
  const [reminderEnabled, setReminderEnabled] = useState(() => localStorage.getItem('consecration_reminder') === 'true');
  const [shareMsg, setShareMsg] = useState('');
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
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [bubbleOffsets, setBubbleOffsets] = useState({});
  const dragRef = useRef(null);
  const today = new Date().getDay();
  const verse = VERSES[today % VERSES.length];
  const todayAction = ACTIONS[today % ACTIONS.length];
  const guide = BIBLICAL_GUIDE[i18n.language?.split('-')[0]] || BIBLICAL_GUIDE.pt;
  const challenge = CHALLENGE_COPY[i18n.language?.split('-')[0]] || CHALLENGE_COPY.pt;
  const chatCopy = CHAT_COPY[i18n.language?.split('-')[0]] || CHAT_COPY.pt;
  const challengeDay = Math.min(7, Math.max(1, dayCount));
  const flameIcon = dayCount >= 21 ? '🔥🔥🔥' : dayCount >= 7 ? '🔥🔥' : dayCount >= 3 ? '🔥' : '🕯️';
  const displayParticipants = participants.length ? participants : DEMO_PARTICIPANTS;
  const showingDemoParticipants = participants.length === 0;

  const handleBubblePointerDown = (event, person, index) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const current = bubbleOffsets[index] || { x: 0, y: 0 };
    dragRef.current = { index, person, startX: event.clientX, startY: event.clientY, originX: current.x, originY: current.y, moved: false };
  };
  const handleBubblePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
    setBubbleOffsets(prev => ({ ...prev, [drag.index]: { x: drag.originX + dx, y: drag.originY + dy } }));
  };
  const handleBubblePointerUp = () => {
    const drag = dragRef.current;
    if (drag && !drag.moved) setSelectedParticipant(drag.person);
    dragRef.current = null;
  };

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content');
    const canonical = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.getAttribute('href');
    document.title = 'Jejum Mundial e Consagração | Sigo com Fé';
    if (description) description.setAttribute('content', 'Participe do jejum mundial e da consagração no Sigo com Fé. Ore com a comunidade e acompanhe quem está em jejum.');
    if (canonical) canonical.setAttribute('href', `${window.location.origin}/consagracao`);
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.setAttribute('content', previousDescription);
      if (canonical && previousCanonical) canonical.setAttribute('href', previousCanonical);
    };
  }, []);

  useEffect(() => {
    const loadCommunity = () => {
      fetch(API+'/api/consecration/stats').then(r=>r.json()).then(d=>setStats(d)).catch(()=>{});
      fetch(API+'/api/consecration/active').then(r=>r.json()).then(d=>setParticipants(d.participants || [])).catch(()=>{});
    };
    loadCommunity();
    const communityTimer = setInterval(loadCommunity, 30000);
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
    return () => clearInterval(communityTimer);
  }, []);

  const fastingDuration = (start) => {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(start || Date.now()).getTime()) / 60000));
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`;
  };

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

  const shareFasting = async () => {
    const url = `${window.location.origin}/consagracao`;
    const text = t('consecration.shareText', 'Estou a participar no Jejum Mundial e a orar com a comunidade Sigo com Fé. Junta-te a nós!');
    try {
      if (navigator.share) await navigator.share({ title: t('consecration.shareTitle', 'Jejum Mundial'), text, url });
      else { await navigator.clipboard?.writeText(`${text} ${url}`); setShareMsg(t('consecration.shareCopied', 'Link copiado para partilhar!')); setTimeout(() => setShareMsg(''), 3000); }
    } catch (error) { if (error?.name !== 'AbortError') setShareMsg(t('consecration.shareUnavailable', 'Partilha indisponível neste momento.')); }
  };

  const markChallengeDay = () => {
    const next = Math.min(7, Math.max(challengeDone, challengeDay));
    setChallengeDone(next);
    localStorage.setItem('consecration_challenge_day', String(next));
    setShareMsg(next >= 7 ? `${challenge.done} 🎉` : `${challenge.done} ${next}/7`);
    setTimeout(() => setShareMsg(''), 3000);
  };

  const enableReminder = async () => {
    if (!('Notification' in window)) return setShareMsg(challenge.reminderInfo);
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission === 'granted') { setReminderEnabled(true); localStorage.setItem('consecration_reminder', 'true'); setShareMsg(challenge.reminderOn); }
    else setShareMsg(challenge.reminderInfo);
    setTimeout(() => setShareMsg(''), 3000);
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

  if (silentMode) return (
    <div style={{position:'fixed',inset:0,backgroundImage:'url(/biblia-register.png)',backgroundSize:'cover',backgroundPosition:'center',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',textAlign:'center',padding:24,zIndex:100}}>
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
    <div style={{position:'fixed',inset:0,backgroundImage:'url(/biblia-register.png)',backgroundSize:'cover',backgroundPosition:'center',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',textAlign:'center',padding:24,zIndex:100}}>
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

  return (
    <div style={{maxWidth:700,margin:'0 auto',padding:'0.5rem',fontFamily:'Segoe UI,sans-serif'}}>
      <style>{`@keyframes consecrationBubbleFloat { 0%,100% { transform: translate(0,0) scale(1); } 25% { transform: translate(86px,-42px) scale(1.03); } 50% { transform: translate(-72px,58px) scale(.98); } 75% { transform: translate(-105px,-24px) scale(1.02); } } @keyframes consecrationBubbleBounce { 0%,100% { box-shadow: 0 4px 12px rgba(0,0,0,.25); } 50% { box-shadow: 0 11px 22px rgba(240,192,64,.5); } }`}</style>
      <div style={{position:'relative',width:'100%',minHeight:'92vh',borderRadius:16,overflow:'hidden',backgroundImage:'url(/biblia-register.png)',backgroundSize:'cover',backgroundPosition:'center'}}>
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
            <div aria-label="Pessoas em jejum agora" style={{position:'absolute',top:0,bottom:0,left:8,right:8,height:'auto',margin:0,overflow:'hidden',borderRadius:18,pointerEvents:'none',zIndex:1}}>
              {displayParticipants.map((person, index) => {
                const size = Math.min(72, 42 + Math.floor(Math.max(0, (Date.now() - new Date(person.start_date || Date.now()).getTime()) / 3600000)) * 3);
                const offset = bubbleOffsets[index] || { x: 0, y: 0 };
                const startLeft = 5 + ((index * 37) % 84);
                const startTop = 8 + ((index * 53) % 67);
                return <div key={person.user_id || index} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,position:'absolute',left:`calc(${startLeft}% + ${offset.x}px)`,top:`calc(${startTop}% + ${offset.y}px)`,transition:dragRef.current?.index===index?'none':'left .25s ease, top .25s ease',touchAction:'none',cursor:'grab',pointerEvents:'auto',zIndex:3,animation:`consecrationBubbleFloat ${16 + (index % 4) * 2}s ease-in-out ${index * -1.1}s infinite`}} onPointerDown={e=>handleBubblePointerDown(e,person,index)} onPointerMove={handleBubblePointerMove} onPointerUp={handleBubblePointerUp} onPointerCancel={handleBubblePointerUp}>
                  <div style={{width:size,height:size,borderRadius:'50%',padding:3,background:'linear-gradient(145deg,#f0c040,#9b59b6)',boxShadow:'0 4px 12px rgba(0,0,0,.25)',boxSizing:'border-box',animation:`consecrationBubbleBounce ${5 + (index % 3) * .8}s ease-in-out infinite`}}>
                    <img src={person.avatar_url || '/pro.jpg'} alt={person.name} onError={e=>{e.currentTarget.src='/pro.jpg';}} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%',border:'2px solid rgba(255,255,255,.8)'}} />
                  </div>
                  <span style={{fontSize:10,maxWidth:78,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{person.name}</span>
                </div>;
              })}
            </div>
            {showingDemoParticipants && <span style={{fontSize:11,color:'rgba(255,255,255,.68)',display:'block',marginBottom:8}}>{t('consecration.demoParticipants','Exemplo visual — entre para aparecer com seu nome')}</span>}
            {selectedParticipant && <div role="status" style={{display:'inline-flex',alignItems:'center',gap:10,margin:'0 auto 10px',padding:'8px 14px',borderRadius:14,background:'rgba(0,0,0,.5)',border:'1px solid rgba(240,192,64,.5)',fontSize:12,color:'white'}}><strong>{selectedParticipant.name}</strong><span>•</span><span>{fastingDuration(selectedParticipant.start_date)}</span><button onClick={()=>setSelectedParticipant(null)} aria-label="Fechar" style={{border:'none',background:'transparent',color:'white',cursor:'pointer',fontSize:16,lineHeight:1}}>×</button></div>}
            <h1 style={{fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'white',margin:'0 0 6px',textShadow:'0 2px 8px rgba(0,0,0,0.5)'}}>{t('consecration.title','Consagração e Jejum')}</h1>
            <p style={{color:'rgba(255,255,255,0.8)',fontSize:13,margin:'0 0 6px'}}>{t('consecration.subtitle','Jejum mundial e oração')}</p>
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
            {entered && <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',marginBottom:12}}>
              <button type="button" onClick={shareFasting} style={{border:'1px solid rgba(255,255,255,.45)',borderRadius:18,padding:'9px 15px',background:'rgba(255,255,255,.13)',color:'white',fontWeight:700,cursor:'pointer',fontSize:12}}>📤 {t('consecration.shareBtn','Compartilhar meu jejum')}</button>
              <a href={`https://wa.me/?text=${encodeURIComponent(`${t('consecration.shareText','Estou a participar no Jejum Mundial e a orar com a comunidade Sigo com Fé. Junta-te a nós!')} ${window.location.origin}/consagracao`)}`} target="_blank" rel="noreferrer" style={{border:'1px solid rgba(116,255,170,.55)',borderRadius:18,padding:'9px 15px',background:'rgba(37,211,102,.22)',color:'white',fontWeight:700,textDecoration:'none',fontSize:12}}>💬 WhatsApp</a>
            </div>}
            {shareMsg && <div role="status" style={{color:'#f0c040',fontSize:12,fontWeight:700,marginBottom:8}}>{shareMsg}</div>}
            {!entered ? (
              <button onClick={handleEnter} style={{width:'100%',padding:'18px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#f0c040,#e67e22)',color:'#1a0a3e',fontWeight:900,cursor:'pointer',fontSize:16,boxShadow:'0 8px 25px rgba(240,192,64,0.4)'}}>
                {t('consecration.enterDesert','🏔 Entrar na Consagração')}
              </button>
            ) : (
              <button onClick={handleExit} style={{width:'100%',padding:'14px',borderRadius:14,border:'1px solid rgba(255,255,255,0.3)',background:'rgba(231,76,60,0.3)',color:'white',fontWeight:700,cursor:'pointer',fontSize:14}}>
                {t('consecration.endFasting','Finalizar jejum')}
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

      <div style={{background:'linear-gradient(135deg,#1a0a3e,#2d1054)',borderRadius:16,padding:20,marginTop:16,color:'white',border:'1px solid rgba(240,192,64,0.3)'}}>
        <h3 style={{color:'#f0c040',fontWeight:800,fontSize:16,margin:'0 0 12px'}}>📖 {t('consecration.dailyTitle','Guia do Dia')}</h3>
        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:12,padding:'12px 16px',marginBottom:12,borderLeft:'3px solid #f0c040'}}>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:12,fontStyle:'italic',margin:'0 0 4px'}}>📖 {verse.ref}</p>
          <p style={{color:'white',fontSize:14,margin:0,lineHeight:1.5}}>{verse.text}</p>
        </div>
        <div style={{background:'rgba(240,192,64,0.1)',borderRadius:12,padding:'10px 16px',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:24}}>✨</span>
          <div>
            <p style={{color:'#f0c040',fontWeight:700,fontSize:12,margin:'0 0 2px'}}>{t('consecration.dailyAction','Ação de hoje')}</p>
            <p style={{color:'white',fontSize:14,margin:0}}>{t('consecration.'+todayAction,'Ora pela tua família')}</p>
          </div>
        </div>
      </div>

      <section style={{marginTop:14,borderRadius:18,padding:18,background:'linear-gradient(135deg,#edf8f2,#f5edff)',border:'1px solid rgba(92,65,139,.16)',boxShadow:'0 10px 24px rgba(60,35,95,.1)',color:'#25143e'}}>
        <h3 style={{margin:'0 0 6px',fontSize:19,color:'#4b267e'}}>{chatCopy.title}</h3>
        <p style={{margin:'0 0 12px',fontSize:13,color:'#625873',lineHeight:1.5}}>{chatCopy.text}</p>
        <Link to="/comunidade-ao-vivo?room=consagracao" style={{display:'inline-flex',alignItems:'center',padding:'10px 15px',borderRadius:14,background:'#6c3fa0',color:'white',fontWeight:800,fontSize:12,textDecoration:'none'}}>{chatCopy.button} →</Link>
        <p style={{margin:'10px 0 0',fontSize:11,color:'#7b6d83'}}>{chatCopy.note}</p>
      </section>

      <button onClick={()=>setShowBiblicalGuide(v=>!v)} style={{width:'100%',marginTop:14,padding:'15px 18px',borderRadius:16,border:'1px solid rgba(240,192,64,.45)',background:'linear-gradient(135deg,#f0c040,#e67e22)',color:'#1a0a3e',fontWeight:900,fontSize:15,cursor:'pointer',boxShadow:'0 8px 22px rgba(128,76,20,.22)',display:'flex',alignItems:'center',justifyContent:'space-between'}}><span>📖 {guide.button}</span><span style={{fontSize:20}}>{showBiblicalGuide?'−':'+'}</span></button>
      {showBiblicalGuide && <div style={{marginTop:10,borderRadius:18,padding:20,background:'linear-gradient(145deg,#fffaf0,#f2e9ff)',color:'#25143e',boxShadow:'0 12px 30px rgba(60,35,95,.14)',border:'1px solid rgba(92,65,139,.16)'}}>
        <h3 style={{margin:'0 0 6px',fontSize:20,color:'#4b267e'}}>{guide.title}</h3>
        <p style={{margin:'0 0 16px',color:'#625873',lineHeight:1.55,fontSize:14}}>{guide.intro}</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>
          <div style={{padding:14,borderRadius:14,background:'#fff',borderLeft:'4px solid #6c3fa0'}}><strong style={{color:'#4b267e'}}>👁️ {guide.watch}</strong><p style={{margin:'7px 0 0',fontSize:13,lineHeight:1.5,color:'#625873'}}>{guide.watchText}</p></div>
          <div style={{padding:14,borderRadius:14,background:'#fff',borderLeft:'4px solid #e0a92d'}}><strong style={{color:'#8a5a00'}}>✨ {guide.benefits}</strong><p style={{margin:'7px 0 0',fontSize:13,lineHeight:1.5,color:'#625873'}}>{guide.benefitsText}</p></div>
        </div>
        <ol style={{margin:'16px 0 10px',paddingLeft:22,color:'#4f4260',fontSize:13,lineHeight:1.7}}>{guide.steps.map(step=><li key={step}>{step}</li>)}</ol>
        <p style={{margin:'12px 0 0',fontSize:11,color:'#7b6d83',fontStyle:'italic'}}>⚕️ {guide.note}</p>
      </div>}

      <div style={{marginTop:14,borderRadius:18,padding:20,background:'linear-gradient(135deg,#e9f6f0,#f5edff)',border:'1px solid rgba(92,65,139,.16)',boxShadow:'0 10px 24px rgba(60,35,95,.1)',color:'#25143e'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:12,flexWrap:'wrap'}}><div><h3 style={{margin:'0 0 5px',fontSize:19,color:'#4b267e'}}>🔥 {challenge.title}</h3><p style={{margin:0,fontSize:13,color:'#625873',lineHeight:1.45}}>{challenge.intro}</p></div><strong style={{color:'#4b267e',fontSize:14}}>{challengeDone}/7</strong></div>
        <div style={{display:'flex',gap:7,margin:'16px 0',flexWrap:'wrap'}}>{Array.from({length:7},(_,i)=>{const complete=i+1<=challengeDone; return <span key={i} title={`Dia ${i+1}`} style={{width:30,height:30,borderRadius:'50%',display:'grid',placeItems:'center',fontSize:12,fontWeight:800,color:complete?'white':'#6c3fa0',background:complete?'#6c3fa0':'rgba(108,63,160,.12)',border:'1px solid rgba(108,63,160,.25)'}}>{complete?'✓':i+1}</span>;})}</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button type="button" onClick={markChallengeDay} style={{border:0,borderRadius:14,padding:'10px 14px',background:'#6c3fa0',color:'white',fontWeight:800,cursor:'pointer',fontSize:12}}>{challengeDone>=challengeDay&&challengeDone>0?'✓ '+challenge.done:challenge.mark}</button><button type="button" onClick={shareFasting} style={{border:'1px solid #6c3fa0',borderRadius:14,padding:'10px 14px',background:'transparent',color:'#4b267e',fontWeight:800,cursor:'pointer',fontSize:12}}>📤 {challenge.invite}</button><button type="button" onClick={enableReminder} disabled={reminderEnabled} style={{border:'1px solid #5d987a',borderRadius:14,padding:'10px 14px',background:reminderEnabled?'rgba(93,152,122,.18)':'transparent',color:'#356c5c',fontWeight:800,cursor:reminderEnabled?'default':'pointer',fontSize:12}}>🔔 {reminderEnabled?challenge.reminderOn:challenge.reminder}</button></div>
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
