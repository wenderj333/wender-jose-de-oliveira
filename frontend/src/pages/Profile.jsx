import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, MapPin, Church } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const targetId = userId || currentUser?.id;

  useEffect(() => {
    if (!targetId || !token) return;
    async function loadProfile() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch(`${API}/profile/${targetId}`, { headers });
        if (!res.ok) throw new Error("Perfil nao encontrado");
        const data = await res.json();
        setProfile(data.user || data);
      } catch (err) {
        console.error("Erro no Perfil:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [targetId, token]);

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:"100px" }}>
      <Loader2 className="animate-spin" size={32} color="#6c63ff" />
    </div>
  );

  if (error || !profile) return (
    <div style={{ textAlign:"center", padding:"50px", color:"#888" }}>
      Erro ao carregar perfil. Verifique sua conexao.
    </div>
  );

  return (
    <div style={{ maxWidth:"800px", margin:"0 auto", padding:"20px" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"20px", backgroundColor:"#fff", padding:"30px", borderRadius:"12px", boxShadow:"0 2px 10px rgba(0,0,0,0.1)" }}>
        <img
          src={profile.avatar_url || "/pro.jpg"}
          style={{ width:"120px", height:"120px", borderRadius:"50%", objectFit:"cover", border:"3px solid #6c63ff" }}
          onError={e => e.target.src = "/pro.jpg"}
        />
        <div style={{ textAlign:"center" }}>
          <h1 style={{ fontSize:"24px", fontWeight:"bold", margin:"0" }}>{profile.full_name || "Usuario"}</h1>
          <p style={{ color:"#8e8e8e", margin:"5px 0" }}>{profile.email || ""}</p>
        </div>
        <div style={{ width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"15px", marginTop:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", color:"#444" }}>
            <Church size={18} /> <span>{profile.church_name || "Igreja nao informada"}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", color:"#444" }}>
            <MapPin size={18} /> <span>Membro da comunidade</span>
          </div>
        </div>
        <div style={{ width:"100%", marginTop:"20px", padding:"15px", backgroundColor:"#f9f9f9", borderRadius:"8px" }}>
          <h3 style={{ fontSize:"14px", fontWeight:"bold", marginBottom:"5px", color:"#666" }}>Sobre</h3>
          <p style={{ margin:"0", fontSize:"15px" }}>{profile.bio || "Sem biografia disponivel."}</p>
        </div>
      </div>
    </div>
  );
}
