import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { Camera, ArrowLeft, Settings, Loader2, User } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const { id: paramId } = useParams();
  const { token, user: authUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // O ID vem da URL ou do usuário logado
  const memberId = paramId || authUser?.id;
  const isOwnProfile = String(authUser?.id) === String(memberId);

  useEffect(() => {
    async function loadProfile() {
      if (!memberId) return;
      setLoading(true);
      try {
        const res = await fetch(`${API}/profile/${memberId}`, {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        
        if (data && data.user) {
          setMember(data.user);
        } else {
          // Fallback caso não encontre
          setMember(authUser);
        }
      } catch (err) {
        console.error("Erro ao carregar:", err);
        setMember(authUser);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [memberId, token, authUser]);

  const handleUpdatePhoto = async () => {
    const newUrl = prompt("Insira o link da nova foto (URL):", member?.avatar_url || "");
    if (!newUrl || newUrl === member?.avatar_url) return;

    setUpdating(true);
    try {
      const res = await fetch(`${API}/profile/photo`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer " + token 
        },
        body: JSON.stringify({ photoURL: newUrl })
      });

      if (res.ok) {
        setMember({ ...member, avatar_url: newUrl });
        alert("Perfil atualizado!");
      } else {
        alert("Erro ao salvar no banco de dados.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px" }}>Carregando Perfil...</div>;

  const avatarUrl = member?.avatar_url || "/pro.jpg";

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "20px", background: "#fff", minHeight: "100vh" }}>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", color: "#666" }}>
        <ArrowLeft size={20} /> Voltar
      </button>

      <header style={{ display: "flex", gap: "40px", flexWrap: "wrap", borderBottom: "1px solid #eee", paddingBottom: "40px" }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", border: "3px solid #FFD700", background: "#f0f0f0" }}>
            <img 
              src={avatarUrl} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              onError={(e) => e.target.src="/pro.jpg"} 
            />
          </div>
          
          {isOwnProfile && (
            <button 
              onClick={handleUpdatePhoto}
              disabled={updating}
              style={{ position: "absolute", bottom: "5px", right: "5px", background: "#FFD700", border: "none", borderRadius: "50%", padding: "8px", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}
            >
              {updating ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
            </button>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "300" }}>{member?.full_name || member?.display_name || "Usuário"}</h2>
            {isOwnProfile && <Settings style={{ cursor: "pointer", color: "#666" }} size={24} />}
          </div>
          <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
            <span><strong>0</strong> publicações</span>
            <span><strong>0</strong> amigos</span>
          </div>
          <div style={{ fontWeight: "700", color: "#FFD700", marginBottom: "10px" }}>{(member?.role || "Membro").toUpperCase()}</div>
          <p style={{ color: "#555", fontSize: "1rem", lineHeight: "1.5" }}>{member?.bio || "Bem-vindo ao meu perfil no Sigo com Fé!"}</p>
          {member?.church_name && <p style={{ fontSize: "0.9rem", color: "#888" }}>⛪ {member.church_name}</p>}
        </div>
      </header>

      <div style={{ textAlign: "center", padding: "80px 20px", color: "#dbdbdb" }}>
        <Camera size={48} style={{ marginBottom: "15px" }} />
        <h3 style={{ color: "#8e8e8e" }}>Nenhuma publicação ainda</h3>
      </div>
    </div>
  );
}
