import React, { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { AudioLines, Camera, CameraOff, LogOut, Mic, MicOff, Radio, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com';
const primary = { border:0, borderRadius:13, background:'linear-gradient(135deg,#f1b52b,#c77c15)', color:'#241332', fontWeight:850, padding:'13px 14px', display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', fontSize:14 };
const secondary = { border:'1px solid rgba(255,255,255,.35)', borderRadius:13, background:'rgba(255,255,255,.1)', color:'#fff', fontWeight:750, padding:'13px 14px', display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', fontSize:14 };

export default function LiveStream() {
  const { user, token } = useAuth();
  const roomRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteMediaRef = useRef(null);
  const audioRef = useRef(null);
  const listenOnlyRef = useRef(false);
  const [connected, setConnected] = useState(false);
  const [hosting, setHosting] = useState(false);
  const [listenOnly, setListenOnly] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [people, setPeople] = useState(0);
  const [message, setMessage] = useState('Entre para participar da oração ao vivo.');
  const canHost = user?.role === 'pastor' || user?.role === 'admin';

  const clearMedia = () => {
    remoteMediaRef.current?.replaceChildren();
    audioRef.current?.replaceChildren();
  };
  const updatePeople = room => setPeople(room.remoteParticipants.size + 1);
  const attachTrack = track => {
    const element = track.attach();
    if (track.kind === Track.Kind.Audio) {
      element.autoplay = true;
      audioRef.current?.appendChild(element);
    } else if (!listenOnlyRef.current && remoteMediaRef.current) {
      element.autoplay = true; element.playsInline = true;
      element.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:18px;';
      remoteMediaRef.current.replaceChildren(element);
    }
  };

  const enter = async ({ host = false, audioOnly = false } = {}) => {
    try {
      setMessage('A ligar à sala de oração...');
      const response = await fetch(`${API_URL}/api/calls/prayer-room-token`, {
        method:'POST', headers:{ Authorization:`Bearer ${token || localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível entrar na sala.');
      if (host && !data.canHost) throw new Error('Apenas o pastor ou administrador pode iniciar a oração ao vivo.');
      const room = new Room({ adaptiveStream:true, dynacast:true, disconnectOnPageLeave:true });
      roomRef.current = room;
      setHosting(host); setListenOnly(audioOnly); listenOnlyRef.current = audioOnly;
      room.on(RoomEvent.TrackSubscribed, track => attachTrack(track));
      room.on(RoomEvent.TrackUnsubscribed, track => track.detach());
      room.on(RoomEvent.ParticipantConnected, () => updatePeople(room));
      room.on(RoomEvent.ParticipantDisconnected, () => updatePeople(room));
      room.on(RoomEvent.Disconnected, () => { clearMedia(); setConnected(false); setPeople(0); setMessage('A oração terminou ou a ligação foi encerrada.'); });
      await room.connect(data.url, data.token);
      updatePeople(room);
      if (host) {
        await room.localParticipant.setMicrophoneEnabled(true);
        await room.localParticipant.setCameraEnabled(!audioOnly);
        const camera = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (camera?.track && localVideoRef.current) camera.track.attach(localVideoRef.current);
        setCameraOff(audioOnly); setMuted(false);
        setMessage(audioOnly ? 'Rádio de oração ao vivo iniciado.' : 'Vídeo de oração ao vivo iniciado.');
      } else setMessage(audioOnly ? 'Você está a ouvir a oração ao vivo.' : 'Você entrou na sala de oração.');
      setConnected(true);
    } catch (error) {
      roomRef.current?.disconnect(); roomRef.current = null;
      setMessage(error.message || 'Não foi possível entrar na sala de oração.');
    }
  };

  const leave = () => roomRef.current?.disconnect();
  const toggleMic = async () => { const next=!muted; await roomRef.current?.localParticipant.setMicrophoneEnabled(!next); setMuted(next); };
  const toggleCamera = async () => { const next=!cameraOff; await roomRef.current?.localParticipant.setCameraEnabled(!next); setCameraOff(next); };
  useEffect(() => () => roomRef.current?.disconnect(), []);

  return <main style={{minHeight:'100vh',background:'radial-gradient(circle at top,#39205a,#100d1d 62%)',color:'#fff',padding:'36px 18px'}}>
    <section style={{maxWidth:1050,margin:'0 auto'}}>
      <header style={{textAlign:'center',marginBottom:24}}>
        <span style={{display:'inline-flex',gap:8,alignItems:'center',padding:'7px 13px',borderRadius:999,background:'rgba(255,255,255,.12)',color:'#f5cf62',fontWeight:800,fontSize:13}}><Radio size={16}/> SALA DE ORAÇÃO AO VIVO</span>
        <h1 style={{margin:'14px 0 8px',fontSize:'clamp(30px,5vw,52px)'}}>Oremos juntos</h1>
        <p style={{margin:0,color:'#d7cae9',fontSize:17}}>O pastor pode transmitir em vídeo ou somente em áudio. Todos podem ouvir e orar juntos.</p>
      </header>
      <div style={{display:'grid',gridTemplateColumns:'minmax(0,2fr) minmax(260px,1fr)',gap:22}}>
        <div style={{borderRadius:24,overflow:'hidden',minHeight:430,background:'#171125',border:'1px solid rgba(255,255,255,.14)',position:'relative'}}>
          <div ref={remoteMediaRef} style={{position:'absolute',inset:0,display:'grid',placeItems:'center'}}>
            {hosting && !cameraOff ? <video ref={localVideoRef} autoPlay muted playsInline style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div style={{textAlign:'center',padding:30}}><Radio size={52} color="#f5cf62"/><h2>{connected?'Aguardando o pastor iniciar':'Sala pronta para oração'}</h2><p style={{color:'#d7cae9'}}>Você pode entrar em vídeo ou só ouvir, como numa rádio cristã.</p></div>}
          </div>
          {connected && <><div style={{position:'absolute',top:16,left:16,display:'flex',gap:8,alignItems:'center',background:'#d83b4d',padding:'7px 11px',borderRadius:999,fontWeight:800,fontSize:13}}><span style={{width:8,height:8,borderRadius:'50%',background:'#fff'}}/> AO VIVO</div><div style={{position:'absolute',top:16,right:16,display:'flex',gap:7,alignItems:'center',background:'rgba(0,0,0,.52)',padding:'7px 11px',borderRadius:999,fontWeight:700,fontSize:13}}><Users size={16}/> {people}</div></>}
        </div>
        <aside style={{borderRadius:24,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.14)',padding:22,alignSelf:'start'}}>
          <h2 style={{marginTop:0,fontSize:23}}>{hosting?'Você está a conduzir':'Participe da oração'}</h2><p style={{color:'#d7cae9',lineHeight:1.55}}>{message}</p>
          {!connected ? <div style={{display:'grid',gap:11}}>
            {canHost && <><button onClick={()=>enter({host:true})} style={primary}><Camera size={18}/> Iniciar vídeo de oração</button><button onClick={()=>enter({host:true,audioOnly:true})} style={secondary}><AudioLines size={18}/> Iniciar como rádio</button></>}
            <button onClick={()=>enter()} style={secondary}><Camera size={18}/> Entrar e assistir</button><button onClick={()=>enter({audioOnly:true})} style={secondary}><Radio size={18}/> Ouvir como rádio</button>
          </div> : <div style={{display:'grid',gap:11}}>{hosting && <div style={{display:'flex',gap:10}}><button onClick={toggleMic} style={circle}>{muted?<MicOff/>:<Mic/>}</button><button onClick={toggleCamera} style={circle}>{cameraOff?<CameraOff/>:<Camera/>}</button></div>}<button onClick={leave} style={{...secondary,borderColor:'rgba(255,120,130,.55)',color:'#ffd5d8'}}><LogOut size={18}/> Sair da sala</button></div>}
          <p style={{fontSize:12,color:'#bcaed2',lineHeight:1.45,marginTop:20}}>Use o modo rádio quando quiser poupar internet ou apenas escutar a oração.</p>
        </aside>
      </div>
    </section><div ref={audioRef}/>
  </main>;
}

const circle = {width:48,height:48,borderRadius:'50%',border:'1px solid rgba(255,255,255,.35)',background:'rgba(255,255,255,.11)',color:'#fff',display:'grid',placeItems:'center',cursor:'pointer'};
