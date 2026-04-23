import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import PERGUNTAS_JSON from '../data/perguntas.json';

const LIVROS = ['Todos','Genesis','Exodo','Salmos','Proverbios','Mateus','Apocalipse'];
const TEMPO = 15;
const bg = { minHeight:'100vh', backgroundImage:'url(/fundo-desafio.jpg)', backgroundSize:'cover', backgroundPosition:'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, color:'white' };

function filtrar(livro) {
  let p = PERGUNTAS_JSON.filter(x => livro==='Todos' || x.livro===livro);
  if(!p.length) p = PERGUNTAS_JSON;
  const f=p.filter(x=>x.nivel==='facil').sort(()=>Math.random()-0.5).slice(0,2);
  const m=p.filter(x=>x.nivel==='medio').sort(()=>Math.random()-0.5).slice(0,2);
  const d=p.filter(x=>x.nivel==='dificil').sort(()=>Math.random()-0.5).slice(0,1);
  return [...f,...m,...d];
}

export default function DesafioBiblico() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.substring(0,2) || 'pt';
  const { user } = useAuth();

  function playSound(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      if(type==='click'){o.frequency.value=600;g.gain.setValueAtTime(0.1,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.1);o.start();o.stop(ctx.currentTime+0.1);}
      else if(type==='certo'){o.type='sine';o.frequency.setValueAtTime(523,ctx.currentTime);o.frequency.setValueAtTime(659,ctx.currentTime+0.1);o.frequency.setValueAtTime(784,ctx.currentTime+0.2);g.gain.setValueAtTime(0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);o.start();o.stop(ctx.currentTime+0.4);}
      else if(type==='errado'){o.type='sawtooth';o.frequency.setValueAtTime(200,ctx.currentTime);o.frequency.setValueAtTime(150,ctx.currentTime+0.1);g.gain.setValueAtTime(0.15,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);o.start();o.stop(ctx.currentTime+0.3);}
      else if(type==='conquista'){o.type='sine';o.frequency.setValueAtTime(784,ctx.currentTime);o.frequency.setValueAtTime(988,ctx.currentTime+0.15);o.frequency.setValueAtTime(1175,ctx.currentTime+0.3);g.gain.setValueAtTime(0.25,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.6);o.start();o.stop(ctx.currentTime+0.6);}
      else if(type==='fim'){o.type='sine';o.frequency.setValueAtTime(523,ctx.currentTime);o.frequency.setValueAtTime(659,ctx.currentTime+0.2);o.frequency.setValueAtTime(523,ctx.currentTime+0.4);g.gain.setValueAtTime(0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.7);o.start();o.stop(ctx.currentTime+0.7);}
    } catch(e){}
  }
  const ADMIN_EMAIL = 'wenderj333@gmail.com';
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  if(user) console.log('USER EMAIL:', user.email, 'IS ADMIN:', isAdmin);
  const audioRef = React.useRef(null);
  const [musicUrl, setMusicUrl] = React.useState(()=>localStorage.getItem('desafio_music')||'');
  const [musicPlaying, setMusicPlaying] = React.useState(false);
  const [musicVolume, setMusicVolume] = React.useState(0.4);
  const [showMusicAdmin, setShowMusicAdmin] = React.useState(false);
  const [musicInputVal, setMusicInputVal] = React.useState(()=>localStorage.getItem('desafio_music')||'');
  const [showConquistasModal, setShowConquistasModal] = React.useState(false);
  const [evento, setEvento] = React.useState(()=>JSON.parse(localStorage.getItem('desafio_evento')||'null'));
  const [showEventoAdmin, setShowEventoAdmin] = React.useState(false);
  const [eventoInput, setEventoInput] = React.useState({premio:'100',descricao:'Competicao Biblica',dataFim:''});

  React.useEffect(()=>{
    if(audioRef.current){
      audioRef.current.volume = musicVolume;
      if(musicPlaying){ audioRef.current.play().catch(()=>{}); }
      else { audioRef.current.pause(); }
    }
  },[musicPlaying, musicVolume]);
  const navigate = useNavigate();
  const location = useLocation();
  const modoSolo = new URLSearchParams(location.search).get('modo') === 'solo';
  const [soloIdx, setSoloIdx] = React.useState(0);
  const [soloPerguntas, setSoloPerguntas] = React.useState([]);
  const [soloResp, setSoloResp] = React.useState(null);
  const [soloFeedback, setSoloFeedback] = React.useState(null);
  const [soloPontos, setSoloPontos] = React.useState(0);
  const [soloTela, setSoloTela] = React.useState('jogo');
  const [soloTempo, setSoloTempo] = React.useState(15);
  const soloTimerRef = React.useRef(null);

  React.useEffect(() => {
    if (modoSolo) {
      setSoloPerguntas(filtrar('Todos'));
      setSoloIdx(0); setSoloResp(null); setSoloFeedback(null); setSoloPontos(0); setSoloTela('jogo');
    }
  }, [modoSolo]);

  React.useEffect(() => {
    if (!modoSolo || soloTela !== 'jogo' || soloResp !== null) return;
    setSoloTempo(15);
    clearInterval(soloTimerRef.current);
    soloTimerRef.current = setInterval(() => {
      setSoloTempo(prev => {
        if (prev <= 1) { clearInterval(soloTimerRef.current); soloAvancar(null); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(soloTimerRef.current);
  }, [soloIdx, modoSolo, soloTela, soloResp]);

  function soloResponder(i) {
    if (soloResp !== null) return;
    clearInterval(soloTimerRef.current);
    setSoloResp(i);
    const q = soloPerguntas[soloIdx];
    const certo = i === q.certa;
    setSoloFeedback(certo);
    if (certo) { playSound('certo'); setSoloPontos(p => p + 10); }
    else playSound('errado');
    setTimeout(() => soloAvancar(i), 1500);
  }

  function soloAvancar(resposta) {
    const next = soloIdx + 1;
    if (next >= soloPerguntas.length) {
      setSoloTela('fim');
    } else {
      setSoloIdx(next); setSoloResp(null); setSoloFeedback(null);
    }
  }

  if (modoSolo) {
    const q = soloPerguntas[soloIdx];
    const perguntaTexto = q ? (lang === 'es' ? q.pergunta_es || q.pergunta : lang === 'en' ? q.pergunta_en || q.pergunta : q.pergunta) : '';
    if (soloTela === 'fim') return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#1a0a3e,#2d1054)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,color:'white',textAlign:'center'}}>
        <div style={{fontSize:60,marginBottom:16}}>🏆</div>
        <h2 style={{fontSize:28,fontWeight:900,marginBottom:8}}>Resultado Final!</h2>
        <p style={{fontSize:48,fontWeight:900,color:'#f0c040',marginBottom:8}}>{soloPontos} pts</p>
        <p style={{opacity:0.7,marginBottom:32,fontSize:15}}>{soloPerguntas.length} perguntas respondidas</p>
        <div style={{background:'rgba(39,174,96,0.2)',border:'2px solid #27ae60',borderRadius:16,padding:24,maxWidth:360,marginBottom:24}}>
          <p style={{color:'#27ae60',fontWeight:800,fontSize:16,marginBottom:8}}>🎁 Regista-te grátis!</p>
          <p style={{fontSize:14,opacity:0.9,marginBottom:16}}>Guarda os teus pontos, entra no ranking e joga contra outros cristãos!</p>
          <button onClick={()=>navigate('/register')} style={{width:'100%',padding:'14px',borderRadius:12,border:'none',background:'#27ae60',color:'white',fontWeight:900,cursor:'pointer',fontSize:16,marginBottom:8}}>
            ✅ Criar conta grátis
          </button>
          <button onClick={()=>navigate('/')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:13}}>Voltar ao início</button>
        </div>
      </div>
    );
    if (!q) return <div style={{color:'white',textAlign:'center',padding:40}}>A carregar...</div>;
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#1a0a3e,#2d1054)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,color:'white'}}>
        <div style={{width:'100%',maxWidth:480}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <span style={{fontSize:13,opacity:0.7}}>Pergunta {soloIdx+1}/{soloPerguntas.length}</span>
            <span style={{fontSize:13,fontWeight:700,color:'#f0c040'}}>⭐ {soloPontos} pts</span>
            <span style={{fontSize:13,fontWeight:700,color:soloTempo<=5?'#e74c3c':'white'}}>⏱ {soloTempo}s</span>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',borderRadius:16,padding:24,marginBottom:16}}>
            <p style={{fontSize:18,fontWeight:700,lineHeight:1.5,margin:0,textAlign:'center'}}>{perguntaTexto}</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {(q.opcoes||[]).map((op,i) => {
              const opTexto = lang==='es'?(q.opcoes_es||q.opcoes)[i]||op : lang==='en'?(q.opcoes_en||q.opcoes)[i]||op : op;
              let bg = 'rgba(255,255,255,0.1)';
              if (soloResp !== null) {
                if (i === q.certa) bg = '#27ae60';
                else if (i === soloResp && i !== q.certa) bg = '#e74c3c';
              }
              return (
                <button key={i} onClick={()=>soloResponder(i)} disabled={soloResp!==null} style={{padding:'14px 18px',borderRadius:12,border:'none',background:bg,color:'white',fontWeight:600,cursor:soloResp!==null?'default':'pointer',fontSize:15,textAlign:'left',transition:'background 0.3s'}}>
                  {opTexto}
                </button>
              );
            })}
          </div>
          {soloFeedback !== null && (
            <div style={{textAlign:'center',marginTop:16,fontSize:24}}>
              {soloFeedback ? '✅ Certo! +10 pts' : '❌ Errado!'}
            </div>
          )}
        </div>
      </div>
    );
  }
  const [tela, setTela] = useState('lobby');
  const [livro, setLivro] = useState('Todos');
  const [codigo, setCodigo] = useState('');
  const [cInput, setCInput] = useState('');
  const [esperando, setEsperando] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [conquistas, setConquistas] = useState(()=>JSON.parse(localStorage.getItem('desafio_conquistas')||'[]'));
  const [novaConquista, setNovaConquista] = useState(null);

  const CONQUISTAS_DEF = [
    {id:'first',icon:'⭐',nome:'Primeira Vitória',desc:'Completa o teu primeiro jogo',check:(pts,livro,streak,total)=>total>=1},
    {id:'streak3',icon:'🔥',nome:'Em Chamas',desc:'3 respostas certas seguidas',check:(pts,livro,streak)=>streak>=3},
    {id:'streak5',icon:'💥',nome:'Imparável',desc:'5 respostas certas seguidas',check:(pts,livro,streak)=>streak>=5},
    {id:'perfeito',icon:'🏆',nome:'Jogo Perfeito',desc:'50 pontos num jogo',check:(pts)=>pts>=50},
    {id:'genesis',icon:'📖',nome:'Mestre do Genesis',desc:'Joga 3x com Genesis',check:(pts,livro,streak,total,stats)=>stats?.genesis>=3},
    {id:'salmos',icon:'🎵',nome:'Rei dos Salmos',desc:'Joga 3x com Salmos',check:(pts,livro,streak,total,stats)=>stats?.salmos>=3},
    {id:'velocista',icon:'⚡',nome:'Velocista',desc:'Responde em menos de 3s',check:(pts,livro,streak,total,stats)=>stats?.tempoMin<=3},
    {id:'devoto',icon:'🙏',nome:'Devoto',desc:'Joga 10 partidas',check:(pts,livro,streak,total,stats)=>stats?.totalJogos>=10},
  ];

  function verificarConquistas(pts, livro, streakAtual, stats) {
    const total = (stats?.totalJogos||0) + 1;
    const novas = [];
    CONQUISTAS_DEF.forEach(c => {
      if(!conquistas.includes(c.id) && c.check(pts, livro, streakAtual, total, stats)) {
        novas.push(c);
      }
    });
    if(novas.length > 0) {
      const ids = [...conquistas, ...novas.map(c=>c.id)];
      setConquistas(ids);
      localStorage.setItem('desafio_conquistas', JSON.stringify(ids));
      setNovaConquista(novas[0]);
      playSound('conquista');
      setTimeout(()=>setNovaConquista(null), 4000);
    }
  }
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [adversario, setAdversario] = useState(null);
  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL||'')+ '/api/quiz/ranking?periodo=semana')
      .then(r=>r.json()).then(d=>{if(Array.isArray(d))setRanking(d);}).catch(()=>{});
  }, []);
  const wsRef = useRef(null);
  const [perguntas, setPerguntas] = useState([]);
  const [idx, setIdx] = useState(0);
  const [tempo, setTempo] = useState(TEMPO);
  const [pausado, setPausado] = useState(false);
  const [resp, setResp] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [chat, setChat] = useState([]);
  const [chatMsg, setChatMsg] = useState('');
  const timerRef = useRef(null);
  const tRef = useRef(TEMPO);
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth'}); }, [chat]);

  useEffect(() => {
    if (tela !== 'jogo' || pausado) return;
    setTempo(TEMPO); tRef.current = TEMPO;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTempo(prev => {
        tRef.current = prev-1;
        if(prev<=1){ clearInterval(timerRef.current); avancar(); return 0; }
        return prev-1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, tela, pausado]);

  function jogarAleatorio() {
    const ws = new WebSocket((window.location.protocol === 'https:' ? 'wss' : 'ws') + '://sigo-com-fe-api.onrender.com/ws');
    wsRef.current = ws;
    setEsperando(true);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'game_queue', userId: user?.id, userName: user?.full_name, avatar: user?.photo_url||user?.avatar_url, livro }));
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'game_matched') {
        setEsperando(false);
        setCodigo(msg.roomId);
        if (msg.adversario) setAdversario(msg.adversario);
        if (msg.perguntas && msg.perguntas.length > 0) {
          setPerguntas(msg.perguntas);
          setIdx(0); setPontos(0); setResp(null); setFeedback(null); setPausado(false); setChat([]);
          setTela('vs');
          setTimeout(()=>setTela('jogo'), 3000);
        } else {
          setTela('vs');
          setTimeout(iniciar, 3000);
        }
      }
    };
    ws.onerror = () => { setEsperando(false); alert('Erro ao conectar. Tenta de novo!'); };
  }
  function cancelarFila() { wsRef.current?.close(); setEsperando(false); }
  function gerar() { return Math.random().toString(36).substring(2,8).toUpperCase(); }
  function criarSala() { setCodigo(gerar()); setTela('sala'); }
  function entrarSala() { if(!cInput.trim()) return; setCodigo(cInput.toUpperCase()); setTela('sala'); }

  function iniciar() {
    const ps = filtrar(livro);
    setPerguntas(ps); setIdx(0); setPontos(0); setResp(null); setFeedback(null); setPausado(false); setChat([]);
    setTela('jogo');
    setStreak(0); setMaxStreak(0); setShowStreak(false);
  }

  function responder(i) {
    if(resp!==null || pausado) return;
    clearInterval(timerRef.current);
    setResp(i);
    const p=perguntas[idx];
    const ok=i===p.r;
    const pts=ok?(tRef.current>=10?10:5):0;
    playSound(ok?'certo':'errado');
    setFeedback({ok,pts});
    setPontos(prev=>prev+pts);
    if(ok){
      setStreak(prev=>{
        const ns=prev+1;
        setMaxStreak(m=>Math.max(m,ns));
        if(ns>=3){ setShowStreak(true); setTimeout(()=>setShowStreak(false),2000); }
        return ns;
      });
    } else {
      setStreak(0);
    }
    setTimeout(avancar, 1500);
  }

  function guardarResultado(pts, totalCorretas, tempoMedio) {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch((import.meta.env.VITE_API_URL || '') + '/api/quiz/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ pontos: pts, perguntas_corretas: totalCorretas, perguntas_total: 5, livro, tempo_medio: tempoMedio })
    }).catch(() => {});
    const stats = JSON.parse(localStorage.getItem('desafio_stats')||'{}');
    stats.totalJogos = (stats.totalJogos||0) + 1;
    stats[livro.toLowerCase()] = (stats[livro.toLowerCase()]||0) + 1;
    if(tempoMedio < (stats.tempoMin||99)) stats.tempoMin = tempoMedio;
    localStorage.setItem('desafio_stats', JSON.stringify(stats));
    verificarConquistas(pts, livro, maxStreak, stats);
  }
  function avancar() {
    setFeedback(null); setResp(null);
    if(idx+1>=perguntas.length) { guardarResultado(pontos, pontos > 0 ? Math.ceil(pontos/7.5) : 0, TEMPO - tRef.current); playSound('fim'); setTela('resultado'); }
    else setIdx(prev=>prev+1);
  }

  function pausa() { if(!pausado) clearInterval(timerRef.current); setPausado(p=>!p); }

  function enviarChat() {
    if(!chatMsg.trim()) return;
    const nome=user?.full_name?.split(' ')[0]||'Eu';
    setChat(prev=>[...prev,{nome,texto:chatMsg}]);
    setChatMsg('');
  }

  function share(pts) {
    const msg='Joguei o Desafio Biblico no Sigo com Fe e fiz '+pts+' pontos! Te atreves? https://sigo-com-fe.vercel.app/desafio-biblico';
    if(navigator.share) navigator.share({title:'Desafio Biblico',text:msg});
    else { navigator.clipboard.writeText(msg); alert('Copiado!'); }
  }

  function desafiar() {
    const msg='Te desafio no Desafio Biblico do Sigo com Fe! https://sigo-com-fe.vercel.app/desafio-biblico';
    if(navigator.share) navigator.share({title:'Desafio',text:msg});
    else { navigator.clipboard.writeText(msg); alert('Copiado!'); }
  }

  const av=user?.photo_url||user?.avatar_url;
  const nm=user?.full_name||'Jogador';
  const perg=perguntas[idx];
  const btn=(onClick,bg2,txt,mb=10)=><button onClick={()=>{playSound('click');onClick();}} style={{width:'100%',maxWidth:320,padding:14,borderRadius:14,border:'none',background:bg2,color:'white',fontSize:15,fontWeight:800,cursor:'pointer',marginBottom:mb,boxShadow:'0 4px 20px rgba(0,0,0,0.4)',textShadow:'0 1px 3px rgba(0,0,0,0.3)',letterSpacing:0.5,transition:'transform 0.1s'}}>{txt}</button>;

  if(tela==='lobby') return (
    <div style={{minHeight:'100vh',backgroundImage:'url(/fundo-desafio.jpg)',backgroundSize:'cover',backgroundPosition:'center',display:'flex',color:'white'}}>
      <div style={{width:200,background:'rgba(0,0,0,0.3)',borderRight:'1px solid rgba(255,255,255,0.1)',padding:'24px 14px',display:'flex',flexDirection:'column',overflowY:'auto'}}>
        <p style={{fontSize:11,fontWeight:800,color:'#f0c040',letterSpacing:1.5,textTransform:'uppercase',marginBottom:16}}>🏆 Top Jogadores</p>
        {ranking.slice(0,10).map((j,i)=>(
          <div key={j.id||i} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 4px',borderRadius:10,marginBottom:3,background:user?.id===j.id?'rgba(108,71,212,0.2)':'transparent',border:user?.id===j.id?'1px solid rgba(108,71,212,0.4)':'1px solid transparent'}}>
            <span style={{fontSize:i<3?14:10,width:20,textAlign:'center'}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</span>
            {j.avatar_url?<img src={j.avatar_url} style={{width:28,height:28,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>:<div style={{width:28,height:28,borderRadius:'50%',background:'#6c47d4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'white',fontWeight:700,flexShrink:0}}>{j.full_name?.charAt(0)||'?'}</div>}
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:10,color:user?.id===j.id?'#a78bfa':'white',fontWeight:600,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.full_name}</p>
              <p style={{fontSize:9,color:'#f0c040',margin:0,fontWeight:700}}>{j.total_pontos} pts</p>
            </div>
          </div>
        ))}
        {ranking.length===0&&<p style={{fontSize:11,opacity:0.4,textAlign:'center',marginTop:20}}>Joga para aparecer!</p>}
        <div style={{marginTop:16,borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:12}}>
          <p style={{fontSize:10,fontWeight:800,color:'#a78bfa',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>🏅 Conquistas</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
            {CONQUISTAS_DEF.map(c=>{
              const tem=conquistas.includes(c.id);
              return <div key={c.id} title={c.nome+': '+c.desc} style={{fontSize:18,opacity:tem?1:0.5,cursor:'pointer',filter:tem?'drop-shadow(0 0 4px #f0c040)':'grayscale(1)',transition:'all 0.3s'}} onClick={()=>setShowConquistasModal(true)}>{c.icon}</div>;
            })}
          </div>
          <p style={{fontSize:9,color:'rgba(255,255,255,0.3)',marginTop:4}}>{conquistas.length}/{CONQUISTAS_DEF.length} desbloqueadas</p>
        </div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 16px',overflowY:'auto'}}>
      {evento?.ativo && (
        <div style={{width:'100%',maxWidth:400,background:'linear-gradient(135deg,#f0c040,#e67e22)',borderRadius:16,padding:'16px 20px',marginBottom:20,textAlign:'center',boxShadow:'0 4px 20px rgba(240,192,64,0.4)'}}>
          <div style={{fontSize:28}}>🏆</div>
          <p style={{color:'#1a0a3e',fontWeight:900,fontSize:16,margin:'4px 0'}}>{evento.descricao}</p>
          <p style={{color:'#1a0a3e',fontWeight:700,fontSize:20,margin:'4px 0'}}>€{evento.premio} em jogo!</p>
          {evento.dataFim&&<p style={{color:'#1a0a3e',fontSize:12,margin:'4px 0'}}>Termina: {evento.dataFim}</p>}
          <p style={{color:'#1a0a3e',fontSize:11,margin:'4px 0',opacity:0.8}}>Joga e entra no ranking para ganhar!</p>
        </div>
      )}
      <div style={{fontSize:60,marginBottom:12}}>🏆</div>
      <h1 style={{fontSize:28,fontWeight:900,marginBottom:6,textAlign:'center',color:'#f0c040',textShadow:'0 2px 10px rgba(240,192,64,0.5)',fontStyle:'italic',letterSpacing:1}}>{t('desafio.title')}</h1>
      <p style={{opacity:0.7,marginBottom:16,fontSize:14,textAlign:'center'}}>{t('desafio.subtitle')}</p>
      <p style={{fontSize:13,opacity:0.8,marginBottom:8}}>📖 {t('desafio.choosebook')||'Escolhe o livro:'}</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginBottom:20,maxWidth:360}}>
        {LIVROS.map(l=><button key={l} onClick={()=>setLivro(l)} style={{padding:'6px 14px',borderRadius:20,border:'none',background:livro===l?'linear-gradient(135deg,#f0c040,#e67e22)':'rgba(255,255,255,0.15)',color:livro===l?'#1a0a3e':'white',boxShadow:livro===l?'0 4px 15px rgba(240,192,64,0.4)':'none',fontWeight:700,cursor:'pointer',fontSize:13}}>{t('desafio.livros.'+l)||l}</button>)}
      </div>
      {btn(criarSala,'linear-gradient(135deg,#f0c040,#e67e22)',t('desafio.createsala'))}
      <div style={{width:'100%',maxWidth:320,display:'flex',gap:10,marginBottom:10}}>
        <input value={cInput} onChange={e=>setCInput(e.target.value.toUpperCase())} placeholder='Codigo da sala...' style={{flex:1,padding:12,borderRadius:12,border:'none',background:'rgba(255,255,255,0.15)',color:'white',fontSize:15,outline:'none'}} />
        <button onClick={entrarSala} style={{padding:'12px 18px',borderRadius:12,border:'none',background:'#27ae60',color:'white',fontWeight:700,cursor:'pointer',fontSize:15}}>Entrar</button>
      </div>
      {esperando ? <div style={{textAlign:'center',marginBottom:10}}><p style={{opacity:0.8,marginBottom:8}}>A aguardar um adversario...</p><button onClick={cancelarFila} style={{padding:'8px 20px',borderRadius:20,border:'1px solid rgba(255,255,255,0.4)',background:'transparent',color:'white',cursor:'pointer'}}>Cancelar</button></div> : btn(jogarAleatorio,'#e74c3c',t('desafio.playalone'))}
      {btn(desafiar,'#25D366',t('desafio.challenge'))}
      <button onClick={()=>navigate(-1)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:13}}>{t('desafio.back')}</button>
      </div>
    </div>
  );

  if(tela==='sala') return (
    <div style={bg}>
      <h2 style={{fontSize:20,marginBottom:8}}>{t('desafio.waitroom')}</h2>
      <div style={{background:'rgba(255,255,255,0.1)',borderRadius:12,padding:'10px 24px',marginBottom:8,fontSize:26,fontWeight:900,letterSpacing:8}}>{codigo}</div>
      <p style={{opacity:0.6,fontSize:12,marginBottom:4}}>Livro: {livro}</p>
      <button onClick={()=>{navigator.clipboard.writeText('Codigo: '+codigo+' https://sigo-com-fe.vercel.app/desafio-biblico');alert('Copiado!');}} style={{padding:'8px 18px',borderRadius:20,border:'1px solid rgba(255,255,255,0.4)',background:'transparent',color:'white',cursor:'pointer',marginBottom:16,fontSize:13}}>{t('desafio.copyinvite')}</button>
      <div style={{width:'100%',maxWidth:320,marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',background:'rgba(255,255,255,0.1)',borderRadius:10,marginBottom:8}}>
          {av?<img src={av} style={{width:40,height:40,borderRadius:'50%',objectFit:'cover'}}/>:<div style={{width:40,height:40,borderRadius:'50%',background:'#6c47d4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>{nm.charAt(0)}</div>}
          <span style={{flex:1}}>{nm}</span><span style={{fontSize:11,opacity:0.7}}>{t('desafio.host')}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',background:'rgba(255,255,255,0.05)',borderRadius:10,border:'1px dashed rgba(255,255,255,0.2)'}}>
          {adversario
            ? <>{adversario.avatar?<img src={adversario.avatar} style={{width:40,height:40,borderRadius:'50%',objectFit:'cover'}}/>:<div style={{width:40,height:40,borderRadius:'50%',background:'#e74c3c',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>{adversario.name?.charAt(0)||'?'}</div>}<span style={{flex:1,fontWeight:600}}>{adversario.name}</span><span style={{fontSize:11,color:'#27ae60',fontWeight:700}}>✓ Pronto</span></>
            : <><div style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>?</div><span style={{opacity:0.5,fontSize:13}}>{t('desafio.waitingplayer')}</span></>
          }
        </div>
      </div>
      {btn(iniciar,'linear-gradient(135deg,#e74c3c,#c0392b)',t('desafio.start'))}
      <button onClick={()=>setTela('lobby')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:13}}>{t('desafio.back')}</button>
    </div>
  );

  if(tela==='vs') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#1a0a3e,#2d1054)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white'}}>
      <p style={{fontSize:13,opacity:0.6,marginBottom:24,letterSpacing:2,textTransform:'uppercase'}}>Desafio Bíblico</p>
      <div style={{display:'flex',alignItems:'center',gap:24}}>
        <div style={{textAlign:'center'}}>
          {av?<img src={av} style={{width:80,height:80,borderRadius:'50%',objectFit:'cover',border:'3px solid #6c47d4'}}/>:<div style={{width:80,height:80,borderRadius:'50%',background:'#6c47d4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700}}>{nm.charAt(0)}</div>}
          <p style={{marginTop:8,fontWeight:700,fontSize:15}}>{nm}</p>
          <p style={{fontSize:11,color:'#a78bfa'}}>Tu</p>
        </div>
        <div style={{fontSize:36,fontWeight:900,color:'#f0c040'}}>VS</div>
        <div style={{textAlign:'center'}}>
          {adversario?.avatar?<img src={adversario.avatar} style={{width:80,height:80,borderRadius:'50%',objectFit:'cover',border:'3px solid #e74c3c'}}/>:<div style={{width:80,height:80,borderRadius:'50%',background:'#e74c3c',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700}}>{adversario?.name?.charAt(0)||'?'}</div>}
          <p style={{marginTop:8,fontWeight:700,fontSize:15}}>{adversario?.name||'Adversário'}</p>
          <p style={{fontSize:11,color:'#f87171'}}>Adversário</p>
        </div>
      </div>
      <p style={{marginTop:32,fontSize:13,opacity:0.6,animation:'pulse 1s infinite'}}>A iniciar em 3 segundos...</p>
    </div>
  );

  if(tela==='jogo' && perg) return (
    <div style={{...bg,justifyContent:'flex-start',paddingTop:20}}>
      <div style={{width:'100%',maxWidth:500}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{opacity:0.7,fontSize:13}}>Pergunta {idx+1}/{perguntas.length}</span>
          <button onClick={pausa} style={{padding:'5px 14px',borderRadius:20,border:'1px solid rgba(255,255,255,0.3)',background:pausado?'#f0c040':'transparent',color:pausado?'#1a0a3e':'white',cursor:'pointer',fontSize:12,fontWeight:700}}>{pausado?'Continuar':'Pausa'}</button>
          <span style={{fontWeight:700,color:tempo<=3?'#e74c3c':'#f0c040'}}>{tempo}s</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
          {av?<img src={av} style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',border:'2px solid #6c47d4'}}/>:<div style={{width:36,height:36,borderRadius:'50%',background:'#6c47d4',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>{nm.charAt(0)}</div>}
          <span style={{fontSize:13}}>{nm}</span>
          <span style={{marginLeft:'auto',color:'#f0c040',fontWeight:700}}>{pontos} pts</span>
        </div>
        <div style={{background:'rgba(255,255,255,0.1)',borderRadius:16,padding:20,marginBottom:14}}>
          <div style={{width:'100%',height:6,background:'rgba(255,255,255,0.2)',borderRadius:3,marginBottom:12}}>
            <div style={{width:(tempo/TEMPO*100)+'%',height:'100%',background:tempo<=3?'#e74c3c':'#6c47d4',borderRadius:3,transition:'width 1s linear'}} />
          </div>
          <p style={{fontSize:17,fontWeight:700,lineHeight:1.5,textAlign:'center',margin:0}}>{perg[lang + '_q'] || perg.q}</p>
          {streak>=2&&<div style={{textAlign:'center',marginTop:8,fontSize:13,color:'#f0c040',fontWeight:700}}>{'🔥'.repeat(Math.min(streak,5))} {streak} seguidas!</div>}
        </div>
        {pausado && <div style={{textAlign:'center',fontSize:18,marginBottom:12,opacity:0.8}}>{t('desafio.paused')}</div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          {(perg[lang + '_opts'] || perg.opts).map((opt,i)=>{
            let bg2='rgba(255,255,255,0.1)';
            if(resp!==null){if(i===perg.r)bg2='#27ae60';else if(i===resp)bg2='#e74c3c';}
            return <button key={i} onClick={()=>responder(i)} style={{padding:'14px 10px',borderRadius:12,border:'1px solid rgba(255,255,255,0.2)',background:bg2,color:'white',fontSize:14,fontWeight:600,cursor:'pointer',transition:'background 0.3s'}}>{opt}</button>;
          })}
        </div>
        {feedback && <div style={{textAlign:'center',fontSize:22,marginBottom:12}}>{feedback.ok?'Amem! +'+feedback.pts+' pts':'Quase!'}</div>}
        <div style={{background:'rgba(0,0,0,0.3)',borderRadius:12,padding:12}}>
          <p style={{fontSize:12,opacity:0.7,margin:'0 0 6px'}}>{t('desafio.chat')}</p>
          <div style={{maxHeight:70,overflowY:'auto',marginBottom:8}}>
            {chat.map((m,i)=><div key={i} style={{fontSize:12,marginBottom:3}}><b style={{color:'#f0c040'}}>{m.nome}:</b> {m.texto}</div>)}
            <div ref={chatEnd}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&enviarChat()} placeholder='Mensagem...' style={{flex:1,padding:'6px 10px',borderRadius:8,border:'none',background:'rgba(255,255,255,0.15)',color:'white',fontSize:12,outline:'none'}}/>
            <button onClick={enviarChat} style={{padding:'6px 12px',borderRadius:8,border:'none',background:'#6c47d4',color:'white',cursor:'pointer',fontSize:12}}>{t('desafio.send')}</button>
          </div>
        </div>
      </div>
    </div>
  );

  if(tela==='resultado') return (
    <div style={bg}>
      <div style={{fontSize:60,marginBottom:8}}>🏆</div>
      <h2 style={{fontSize:26,fontWeight:900,marginBottom:8,color:'#f0c040',textShadow:'0 2px 10px rgba(240,192,64,0.5)'}}>{t('desafio.result')}</h2>
      {adversario&&<div style={{background:'rgba(255,255,255,0.1)',borderRadius:16,padding:'12px 24px',marginBottom:12,textAlign:'center',width:'100%',maxWidth:320}}>
        <p style={{fontSize:13,opacity:0.7,marginBottom:8}}>Resultado Final</p>
        <div style={{display:'flex',justifyContent:'space-around',alignItems:'center'}}>
          <div style={{textAlign:'center'}}><p style={{fontWeight:800,fontSize:15}}>{user?.full_name?.split(' ')[0]||'Tu'}</p><p style={{fontSize:32,fontWeight:900,color:'#f0c040'}}>{pontos}</p><p style={{fontSize:11,opacity:0.7}}>pts</p></div>
          <div style={{fontSize:24}}>⚔️</div>
          <div style={{textAlign:'center'}}><p style={{fontWeight:800,fontSize:15}}>{adversario?.nome?.split(' ')[0]||'Adversario'}</p><p style={{fontSize:32,fontWeight:900,color:'#e74c3c'}}>{adversario?.pontos||0}</p><p style={{fontSize:11,opacity:0.7}}>pts</p></div>
        </div>
        <p style={{marginTop:8,fontWeight:800,fontSize:16,color:pontos>(adversario?.pontos||0)?'#27ae60':'#e74c3c'}}>{pontos>(adversario?.pontos||0)?'🎉 Ganhaste!':pontos===(adversario?.pontos||0)?'🤝 Empate!':'😔 Perdeste!'}</p>
      </div>}
      <div style={{fontSize:48,fontWeight:900,color:'#f0c040',marginBottom:4}}>{pontos} pts</div>
      <p style={{opacity:0.7,marginBottom:16}}>{pontos>=40?'🏆 Mestre Biblico!':pontos>=25?'⭐ Muito bem!':'📖 Continue estudando!'}</p>
      {maxStreak>=3&&<div style={{background:'rgba(240,192,64,0.15)',border:'1px solid #f0c040',borderRadius:12,padding:'10px 20px',marginBottom:12,textAlign:'center'}}><span style={{fontSize:20}}>🔥</span><span style={{color:'#f0c040',fontWeight:700,fontSize:15}}> Melhor streak: {maxStreak} seguidas!</span></div>}
      {btn(()=>share(pontos),'#25D366',t('desafio.shareresult'))}
      {btn(desafiar,'#6c47d4',t('desafio.challenge'))}
      {btn(()=>{setIdx(0);setPontos(0);setTela('lobby');},'rgba(255,255,255,0.2)',t('desafio.playagain'))}
      <button onClick={()=>navigate(-1)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:13}}>{t('desafio.back')}</button>
    </div>
  );

  const musicBar = musicUrl ? (
    <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:9999,background:'linear-gradient(135deg,#1a0a3e,#2d1054)',borderTop:'1px solid rgba(108,71,212,0.4)',padding:'8px 16px',display:'flex',alignItems:'center',gap:12}}>
      <audio ref={audioRef} src={musicUrl} loop onEnded={()=>setMusicPlaying(false)}/>
      <span style={{fontSize:13,color:'#a78bfa',fontWeight:700}}>🎵 Desafio Bíblico</span>
      <button onClick={()=>setMusicPlaying(p=>!p)} style={{padding:'6px 14px',borderRadius:20,border:'none',background:'#6c47d4',color:'white',cursor:'pointer',fontWeight:700,fontSize:13}}>{musicPlaying?'⏸️':'▶️'}</button>
      <input type='range' min={0} max={1} step={0.05} value={musicVolume} onChange={e=>setMusicVolume(Number(e.target.value))} style={{width:80,accentColor:'#a78bfa'}}/>
      <span style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>🔊</span>
      {isAdmin && <button onClick={()=>setShowMusicAdmin(p=>!p)} style={{marginLeft:'auto',padding:'4px 10px',borderRadius:12,border:'1px solid rgba(255,255,255,0.2)',background:'transparent',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:11}}>⚙️ Admin</button>}
    </div>
  ) : isAdmin ? (
    <div style={{position:'fixed',bottom:16,right:16,zIndex:9999}}>
      <button onClick={()=>setShowMusicAdmin(p=>!p)} style={{padding:'8px 16px',borderRadius:20,border:'none',background:'#6c47d4',color:'white',cursor:'pointer',fontWeight:700,fontSize:12}}>🎵 Adicionar Música</button>
    </div>
  ) : null;

  const musicAdmin = showMusicAdmin && isAdmin ? (
    <div style={{position:'fixed',bottom:60,right:16,zIndex:10000,background:'#1a0a3e',border:'1px solid #6c47d4',borderRadius:16,padding:20,width:300,boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
      <p style={{color:'white',fontWeight:700,marginBottom:12}}>🎵 Música do Desafio</p>
      <p style={{color:'rgba(255,255,255,0.6)',fontSize:12,marginBottom:8}}>Cola o URL directo do MP3 (Cloudinary, etc):</p>
      <input
        type='text'
        placeholder='https://... .mp3'
        value={musicInputVal}
        onChange={e=>setMusicInputVal(e.target.value)}
        style={{width:'100%',padding:'8px 12px',borderRadius:10,border:'1px solid #6c47d4',background:'rgba(255,255,255,0.1)',color:'white',fontSize:13,marginBottom:8,boxSizing:'border-box',outline:'none'}}
      />
      <div style={{display:'flex',gap:8}}>
        <button onClick={()=>{if(musicInputVal.trim()){setMusicUrl(musicInputVal.trim());localStorage.setItem('desafio_music',musicInputVal.trim());setMusicPlaying(true);setShowMusicAdmin(false);}}} style={{flex:1,padding:'8px',borderRadius:10,border:'none',background:'#6c47d4',color:'white',cursor:'pointer',fontWeight:700,fontSize:13}}>✅ Guardar</button>
        <button onClick={()=>{setMusicUrl('');localStorage.removeItem('desafio_music');setMusicPlaying(false);setShowMusicAdmin(false);}} style={{padding:'8px 12px',borderRadius:10,border:'none',background:'#e74c3c',color:'white',cursor:'pointer',fontSize:13}}>🗑️</button>
      </div>
    </div>
  ) : null;

  const streakAnim = showStreak ? (
    <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:9998,pointerEvents:'none',textAlign:'center',animation:'fadeInOut 2s ease'}}>
      <div style={{fontSize:60}}>🔥</div>
      <div style={{fontSize:28,fontWeight:900,color:'#f0c040',textShadow:'0 0 20px #f0c040'}}>{streak} SEGUIDAS!</div>
      <style>{`@keyframes fadeInOut{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)}30%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(0.8)}}`}</style>
    </div>
  ) : null;

  const conquistaAnim = novaConquista ? (
    <div style={{position:'fixed',top:80,left:'50%',transform:'translateX(-50%)',zIndex:9997,background:'linear-gradient(135deg,#1a0a3e,#2d1054)',border:'2px solid #f0c040',borderRadius:20,padding:'16px 28px',textAlign:'center',boxShadow:'0 8px 32px rgba(240,192,64,0.4)',animation:'slideDown 0.5s ease'}}>
      <div style={{fontSize:40}}>{novaConquista.icon}</div>
      <p style={{color:'#f0c040',fontWeight:900,fontSize:15,margin:'4px 0'}}>Conquista Desbloqueada!</p>
      <p style={{color:'white',fontWeight:700,fontSize:14,margin:0}}>{novaConquista.nome}</p>
      <p style={{color:'rgba(255,255,255,0.6)',fontSize:11,margin:'2px 0 0'}}>{novaConquista.desc}</p>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  ) : null;

  const eventoAdminBtn = isAdmin ? (
    <div style={{position:'fixed',bottom:80,right:80,zIndex:9999}}>
      <button onClick={()=>setShowEventoAdmin(p=>!p)} style={{padding:'8px 16px',borderRadius:20,border:'none',background:evento?.ativo?'#e74c3c':'#27ae60',color:'white',cursor:'pointer',fontWeight:700,fontSize:12}}>{evento?.ativo?'🔴 Evento ON':'🟢 Criar Evento'}</button>
    </div>
  ) : null;

  const eventoAdminPanel = showEventoAdmin && isAdmin ? (
    <div style={{position:'fixed',bottom:110,left:16,zIndex:10000,background:'#1a0a3e',border:'1px solid #f0c040',borderRadius:16,padding:20,width:300,boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
      <p style={{color:'#f0c040',fontWeight:900,fontSize:15,marginBottom:12}}>🏆 Painel Evento</p>
      {evento?.ativo ? (
        <>
          <p style={{color:'white',fontSize:13,marginBottom:8}}>Evento: <strong>{evento.descricao}</strong></p>
          <p style={{color:'#f0c040',fontSize:13,marginBottom:12}}>Premio: EUR{evento.premio}</p>
          <button onClick={()=>{const e={...evento,ativo:false};setEvento(e);localStorage.setItem('desafio_evento',JSON.stringify(e));setShowEventoAdmin(false);}} style={{width:'100%',padding:'10px',borderRadius:10,border:'none',background:'#e74c3c',color:'white',cursor:'pointer',fontWeight:700}}>🔴 Desativar Evento</button>
        </>
      ) : (
        <>
          <input placeholder="Descricao" value={eventoInput.descricao} onChange={e=>setEventoInput(p=>({...p,descricao:e.target.value}))} style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #6c47d4',background:'rgba(255,255,255,0.1)',color:'white',fontSize:12,marginBottom:8,boxSizing:'border-box'}}/>
          <input placeholder="Premio euros" value={eventoInput.premio} onChange={e=>setEventoInput(p=>({...p,premio:e.target.value}))} style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #6c47d4',background:'rgba(255,255,255,0.1)',color:'white',fontSize:12,marginBottom:8,boxSizing:'border-box'}}/>
          <input placeholder="Data fim (ex: 30/05/2026)" value={eventoInput.dataFim} onChange={e=>setEventoInput(p=>({...p,dataFim:e.target.value}))} style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #6c47d4',background:'rgba(255,255,255,0.1)',color:'white',fontSize:12,marginBottom:8,boxSizing:'border-box'}}/>
          <button onClick={()=>{const e={ativo:true,premio:eventoInput.premio,descricao:eventoInput.descricao,dataFim:eventoInput.dataFim,inicio:new Date().toLocaleDateString()};setEvento(e);localStorage.setItem('desafio_evento',JSON.stringify(e));setShowEventoAdmin(false);}} style={{width:'100%',padding:'10px',borderRadius:10,border:'none',background:'#27ae60',color:'white',cursor:'pointer',fontWeight:700}}>🟢 Ativar Evento</button>
        </>
      )}
    </div>
  ) : null;

  return <>{musicBar}{musicAdmin}{streakAnim}{conquistaAnim}{eventoAdminBtn}{eventoAdminPanel}</>;
}