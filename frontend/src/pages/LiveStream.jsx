import React, { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { AudioLines, Camera, CameraOff, LogOut, Mic, MicOff, Radio, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com';
const primary = { border:0, borderRadius:13, background:'linear-gradient(135deg,#f1b52b,#c77c15)', color:'#241332', fontWeight:850, padding:'13px 14px', display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', fontSize:14 };
const secondary = { border:'1px solid rgba(255,255,255,.35)', borderRadius:13, background:'rgba(255,255,255,.1)', color:'#fff', fontWeight:750, padding:'13px 14px', display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', fontSize:14 };
const COPY = {
  pt: { badge:'SALA DE ORAÇÃO AO VIVO', title:'Oremos juntos', intro:'O pastor pode transmitir em vídeo ou somente em áudio. Todos podem ouvir e orar juntos.', entering:'A ligar à sala de oração...', unavailable:'Não foi possível entrar na sala.', hostOnly:'Apenas o pastor ou administrador pode iniciar a oração ao vivo.', ended:'A oração terminou ou a ligação foi encerrada.', radioStarted:'Rádio de oração ao vivo iniciado.', videoStarted:'Vídeo de oração ao vivo iniciado.', listening:'Você está a ouvir a oração ao vivo.', joined:'Você entrou na sala de oração.', waiting:'Aguardando o pastor iniciar', ready:'Sala pronta para oração', mode:'Você pode entrar em vídeo ou só ouvir, como numa rádio cristã.', hosting:'Você está a conduzir', participate:'Participe da oração', video:'Iniciar vídeo de oração', radio:'Iniciar como rádio', watch:'Entrar e assistir', listen:'Ouvir como rádio', leave:'Sair da sala', saving:'Use o modo rádio quando quiser poupar internet ou apenas escutar a oração.' },
  es: { badge:'SALA DE ORACIÓN EN VIVO', title:'Oremos juntos', intro:'El pastor puede transmitir en vídeo o solo en audio. Todos pueden escuchar y orar juntos.', entering:'Conectando a la sala de oración...', unavailable:'No fue posible entrar a la sala.', hostOnly:'Solo el pastor o administrador puede iniciar la oración en vivo.', ended:'La oración terminó o la conexión se cerró.', radioStarted:'Radio de oración en vivo iniciada.', videoStarted:'Vídeo de oración en vivo iniciado.', listening:'Estás escuchando la oración en vivo.', joined:'Entraste en la sala de oración.', waiting:'Esperando que el pastor inicie', ready:'Sala lista para orar', mode:'Puedes entrar en vídeo o solo escuchar, como en una radio cristiana.', hosting:'Estás conduciendo', participate:'Participa en la oración', video:'Iniciar vídeo de oración', radio:'Iniciar como radio', watch:'Entrar y ver', listen:'Escuchar como radio', leave:'Salir de la sala', saving:'Usa el modo radio cuando quieras ahorrar internet o solamente escuchar la oración.' },
  en: { badge:'LIVE PRAYER ROOM', title:'Let us pray together', intro:'The pastor can broadcast by video or audio only. Everyone can listen and pray together.', entering:'Connecting to the prayer room...', unavailable:'Could not enter the room.', hostOnly:'Only the pastor or an administrator can start live prayer.', ended:'The prayer ended or the connection was closed.', radioStarted:'Live prayer radio started.', videoStarted:'Live prayer video started.', listening:'You are listening to live prayer.', joined:'You joined the prayer room.', waiting:'Waiting for the pastor to begin', ready:'Prayer room ready', mode:'You can join by video or listen only, like Christian radio.', hosting:'You are leading', participate:'Join the prayer', video:'Start prayer video', radio:'Start as radio', watch:'Join and watch', listen:'Listen as radio', leave:'Leave room', saving:'Use radio mode to save data or simply listen to the prayer.' },
  de: { badge:'LIVE-GEBETSRAUM', title:'Lasst uns gemeinsam beten', intro:'Der Pastor kann per Video oder nur per Audio übertragen. Alle können zuhören und gemeinsam beten.', entering:'Verbindung zum Gebetsraum wird hergestellt...', unavailable:'Der Raum konnte nicht betreten werden.', hostOnly:'Nur Pastor oder Administrator kann das Live-Gebet starten.', ended:'Das Gebet ist beendet oder die Verbindung wurde geschlossen.', radioStarted:'Live-Gebetsradio gestartet.', videoStarted:'Live-Gebetsvideo gestartet.', listening:'Du hörst das Live-Gebet.', joined:'Du bist dem Gebetsraum beigetreten.', waiting:'Warten auf den Pastor', ready:'Gebetsraum ist bereit', mode:'Du kannst per Video teilnehmen oder nur zuhören, wie bei einem christlichen Radio.', hosting:'Du leitest jetzt', participate:'Am Gebet teilnehmen', video:'Gebetsvideo starten', radio:'Als Radio starten', watch:'Beitreten und ansehen', listen:'Als Radio hören', leave:'Raum verlassen', saving:'Nutze den Radiomodus, um Daten zu sparen oder nur dem Gebet zuzuhören.' },
  fr: { badge:'SALLE DE PRIÈRE EN DIRECT', title:'Prions ensemble', intro:'Le pasteur peut transmettre en vidéo ou seulement en audio. Tous peuvent écouter et prier ensemble.', entering:'Connexion à la salle de prière...', unavailable:'Impossible d’entrer dans la salle.', hostOnly:'Seul le pasteur ou un administrateur peut démarrer la prière en direct.', ended:'La prière est terminée ou la connexion a été fermée.', radioStarted:'Radio de prière en direct démarrée.', videoStarted:'Vidéo de prière en direct démarrée.', listening:'Vous écoutez la prière en direct.', joined:'Vous avez rejoint la salle de prière.', waiting:'En attente du pasteur', ready:'Salle de prière prête', mode:'Vous pouvez participer en vidéo ou écouter seulement, comme une radio chrétienne.', hosting:'Vous animez la prière', participate:'Participer à la prière', video:'Démarrer la vidéo de prière', radio:'Démarrer en radio', watch:'Entrer et regarder', listen:'Écouter en radio', leave:'Quitter la salle', saving:'Utilisez le mode radio pour économiser vos données ou seulement écouter la prière.' },
  ro: { badge:'CAMERĂ DE RUGĂCIUNE LIVE', title:'Să ne rugăm împreună', intro:'Pastorul poate transmite video sau doar audio. Toți pot asculta și se pot ruga împreună.', entering:'Conectare la camera de rugăciune...', unavailable:'Nu s-a putut intra în cameră.', hostOnly:'Doar pastorul sau administratorul poate începe rugăciunea live.', ended:'Rugăciunea s-a încheiat sau conexiunea a fost închisă.', radioStarted:'Radio de rugăciune live pornit.', videoStarted:'Video de rugăciune live pornit.', listening:'Asculți rugăciunea live.', joined:'Ai intrat în camera de rugăciune.', waiting:'Se așteaptă pastorul', ready:'Camera de rugăciune este gata', mode:'Poți intra cu video sau doar asculta, ca la un radio creștin.', hosting:'Conduci rugăciunea', participate:'Participă la rugăciune', video:'Pornește video de rugăciune', radio:'Pornește ca radio', watch:'Intră și privește', listen:'Ascultă ca radio', leave:'Ieși din cameră', saving:'Folosește modul radio pentru a economisi internet sau doar pentru a asculta rugăciunea.' },
  ru: { badge:'КОМНАТА ЖИВОЙ МОЛИТВЫ', title:'Помолимся вместе', intro:'Пастор может вести трансляцию с видео или только со звуком. Все могут слушать и молиться вместе.', entering:'Подключение к комнате молитвы...', unavailable:'Не удалось войти в комнату.', hostOnly:'Только пастор или администратор может начать живую молитву.', ended:'Молитва завершилась или соединение закрыто.', radioStarted:'Радио живой молитвы запущено.', videoStarted:'Видео живой молитвы запущено.', listening:'Вы слушаете живую молитву.', joined:'Вы вошли в комнату молитвы.', waiting:'Ожидание начала от пастора', ready:'Комната молитвы готова', mode:'Можно войти с видео или только слушать, как христианское радио.', hosting:'Вы ведёте молитву', participate:'Участвовать в молитве', video:'Начать видео-молитву', radio:'Начать как радио', watch:'Войти и смотреть', listen:'Слушать как радио', leave:'Выйти из комнаты', saving:'Используйте режим радио, чтобы экономить интернет или только слушать молитву.' },
};

export default function LiveStream() {
  const { user, token } = useAuth();
  const { i18n } = useTranslation();
  const c = COPY[i18n.language?.slice(0, 2)] || COPY.pt;
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
  const [message, setMessage] = useState(COPY.pt.participate);
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
      setMessage(c.entering);
      const response = await fetch(`${API_URL}/api/calls/prayer-room-token`, {
        method:'POST', headers:{ Authorization:`Bearer ${token || localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || c.unavailable);
      if (host && !data.canHost) throw new Error(c.hostOnly);
      const room = new Room({ adaptiveStream:true, dynacast:true, disconnectOnPageLeave:true });
      roomRef.current = room;
      setHosting(host); setListenOnly(audioOnly); listenOnlyRef.current = audioOnly;
      room.on(RoomEvent.TrackSubscribed, track => attachTrack(track));
      room.on(RoomEvent.TrackUnsubscribed, track => track.detach());
      room.on(RoomEvent.ParticipantConnected, () => updatePeople(room));
      room.on(RoomEvent.ParticipantDisconnected, () => updatePeople(room));
      room.on(RoomEvent.Disconnected, () => { clearMedia(); setConnected(false); setPeople(0); setMessage(c.ended); });
      await room.connect(data.url, data.token);
      updatePeople(room);
      if (host) {
        await room.localParticipant.setMicrophoneEnabled(true);
        await room.localParticipant.setCameraEnabled(!audioOnly);
        const camera = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (camera?.track && localVideoRef.current) camera.track.attach(localVideoRef.current);
        setCameraOff(audioOnly); setMuted(false);
        setMessage(audioOnly ? c.radioStarted : c.videoStarted);
      } else setMessage(audioOnly ? c.listening : c.joined);
      setConnected(true);
    } catch (error) {
      roomRef.current?.disconnect(); roomRef.current = null;
      setMessage(error.message || c.unavailable);
    }
  };

  const leave = () => roomRef.current?.disconnect();
  const toggleMic = async () => { const next=!muted; await roomRef.current?.localParticipant.setMicrophoneEnabled(!next); setMuted(next); };
  const toggleCamera = async () => { const next=!cameraOff; await roomRef.current?.localParticipant.setCameraEnabled(!next); setCameraOff(next); };
  useEffect(() => () => roomRef.current?.disconnect(), []);

  return <main style={{minHeight:'100vh',background:'radial-gradient(circle at top,#39205a,#100d1d 62%)',color:'#fff',padding:'36px 18px'}}>
    <section style={{maxWidth:1050,margin:'0 auto'}}>
      <header style={{textAlign:'center',marginBottom:24}}>
        <span style={{display:'inline-flex',gap:8,alignItems:'center',padding:'7px 13px',borderRadius:999,background:'rgba(255,255,255,.12)',color:'#f5cf62',fontWeight:800,fontSize:13}}><Radio size={16}/> {c.badge}</span>
        <h1 style={{margin:'14px 0 8px',fontSize:'clamp(30px,5vw,52px)'}}>{c.title}</h1>
        <p style={{margin:0,color:'#d7cae9',fontSize:17}}>{c.intro}</p>
      </header>
      <div style={{display:'grid',gridTemplateColumns:'minmax(0,2fr) minmax(260px,1fr)',gap:22}}>
        <div style={{borderRadius:24,overflow:'hidden',minHeight:430,background:'#171125',border:'1px solid rgba(255,255,255,.14)',position:'relative'}}>
          <div ref={remoteMediaRef} style={{position:'absolute',inset:0,display:'grid',placeItems:'center'}}>
            {hosting && !cameraOff ? <video ref={localVideoRef} autoPlay muted playsInline style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div style={{textAlign:'center',padding:30}}><Radio size={52} color="#f5cf62"/><h2>{connected?c.waiting:c.ready}</h2><p style={{color:'#d7cae9'}}>{c.mode}</p></div>}
          </div>
          {connected && <><div style={{position:'absolute',top:16,left:16,display:'flex',gap:8,alignItems:'center',background:'#d83b4d',padding:'7px 11px',borderRadius:999,fontWeight:800,fontSize:13}}><span style={{width:8,height:8,borderRadius:'50%',background:'#fff'}}/> AO VIVO</div><div style={{position:'absolute',top:16,right:16,display:'flex',gap:7,alignItems:'center',background:'rgba(0,0,0,.52)',padding:'7px 11px',borderRadius:999,fontWeight:700,fontSize:13}}><Users size={16}/> {people}</div></>}
        </div>
        <aside style={{borderRadius:24,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.14)',padding:22,alignSelf:'start'}}>
          <h2 style={{marginTop:0,fontSize:23}}>{hosting?c.hosting:c.participate}</h2><p style={{color:'#d7cae9',lineHeight:1.55}}>{message}</p>
          {!connected ? <div style={{display:'grid',gap:11}}>
            {canHost && <><button onClick={()=>enter({host:true})} style={primary}><Camera size={18}/> {c.video}</button><button onClick={()=>enter({host:true,audioOnly:true})} style={secondary}><AudioLines size={18}/> {c.radio}</button></>}
            <button onClick={()=>enter()} style={secondary}><Camera size={18}/> {c.watch}</button><button onClick={()=>enter({audioOnly:true})} style={secondary}><Radio size={18}/> {c.listen}</button>
          </div> : <div style={{display:'grid',gap:11}}>{hosting && <div style={{display:'flex',gap:10}}><button onClick={toggleMic} style={circle}>{muted?<MicOff/>:<Mic/>}</button><button onClick={toggleCamera} style={circle}>{cameraOff?<CameraOff/>:<Camera/>}</button></div>}<button onClick={leave} style={{...secondary,borderColor:'rgba(255,120,130,.55)',color:'#ffd5d8'}}><LogOut size={18}/> {c.leave}</button></div>}
          <p style={{fontSize:12,color:'#bcaed2',lineHeight:1.45,marginTop:20}}>{c.saving}</p>
        </aside>
      </div>
    </section><div ref={audioRef}/>
  </main>;
}

const circle = {width:48,height:48,borderRadius:'50%',border:'1px solid rgba(255,255,255,.35)',background:'rgba(255,255,255,.11)',color:'#fff',display:'grid',placeItems:'center',cursor:'pointer'};
