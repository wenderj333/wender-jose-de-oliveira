import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Settings, Grid, Loader2 } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const { id: paramId } = useParams();
  const { token, user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const memberId = paramId || authUser?.id;

  useEffect(() => {
    async function load() {
      if (!memberId) return;
      try {
        const res = await fetch(`${API}/profile/${memberId}`, {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        setMember(data.user || authUser);
      } catch (err) { 
        setMember(authUser); 
      } finally { setLoading(false); }
    }
    load();
  }, [memberId, token, authUser]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "30px 20px", background: "#fff", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", marginBottom: "44px", alignItems: "center" }}>
        <div style={{ flex: "1", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", border: "1px solid #dbdbdb" }}>
            <img 
              src={member?.avatar_url || "/pro.jpg"} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              onError={(e) => e.target.src = "/pro.jpg"} 
            />
          </div>
        </div>
        <div style={{ flex: "2", paddingLeft: "20px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "300", marginBottom: "20px" }}>{member?.username || "Usuário"}</h2>
          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            <span><strong>0</strong> publicações</span>
            <span><strong>0</strong> seguidores</span>
            <span><strong>0</strong> seguindo</span>
          </div>
          <div style={{ fontWeight: "600" }}>{member?.full_name}</div>
          <p>{member?.bio || "Sigo com fé 🙏"}</p>
        </div>
      </header>
      <div style={{ borderTop: "1px solid #dbdbdb", textAlign: "center", padding: "20px", color: "#8e8e8e" }}>
        <Grid size={16} style={{ verticalAlign: "middle", marginRight: "5px" }} /> PUBLICACIONES
      </div>
    </div>
  );
}
