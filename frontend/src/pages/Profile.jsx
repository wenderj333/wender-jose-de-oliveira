import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, Grid, Heart, ArrowLeft, User, Camera } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const params = useParams();
  const location = useLocation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tenta pegar o ID de qualquer lugar (id, userId, ou da URL direto)
  const memberId = params.id || params.userId || location.pathname.split("/").pop();

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return;
    }

    fetch(`${API}/members`, { 
      headers: { Authorization: "Bearer " + token } 
    })
    .then(res => res.json())
    .then(data => {
      const allMembers = data.members || data;
      if (Array.isArray(allMembers)) {
        // Busca flexível: compara como string e ignora espaços
        const found = allMembers.find(m => String(m.id).trim() === String(memberId).trim());
        setMember(found);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro na busca:", err);
      setLoading(false);
    });
  }, [memberId, token]);

  if (loading) return <div style={{ textAlign: "center", padding: "100px" }}>{t("common.loading", "Carregando...")}</div>;
  
  if (!member) return (
    <div style={{ textAlign: "center", padding: "100px" }}>
      <h2 style={{ color: "#262626" }}>{t("members.notFound", "Usuário não encontrado")}</h2>
      <p style={{ color: "#8e8e8e" }}>Tentamos encontrar o ID: <strong>{memberId || "Indefinido"}</strong></p>
      <button onClick={() => navigate("/membros")} style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", border: "1px solid #dbdbdb", cursor: "pointer" }}>
        Voltar para a Lista
      </button>
    </div>
  );

  const avatarUrl = member.avatar_url ? (member.avatar_url.startsWith("http") ? member.avatar_url : (import.meta.env.VITE_API_URL || "") + member.avatar_url) : null;

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <div style={{ padding: "15px 20px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
          <ArrowLeft size={22} /> {t("common.back", "Voltar")}
        </button>
      </div>

      <header style={{ display: "flex", padding: "40px 20px", gap: "50px", borderBottom: "1px solid #dbdbdb" }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: "150px", height: "150px", borderRadius: "50%", padding: "3px", background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid #fff", overflow: "hidden", background: "#eee" }}>
              {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={80} color="#ccc" /></div>}
            </div>
          </div>
        </div>

        <div style={{ flexGrow: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "25px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "300", margin: 0 }}>{member.full_name || member.name}</h2>
            <div style={{ display: "flex", gap: "8px" }}>
               <button style={{ background: "#0095f6", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "600" }}>Seguir</button>
               <button onClick={() => navigate("/chat/" + member.id)} style={{ background: "#efefef", color: "#262626", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "600" }}>Mensagem</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            <span><strong>0</strong> publicações</span>
            <span><strong>0</strong> amigos</span>
          </div>
          <div style={{ fontWeight: "600" }}>{(member.role || "Membro").toUpperCase()}</div>
          <p style={{ marginTop: "10px" }}>{member.bio || "Bem-vindo ao meu perfil!"}</p>
        </div>
      </header>

      <div style={{ textAlign: "center", padding: "80px 20px", color: "#8e8e8e" }}>
        <Camera size={32} style={{ marginBottom: "15px" }} />
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#262626" }}>Sem publicações</h2>
      </div>
    </div>
  );
}
