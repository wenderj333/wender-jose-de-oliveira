import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Mic, MicOff, Video, VideoOff, Users, Send, X, Radio } from "lucide-react";

export default function LiveStream() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [viewers, setViewers] = useState(Math.floor(Math.random()*50)+10);
  const [messages, setMessages] = useState([
    {id:1, name:"Maria", text:"Aleluia! Que bencao!", color:"#f39c12"},
    {id:2, name:"Joao", text:"Amen! Deus seja louvado!", color:"#27ae60"},
    {id:3, name:"Ana", text:"Que bencao!", color:"#e74c3c"},
  ]);
  const [input, setInput] = useState("");
  const [reactions, setReactions] = useState([]);
  const chatEndRef = useRef(null);
  const streamRef = useRef(null);
  const reactionId = useRef(0);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);
  useEffect(() => {
    const i = setInterval(() => setViewers(v => Math.max(1, v + Math.floor(Math.random()*3)-1)), 5000);
    return () => clearInterval(i);
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com';
  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLive(true);
      await fetch(API_URL + '/api/live-community/start', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId: user.uid, userName: user.full_name || user.displayName, userAvatar: user.photoURL, title: 'Live ao Vivo' })
      });
    } catch(e) { alert("Nao foi possivel aceder a camara"); }
  };

  const stopStream = async () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsLive(false);
    const API_URL = import.meta.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com';
    await fetch(API_URL + '/api/live-community/stop', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId: user.uid })
    });
  };
  const toggleMute = () => { streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; }); setIsMuted(m => !m); };
  const toggleCam = () => { streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; }); setIsCamOff(c => !c); };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id:Date.now(), name:user.full_name?.split(" ")[0]||"Eu", text:input, color:"#667eea" }]);
    setInput("");
  };

  const addReaction = (emoji, label) => {
    const id = reactionId.current++;
    setReactions(prev => [...prev, { id, emoji, x:Math.random()*60+20 }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 2500);
    setMessages(prev => [...prev, { id:Date.now(), name:user.full_name?.split(" ")[0]||"Eu", text:emoji+" "+label, color:"#f39c12" }]);
  };

  const REACTIONS = [
    { emoji:"🙏", label:"Aleluia" },
    { emoji:"🙌", label:"Amen" },
    { emoji:"✝️", label:"Deus seja louvado" },
    { emoji:"❤️", label:"Amor" },
    { emoji:"🔥", label:"Fogo" },
  ];

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"#000", zIndex:1000, display:"flex", flexDirection:"column" }}>
      <div style={{ flex:1, position:"relative" }}>
        <video ref={videoRef} autoPlay muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        {!isLive && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
            <div style={{ fontSize:64 }}>📡</div>
            <p style={{ color:"white", fontSize:22, fontWeight:700 }}>Pronto para transmitir?</p>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:15, textAlign:"center", maxWidth:300 }}>Partilha a tua fe com o mundo</p>
            <button onClick={startStream} style={{ padding:"14px 40px", borderRadius:50, border:"none", background:"linear-gradient(135deg,#e74c3c,#c0392b)", color:"white", fontWeight:700, fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
              <Radio size={20}/> Iniciar Live
            </button>
          </div>
        )}
        {isLive && (
          <div style={{ position:"absolute", top:0, left:0, right:0, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"linear-gradient(to bottom,rgba(0,0,0,0.6),transparent)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"#e74c3c", borderRadius:20, padding:"4px 12px" }}>
                <span style={{ width:8, height:8, background:"white", borderRadius:"50%", display:"inline-block" }}></span>
                <span style={{ color:"white", fontSize:13, fontWeight:700 }}>AO VIVO</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,0.5)", borderRadius:20, padding:"4px 12px" }}>
                <Users size={14} color="white"/>
                <span style={{ color:"white", fontSize:13 }}>{viewers}</span>
              </div>
            </div>
            <button onClick={stopStream} style={{ background:"rgba(0,0,0,0.5)", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={18} color="white"/>
            </button>
          </div>
        )}
        {isLive && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"20px", background:"linear-gradient(to top,rgba(0,0,0,0.7),transparent)" }}>
            <div style={{ display:"flex", gap:10, marginBottom:16, justifyContent:"center" }}>
              {REACTIONS.map(r => (
                <button key={r.label} onClick={() => addReaction(r.emoji, r.label)} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:50, padding:"10px 16px", cursor:"pointer", fontSize:22 }}>
                  {r.emoji}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:16 }}>
              <button onClick={toggleMute} style={{ background:isMuted?"#e74c3c":"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%", width:56, height:56, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                {isMuted ? <MicOff size={22} color="white"/> : <Mic size={22} color="white"/>}
              </button>
              <button onClick={stopStream} style={{ background:"#e74c3c", border:"none", borderRadius:"50%", width:72, height:72, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <Radio size={28} color="white"/>
              </button>
              <button onClick={toggleCam} style={{ background:isCamOff?"#e74c3c":"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%", width:56, height:56, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                {isCamOff ? <VideoOff size={22} color="white"/> : <Video size={22} color="white"/>}
              </button>
            </div>
          </div>
        )}
        {reactions.map(r => (
          <div key={r.id} style={{ position:"absolute", bottom:120, left:r.x+"%", fontSize:36, pointerEvents:"none" }}>{r.emoji}</div>
        ))}
      </div>
      <div style={{ width:"100%", height:280, display:"flex", flexDirection:"column", background:"rgba(0,0,0,0.85)", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ padding:"16px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color:"white", fontWeight:700, fontSize:15 }}>💬 Chat ao Vivo</p>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:8 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:msg.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"white", flexShrink:0 }}>
                {msg.name.charAt(0)}
              </div>
              <div>
                <span style={{ color:msg.color, fontSize:12, fontWeight:700 }}>{msg.name} </span>
                <span style={{ color:"white", fontSize:13 }}>{msg.text}</span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef}/>
        </div>
        <div style={{ padding:12, borderTop:"1px solid rgba(255,255,255,0.1)", display:"flex", gap:8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && sendMessage()} placeholder="Escreve uma mensagem..." style={{ flex:1, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:20, padding:"8px 14px", color:"white", fontSize:13, outline:"none" }}/>
          <button onClick={sendMessage} style={{ background:"#6C3FA0", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Send size={16} color="white"/>
          </button>
        </div>
      </div>
    </div>
  );
}