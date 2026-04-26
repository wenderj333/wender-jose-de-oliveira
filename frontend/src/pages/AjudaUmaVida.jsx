import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return mins + " min";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h";
  return Math.floor(hours / 24) + "d";
}

const TYPE_CONFIG = {
  request:   { label: "🙏 Peticao",    color: "#6c47d4", bg: "#f3eeff" },
  testimony: { label: "💛 Testemunho", color: "#c9a84c", bg: "#fffbec" },
  gratitude: { label: "✨ Gratidao",   color: "#1e8a5a", bg: "#edfff5" },
  offer:     { label: "❤️ Ajuda",      color: "#d44747", bg: "#fff0f0" },
};

export default function AjudaUmaVida() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const feedRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("request");
  const [isAnon, setIsAnon] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [helpedCount] = useState(()=>parseInt(localStorage.getItem("helped_count")||"0"));
  const [submitting, setSubmitting] = useState(false);
  const [prayedIds, setPrayedIds] = useState(new Set());
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({ total: 0, prayers: 0, helping: 0 });

  const authHeaders = token ? { Authorization: "Bearer " + token } : {};

  useEffect(() => { loadPosts(); }, [activeTab]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const url = activeTab === "all" ? API+"/help-posts" : API+"/help-posts?type="+activeTab;
      const res = await fetch(url, { headers: authHeaders });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
      setStats({ total: data.length||0, prayers: data.reduce((a,p)=>a+(p.prayer_count||0),0), helping: 0 });
    } catch(e) { setPosts([]); }
    setLoading(false);
  };

  const handlePray = async (postId) => {
    if (!user) return alert("Faz login para orar!");
    try {
      await fetch(API+"/help-posts/"+postId+"/pray", { method:"POST", headers:authHeaders });
      setPrayedIds(prev => new Set([...prev, postId]));
      setPosts(prev => prev.map(p => p.id===postId ? {...p, prayer_count:(p.prayer_count||0)+1} : p));
      setSuccessMsg(t("ajuda.prayerSent","+1 oracao enviada. Esta pessoa nao esta sozinha."));
      setTimeout(() => setSuccessMsg(""), 4000);
      if (navigator.vibrate) navigator.vibrate(50);
      const hc = parseInt(localStorage.getItem("helped_count")||"0")+1;
      localStorage.setItem("helped_count", hc);
    } catch(e) {}
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!user) return alert("Faz login para publicar!");
    setSubmitting(true);
    try {
      const res = await fetch(API+"/help-posts", { method:"POST", headers:{...authHeaders,"Content-Type":"application/json"}, body:JSON.stringify({content, type:postType, is_anonymous:isAnon, is_urgent:isUrgent}) });
      setContent(""); setShowForm(false);
      setSuccessMsg(t("ajuda.requestReceived","O teu pedido foi recebido. Pessoas vao orar por ti."));
      setTimeout(()=>setSuccessMsg(""),5000);
      await loadPosts();
    } catch(e) {}
    setSubmitting(false);
  };

  const TABS = [
    { key:"all", label:"Todos" },
    { key:"request", label:"Peticoes" },
    { key:"testimony", label:"Testemunhos" },
    { key:"gratitude", label:"Gratidao" },
  ];

  const QUICK = [
    { icon:"🙏", label:"Pedir ajuda agora", color:"#6c47d4", action:()=>{setPostType("request");setShowForm(true);} },
    { icon:"🤲", label:"Orar por alguem", color:"#e67e22", action:()=>setActiveTab("request") },
    { icon:"🤝", label:"Oferecer ajuda", color:"#27ae60", action:()=>{setPostType("offer");setShowForm(true);} },
    { icon:"💛", label:"Partilhar testemunho", color:"#c9a84c", action:()=>{setPostType("testimony");setShowForm(true);} },
  ];

  return (
    <div style={{maxWidth:680,margin:"0 auto",padding:"0 0 40px",fontFamily:"Segoe UI,sans-serif"}}>

      {/* HERO */}
      <div style={{background:"linear-gradient(135deg,#1a0a3e,#4A2270,#6c47d4)",borderRadius:"0 0 28px 28px",padding:"32px 24px 28px",textAlign:"center",color:"white",marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,right:0,fontSize:120,opacity:0.06,lineHeight:1}}>🕊️</div>
        <div style={{position:"relative",zIndex:1}}>
          <p style={{margin:"0 0 6px",fontSize:"0.75rem",opacity:0.7,letterSpacing:2,textTransform:"uppercase"}}>✨ Sigo com Fe</p>
          <h1 style={{margin:"0 0 8px",fontSize:"clamp(1.4rem,4vw,2rem)",fontWeight:900}}>🕊️ Ajuda uma Vida</h1>
          <p style={{opacity:0.85,fontSize:14,margin:"0 0 16px"}}>Seja resposta de oracao na vida de alguem</p>
          {helpedCount > 0 && <p style={{color:"#f0c040",fontWeight:700,fontSize:13,margin:"0 0 8px"}}>✨ Hoje ajudaste {helpedCount} {helpedCount===1?"pessoa":"pessoas"}</p>}
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <div style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"6px 16px",fontSize:13,fontWeight:700}}>
              🔥 {stats.helping} pessoas ajudando agora
            </div>
            <div style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"6px 16px",fontSize:13,fontWeight:700}}>
              🙏 {stats.prayers} oracoes hoje
            </div>
          </div>
        </div>
      </div>

      {/* MENSAGEM SUCESSO */}
      {successMsg && (
        <div style={{background:"linear-gradient(135deg,#27ae60,#1e8a5a)",borderRadius:14,padding:"14px 20px",marginBottom:16,color:"white",fontWeight:700,textAlign:"center",fontSize:15}}>
          {successMsg}
        </div>
      )}

      {/* 4 ACOES RAPIDAS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"0 16px",marginBottom:20}}>
        {QUICK.map((q,i) => (
          <button key={i} onClick={q.action} style={{background:"white",borderRadius:16,padding:16,border:"2px solid "+q.color+"33",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <div style={{fontSize:28,marginBottom:6}}>{q.icon}</div>
            <p style={{color:q.color,fontWeight:800,margin:0,fontSize:13}}>{q.label}</p>
          </button>
        ))}
      </div>

      {/* FORMULARIO */}
      {showForm && (
        <div style={{background:"linear-gradient(135deg,#1a0a3e,#2d1054)",borderRadius:16,padding:20,margin:"0 16px 20px",color:"white"}}>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            {["request","testimony","gratitude","offer"].map(type => (
              <button key={type} onClick={()=>setPostType(type)} style={{padding:"6px 14px",borderRadius:20,border:"none",background:postType===type?"#f0c040":"rgba(255,255,255,0.15)",color:postType===type?"#1a0a3e":"white",fontWeight:700,cursor:"pointer",fontSize:12}}>
                {TYPE_CONFIG[type]?.label || type}
              </button>
            ))}
          </div>
          <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Partilha o teu pedido ou testemunho..." style={{width:"100%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,padding:12,color:"white",fontSize:14,resize:"none",outline:"none",boxSizing:"border-box"}} rows={4}/>
          <div style={{display:"flex",gap:10,marginTop:10,alignItems:"center"}}>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:"rgba(255,255,255,0.8)"}}>
              <input type="checkbox" checked={isAnon} onChange={e=>setIsAnon(e.target.checked)}/> Anonimo
            </label>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:"rgba(255,100,100,0.9)"}}>
              <input type="checkbox" checked={isUrgent} onChange={e=>setIsUrgent(e.target.checked)}/> 🔴 Urgente
            </label>
            <button onClick={handleSubmit} disabled={submitting} style={{flex:1,padding:"10px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#f0c040,#e67e22)",color:"#1a0a3e",fontWeight:900,cursor:"pointer",fontSize:14}}>
              {submitting ? "..." : "Publicar 🙏"}
            </button>
            <button onClick={()=>setShowForm(false)} style={{padding:"10px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,0.3)",background:"transparent",color:"white",cursor:"pointer",fontSize:13}}>✕</button>
          </div>
        </div>
      )}

      {/* BOTAO PUBLICAR */}
      {!showForm && (
        <div style={{padding:"0 16px",marginBottom:16,textAlign:"center"}}>
          <button onClick={()=>setShowForm(true)} style={{padding:"12px 32px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#6c47d4,#4A2270)",color:"white",fontWeight:900,cursor:"pointer",fontSize:15,boxShadow:"0 4px 15px rgba(108,71,212,0.4)"}}>
            ✍️ Partilhar pedido ou testemunho
          </button>
        </div>
      )}

      {/* FILTROS */}
      <div style={{display:"flex",gap:8,padding:"0 16px",marginBottom:16,overflowX:"auto"}}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={()=>setActiveTab(tab.key)} style={{padding:"8px 16px",borderRadius:20,border:"none",background:activeTab===tab.key?"linear-gradient(135deg,#6c47d4,#4A2270)":"rgba(108,71,212,0.1)",color:activeTab===tab.key?"white":"#6c47d4",fontWeight:700,cursor:"pointer",fontSize:13,whiteSpace:"nowrap"}}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* LISTA DE POSTS */}
      <div ref={feedRef} style={{padding:"0 16px"}}>
        {loading ? (
          <div style={{textAlign:"center",padding:40,color:"#6c47d4"}}>🙏 A carregar...</div>
        ) : posts.length === 0 ? (
          <div style={{textAlign:"center",padding:40,color:"#aaa",background:"white",borderRadius:16}}>
            <div style={{fontSize:40,marginBottom:12}}>🕊️</div>
            <p>Nenhum pedido ainda. Sê o primeiro!</p>
          </div>
        ) : posts.map(post => {
          const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.request;
          const prayed = prayedIds.has(post.id);
          return (
            <div key={post.id} style={{background:"white",borderRadius:16,padding:16,marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:post.is_urgent?"2px solid #e74c3c":"1px solid #f0eaff",position:"relative"}}>
              {post.is_urgent && <div style={{background:"#e74c3c",color:"white",fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:20,marginBottom:8,display:"inline-block"}}>🔴 URGENTE</div>}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                {post.avatar_url ? (
                  <img src={post.avatar_url} style={{width:38,height:38,borderRadius:"50%",objectFit:"cover"}}/>
                ) : (
                  <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#6c47d4,#4A2270)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:16,flexShrink:0}}>
                    {post.is_anonymous ? "?" : (post.full_name||"?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,margin:0,fontSize:14,color:"#1a0a3e"}}>{post.is_anonymous ? "Anonimo" : (post.full_name||"Anonimo")}</p>
                  <p style={{color:"#aaa",margin:0,fontSize:11}}>{timeAgo(post.created_at)}</p>
                </div>
                <span style={{background:cfg.bg,color:cfg.color,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{cfg.label}</span>
              </div>
              <p style={{color:"#333",fontSize:14,lineHeight:1.6,margin:"0 0 12px"}}>{post.content}</p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{color:"#aaa",fontSize:12}}>🙏 {post.prayer_count||0} pessoas orando</span>
                <button onClick={()=>handlePray(post.id)} disabled={prayed} style={{padding:"8px 18px",borderRadius:20,border:"none",background:prayed?"#eee":"linear-gradient(135deg,#6c47d4,#4A2270)",color:prayed?"#aaa":"white",fontWeight:700,cursor:prayed?"default":"pointer",fontSize:13,transition:"all 0.2s"}}>
                  {prayed ? "✓ Orei" : "🙏 Orar agora"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RODAPE ESPIRITUAL */}
      <div style={{margin:"24px 16px 0",background:"linear-gradient(135deg,#1a0a3e,#2d1054)",borderRadius:20,padding:24,textAlign:"center",color:"white"}}>
        <div style={{fontSize:36,marginBottom:8}}>🕊️</div>
        <p style={{fontWeight:800,fontSize:16,margin:"0 0 6px"}}>Tu nao estas sozinho</p>
        <p style={{opacity:0.7,fontSize:13,margin:0}}>Deus age atraves de pessoas</p>
      </div>
    </div>
  );
}
