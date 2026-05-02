import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Church } from "lucide-react";

export default function Profile() {
  const { userId, id } = useParams();
  const navigate = useNavigate();
  const targetId = userId || id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetId) { setLoading(false); return; }
    const token = localStorage.getItem("token");
    const API = (import.meta.env.VITE_API_URL || "") + "/api";
    fetch(API + "/profile/" + targetId, {
      headers: token ? { Authorization: "Bearer " + token } : {}
    })
      .then(r => r.json())
      .then(d => { setProfile(d.user || d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [targetId]);

  if (loading) return (
    <div style={{display:"flex",justifyContent:"center",padding:"80px"}}>
      <Loader2 className="animate-spin" size={36} color="#6c63ff" />
    </div>
  );

  if (!profile) return (
    <div style={{textAlign:"center",padding:"60px",color:"#888"}}>
      <p style={{fontSize:"18px"}}>Perfil não encontrado</p>
      <button onClick={()=>navigate(-1)} style={{marginTop:"16px",background:"#6c63ff",color:"white",border:"none",borderRadius:"8px",padding:"10px 20px",cursor:"pointer"}}>
        ← Voltar
      </button>
    </div>
  );

  return (
    <div style={{maxWidth:"700px",margin:"0 auto",padding:"20px"}}>
      <button onClick={()=>navigate(-1)} style={{display:"flex",alignItems:"center",gap:"6px",background:"none",border:"none",cursor:"pointer",color:"#6c63ff",fontWeight:"700",fontSize:"15px",marginBottom:"20px"}}>
        <ArrowLeft size={18}/> Voltar
      </button>

      <div style={{background:"#fff",borderRadius:"20px",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",overflow:"hidden"}}>
        <div style={{height:"130px",background:"linear-gradient(135deg,#6c63ff,#a78bfa)"}}/>
        <div style={{padding:"0 28px 28px",marginTop:"-55px"}}>
          <img
            src={profile.avatar_url||"/pro.jpg"}
            style={{width:"100px",height:"100px",borderRadius:"50%",objectFit:"cover",border:"4px solid white",boxShadow:"0 2px 10px rgba(0,0,0,0.1)"}}
            onError={e=>e.target.src="/pro.jpg"}
          />
          <h1 style={{fontSize:"24px",fontWeight:"800",margin:"14px 0 4px",color:"#1a1a1a"}}>
            {profile.full_name||"Membro"}
          </h1>
          <p style={{color:"#999",margin:"0 0 16px",fontSize:"14px"}}>{profile.email||""}</p>

          {profile.church_name && (
            <div style={{display:"flex",alignItems:"center",gap:"8px",color:"#555",marginBottom:"12px"}}>
              <Church size={16}/> <span>{profile.church_name}</span>
            </div>
          )}

          {profile.bio && (
            <div style={{background:"#f7f7f7",borderRadius:"12px",padding:"16px",marginTop:"16px"}}>
              <p style={{margin:0,color:"#333",lineHeight:"1.6"}}>{profile.bio}</p>
            </div>
          )}

          {!profile.bio && (
            <p style={{color:"#bbb",fontStyle:"italic"}}>Sem biografia disponível.</p>
          )}
        </div>
      </div>
    </div>
  );
}
