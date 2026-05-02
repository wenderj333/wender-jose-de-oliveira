import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, MapPin, Church, ArrowLeft } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: "Bearer " + token } : {};

    fetch(`${API}/profile/${userId}`, { headers })
      .then(res => res.json())
      .then(data => {
        setProfile(data.user || data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro:", err);
        setError("Erro ao carregar perfil");
        setLoading(false);
      });
  }, [userId]);

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:"100px" }}>
      <Loader2 className="animate-spin" size={32} color="#6c63ff" />
    </div>
  );

  if (error || !profile) return (
    <div style={{ textAlign:"center", padding:"50px", color:"#888" }}>
      <p>Erro ao carregar perfil.</p>
      <button onClick={() => navigate(-1)} style={{ background:"#6c63ff", color:"white", border:"none", borderRadius:"8px", padding:"8px 16px", cursor:"pointer" }}>Voltar</button>
    </div>
  );

  return (
    <div style={{ maxWidth:"800px", margin:"0 auto", padding:"20px" }}>
      <button onClick={() => navigate(-1)} style={{ display:"flex", alignItems:"center", gap:"6px", background:"none", border:"none", cursor:"pointer", color:"#6c63ff", marginBottom:"16px", fontWeight:"600" }}>
        <ArrowLeft size={18} /> Voltar
      </button>
      <div style={{ background:"#fff", borderRadius:"16px", boxShadow:"0 2px 12px rgba(0,0,0,0.1)", overflow:"hidden" }}>
        <div style={{ height:"120px", background:"linear-gradient(135deg, #6c63ff, #a78bfa)" }}></div>
        <div style={{ padding:"0 24px 24px", marginTop:"-50px" }}>
          <img
            src={profile.avatar_url || "/pro.jpg"}
            style={{ width:"90px", height:"90px", borderRadius:"50%", objectFit:"cover", border:"4px solid white", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}
            onError={e => e.target.src = "/pro.jpg"}
          />
          <h1 style={{ fontSize:"22px", fontWeight:"800", margin:"12px 0 4px" }}>{profile.full_name || "Membro"}</h1>
          <p style={{ color:"#888", margin:"0 0 16px" }}>{profile.email || ""}</p>

          <div style={{ display:"flex", gap:"16px", flexWrap:"wrap", marginBottom:"16px" }}>
            {profile.church_name && (
              <div style={{ display:"flex", alignItems:"center", gap:"6px", color:"#555" }}>
                <Church size={16} /> <span>{profile.church_name}</span>
              </div>
            )}
          </div>

          {profile.bio && (
            <div style={{ background:"#f9f9f9", borderRadius:"10px", padding:"14px" }}>
              <p style={{ margin:"0", color:"#333" }}>{profile.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
