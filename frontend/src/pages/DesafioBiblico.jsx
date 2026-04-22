import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import PERGUNTAS_JSON from '../data/perguntas.json';

const LIVROS = ['Todos','Genesis','Exodo','Salmos','Proverbios','Mateus','Apocalipse'];
const TEMPO = 15;
const bg = { minHeight:'100vh', background:'linear-gradient(135deg,#1a0a3e,#2d1054)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, color:'white' };

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
  const navigate = useNavigate();
  const [tela, setTela] = useState('lobby');
  const [livro, setLivro] = useState('Todos');
  const [codigo, setCodigo] = useState('');
  const [cInput, setCInput] = useState('');
  const [esperando, setEsperando] = useState(false);
  const [ranking, setRanking] = useState([]);
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
        iniciar();
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
  }

  function responder(i) {
    if(resp!==null || pausado) return;
    clearInterval(timerRef.current);
    setResp(i);
    const p=perguntas[idx];
    const ok=i===p.r;
    const pts=ok?(tRef.current>=10?10:5):0;
    setFeedback({ok,pts});
    setPontos(prev=>prev+pts);
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
  }
  function avancar() {
    setFeedback(null); setResp(null);
    if(idx+1>=perguntas.length) { guardarResultado(pontos, pontos > 0 ? Math.ceil(pontos/7.5) : 0, TEMPO - tRef.current); setTela('resultado'); }
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
  const btn=(onClick,bg2,txt,mb=10)=><button onClick={onClick} style={{width:'100%',maxWidth:320,padding:14,borderRadius:14,border:'none',background:bg2,color:'white',fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:mb}}>{txt}</button>;

  if(tela==='lobby') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#1a0a3e,#2d1054)',display:'flex',color:'white'}}>
      <div style={{width:200,background:'rgba(0,0,0,0.3)',borderRight:'1px solid rgba(255,255,255,0.1)',padding:'24px 14px',display:'flex',flexDirection:'column'}}>
        <p style={{fontSize:11,fontWeight:800,color:'#f0c040',letterSpacing:1.5,textTransform:'uppercase',marginBottom:16}}>🏆 Top Jogadores</p>
        {ranking.slice(0,10).map((j,i)=>(
          <div key={j.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 6px',borderRadius:10,marginBottom:3,background:user?.id===j.id?'rgba(108,71,212,0.2)':'transparent',border:user?.id===j.id?'1px solid rgba(108,71,212,0.4)':'1px solid transparent'}}>
            <span style={{fontSize:i<3?15:11,width:22,textAlign:'center'}}>{i<3?['🥇','🥈','🥉'][i]:'#'+(i+1)}</span>
            {j.avatar_url?<img src={j.avatar_url} style={{width:30,height:30,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>:<div style={{width:30,height:30,borderRadius:'50%',background:'#6c47d4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'white',fontWeight:700,flexShrink:0}}>{j.full_name?.charAt(0)}</div>}
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:11,color:user?.id===j.id?'#a78bfa':'white',fontWeight:600,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.full_name}</p>
              <p style={{fontSize:10,color:'#f0c040',margin:0,fontWeight:700}}>{j.total_pontos} pts</p>
              <p style={{fontSize:9,color:'rgba(255,255,255,0.4)',margin:0}}>⚡ {j.tempo_medio}s</p>
            </div>
          </div>
        ))}
        {ranking.length===0 && <p style={{fontSize:11,opacity:0.4,textAlign:'center',marginTop:20}}>Joga para aparecer!</p>}
        <div style={{display:'flex',gap:4,marginTop:'auto',paddingTop:12}}>
          {['hoje','semana','mes'].map(p=>(
            <button key={p} onClick={()=>fetch((import.meta.env.VITE_API_URL||'')+'/api/quiz/ranking?periodo='+p).then(r=>r.json()).then(d=>{if(Array.isArray(d))setRanking(d);})} style={{flex:1,padding:'4px 2px',borderRadius:8,border:'none',background:p==='semana'?'#6c47d4':'rgba(255,255,255,0.1)',color:p==='semana'?'white':'rgba(255,255,255,0.5)',fontSize:9,fontWeight:700,cursor:'pointer'}}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px'}}>
    <div style={bg}>
      <div style={{fontSize:60,marginBottom:12}}>🏆</div>
      <h1 style={{fontSize:26,fontWeight:900,marginBottom:6,textAlign:'center'}}>{t('desafio.title')}</h1>
      <p style={{opacity:0.7,marginBottom:16,fontSize:14,textAlign:'center'}}>{t('desafio.subtitle')}</p>
      <p style={{fontSize:13,opacity:0.8,marginBottom:8}}>📖 Escolhe o livro:</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginBottom:20,maxWidth:360}}>
        {LIVROS.map(l=><button key={l} onClick={()=>setLivro(l)} style={{padding:'6px 14px',borderRadius:20,border:'none',background:livro===l?'#f0c040':'rgba(255,255,255,0.15)',color:livro===l?'#1a0a3e':'white',fontWeight:700,cursor:'pointer',fontSize:13}}>{l}</button>)}
      </div>
      {btn(criarSala,'linear-gradient(135deg,#6c47d4,#4A2270)',t('desafio.createsala'))}
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
          <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>?</div>
          <span style={{opacity:0.5,fontSize:13}}>{t('desafio.waitingplayer')}</span>
        </div>
      </div>
      {btn(iniciar,'linear-gradient(135deg,#e74c3c,#c0392b)',t('desafio.start'))}
      <button onClick={()=>setTela('lobby')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:13}}>{t('desafio.back')}</button>
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
      <div style={{fontSize:60,marginBottom:12}}>🏆</div>
      <h2 style={{fontSize:26,fontWeight:900,marginBottom:8}}>{t('desafio.result')}</h2>
      <div style={{fontSize:48,fontWeight:900,color:'#f0c040',marginBottom:8}}>{pontos} pts</div>
      <p style={{opacity:0.7,marginBottom:28}}>{pontos>=40?'Mestre Biblico!':pontos>=25?'Muito bem!':'Continue estudando!'}</p>
      {btn(()=>share(pontos),'#25D366',t('desafio.shareresult'))}
      {btn(desafiar,'#6c47d4',t('desafio.challenge'))}
      {btn(()=>{setIdx(0);setPontos(0);setTela('lobby');},'rgba(255,255,255,0.2)',t('desafio.playagain'))}
      <button onClick={()=>navigate(-1)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:13}}>{t('desafio.back')}</button>
    </div>
  );

  return null;
}