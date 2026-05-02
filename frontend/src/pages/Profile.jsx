import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Profile() {
  const params = useParams();
  const navigate = useNavigate();
  const targetId = params.id || params.userId;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!targetId) { setErro("ID nao encontrado: " + JSON.stringify(params)); setLoading(false); return; }
    const token = localStorage.getItem("token");
    const url = "https://sigo-com-fe-api.onrender.com/api/profile/" + targetId;
    setErro("Carregando: " + url);
    fetch(url, { headers: token ? { Authorization: "Bearer " + token } : {} })
      .then(r => { setErro("Status: " + r.status); return r.json(); })
      .then(d => { setProfile(d.user || d); setErro(""); setLoading(false); })
      .catch(e => { setErro("Erro: " + e.message); setLoading(false); });
  }, [targetId]);

  return (
    <div style={{padding:"30px", maxWidth:"700px", margin:"0 auto"}}>
      <button onClick={()=>navigate(-1)} style={{marginBottom:"20px", background:"#6c63ff", color:"white", border:"none", borderRadius:"8px", padding:"8px 16px", cursor:"pointer"}}>
        ← Voltar
      </button>

      {loading && <p style={{color:"#666"}}>A carregar perfil...</p>}
      {erro && <p style={{color:"orange", background:"#fff8e1", padding:"10px", borderRadius:"8px"}}>{erro}</p>}

      {profile && (
        <div style={{background:"white", borderRadius:"16px", boxShadow:"0 4px 20px rgba(0,0,0,0.08)", overflow:"hidden"}}>
          <div style={{height:"120px", background:"linear-gradient(135deg,#6c63ff,#a78bfa)"}}/>
          <div style={{padding:"0 24px 24px", marginTop:"-50px"}}>
            <img
              src={profile.avatar_url || "/pro.jpg"}
              style={{width:"90px", height:"90px", borderRadius:"50%", objectFit:"cover", border:"4px solid white"}}
              onError={e=>e.target.src="/pro.jpg"}
            />
            <h1 style={{fontSize:"22px", fontWeight:"800", margin:"12px 0 4px"}}>{profile.full_name || "Membro"}</h1>
            <p style={{color:"#999", margin:"0 0 12px"}}>{profile.email}</p>
            {profile.church_name && <p style={{color:"#555"}}>⛪ {profile.church_name}</p>}
            {profile.bio && <p style={{color:"#333", marginTop:"12px"}}>{profile.bio}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
