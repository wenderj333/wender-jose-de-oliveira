import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, Grid, Heart, ArrowLeft, User, Camera, Ban } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const { id } = useParams();
  const { token, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    // Adicionei um log para vermos no console se a URL está certa
    console.log("Buscando membro no ID:", id);
    
    fetch(`${API}/members/${id}`, { 
      headers: { Authorization: "Bearer " + token } 
    })
    .then(res => {
      if (!res.ok) throw new Error("Erro na resposta do servidor");
      return res.json();
    })
    .then(data => { 
      setMember(data.member || data); // Aceita 'data.member' ou o objeto direto
      setLoading(false); 
    })
    .catch(err => {
      console.error("Erro ao carregar perfil:", err);
      setLoading(false); // Para o carregamento mesmo se der erro
    });
  }, [id, token]);

  if (loading) return <div style={{ textAlign: "center", padding: "100px" }}>{t("common.loading", "Carregando...")}</div>;
  
  // Se não encontrou o membro, mostra um aviso em vez de tela branca
  if (!member) return (
    <div style={{ textAlign: "center", padding: "100px" }}>
      <h2>{t("members.notFound", "Usuário não encontrado")}</h2>
      <button onClick={() => navigate(-1)}>{t("common.back", "Voltar")}</button>
    </div>
  );

  const avatarUrl = member.avatar_url ? (member.avatar_url.startsWith("http") ? member.avatar_url : (import.meta.env.VITE_API_URL || "") + member.avatar_url) : null;

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <div style={{ padding: "10px 20px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
          <ArrowLeft size={20} /> {t("common.back", "Voltar")}
        </button>
      </div>

      <header style={{ display: "flex", padding: "30px 20px", gap: "40px", borderBottom: "1px solid #dbdbdb" }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: "150px", height: "150px", borderRadius: "50%", padding: "3px", background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid #fff", overflow: "hidden", background: "#eee" }}>
              {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={80} color="#ccc" /></div>}
            </div>
          </div>
        </div>

        <div style={{ flexGrow: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "300", margin: 0 }}>{member.full_name || member.name}</h2>
            <button style={{ background: "#0095f6", color: "#fff", border: "none", padding: "7px 16px", borderRadius: "8px", fontWeight: "600" }}>Seguir</button>
            <button onClick={() => navigate("/mensagens")} style={{ background: "#efefef", color: "#262626", border: "none", padding: "7px 16px", borderRadius: "8px", fontWeight: "600" }}>Mensagem</button>
          </div>
          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            <span><strong>0</strong> publicações</span>
            <span><strong>0</strong> amigos</span>
          </div>
          <div style={{ fontWeight: "600" }}>{(member.role || "membro").toUpperCase()}</div>
        </div>
      </header>

      <div style={{ textAlign: "center", padding: "60px 20px", color: "#8e8e8e" }}>
        <Camera size={40} style={{ marginBottom: "10px" }} />
        <p>Ainda não há publicações para exibir.</p>
      </div>
    </div>
  );
}
