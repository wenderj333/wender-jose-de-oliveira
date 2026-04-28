import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, UserPlus, ShieldAlert, Grid, Heart, Users, ArrowLeft, User, Camera, Check, Ban } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const { id } = useParams();
  const { token, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    fetch(`${API}/members/${id}`, { headers: { Authorization: "Bearer " + token } })
      .then(res => res.json())
      .then(data => { 
        setMember(data.member); 
        setLoading(false); 
      })
      .catch(err => console.error(err));
  }, [id, token]);

  const handleAddFriend = async () => {
    try {
      await fetch(`${API}/friends/request`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ addressee_id: id }),
      });
      setRequestSent(true);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px", color: "#666" }}>{t("common.loading", "Carregando...")}</div>;
  if (!member) return <div style={{ textAlign: "center", padding: "100px" }}>{t("members.notFound", "Usuário não encontrado")}</div>;

  const avatarUrl = member.avatar_url ? (member.avatar_url.startsWith("http") ? member.avatar_url : (import.meta.env.VITE_API_URL || "") + member.avatar_url) : null;
  const isOwnProfile = currentUser?.id === member.id;

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", background: "#fafafa", minHeight: "100vh" }}>
      {/* Botão Voltar Estilizado */}
      <div style={{ padding: "10px 20px", display: "flex", alignItems: "center" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: "#262626", fontWeight: "600" }}>
          <ArrowLeft size={20} /> {t("common.back", "Voltar")}
        </button>
      </div>

      {/* Header do Perfil (Layout Instagram) */}
      <header style={{ display: "flex", padding: "30px 20px", gap: "40px", borderBottom: "1px solid #dbdbdb", background: "#fff" }}>
        {/* Foto de Perfil com Aro de Story se for importante */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: "150px", height: "150px", borderRadius: "50%", padding: "3px", background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid #fff", overflow: "hidden", background: "#eee" }}>
              {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={80} color="#ccc" /></div>}
            </div>
          </div>
        </div>

        {/* Informações e Ações */}
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "300", margin: 0 }}>{member.full_name}</h2>
            
            {!isOwnProfile && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  onClick={handleAddFriend}
                  style={{ background: requestSent ? "#efefef" : "#0095f6", color: requestSent ? "#262626" : "#fff", border: "none", padding: "7px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                  {requestSent ? t("profile.pending", "Pendente") : t("profile.add", "Adicionar")}
                </button>
                <button onClick={() => navigate(`/chat/${member.id}`)} style={{ background: "#efefef", color: "#262626", border: "none", padding: "7px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                  {t("profile.message", "Mensagem")}
                </button>
                <button style={{ background: "none", border: "1px solid #dbdbdb", padding: "7px", borderRadius: "8px", cursor: "pointer", color: "#ed4956" }}>
                  <Ban size={18} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            <span><strong>0</strong> {t("profile.posts", "publicações")}</span>
            <span><strong>0</strong> {t("profile.friends", "amigos")}</span>
            <span><strong>0</strong> {t("profile.prayers", "orações")}</span>
          </div>

          <div style={{ fontSize: "16px" }}>
            <div style={{ fontWeight: "600" }}>{member.role.toUpperCase()}</div>
            <p style={{ margin: "5px 0", color: "#262626" }}>{member.bio || t("profile.noBio", "Nenhuma biografia disponível.")}</p>
          </div>
        </div>
      </header>

      {/* Abas de Conteúdo */}
      <div style={{ display: "flex", justifyContent: "center", gap: "60px", background: "#fafafa" }}>
        <button onClick={() => setActiveTab("posts")} style={{ background: "none", border: "none", padding: "15px 0", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: activeTab === "posts" ? "#262626" : "#8e8e8e", borderTop: activeTab === "posts" ? "1px solid #262626" : "none", marginTop: "-1px" }}>
          <Grid size={14} /> {t("profile.tabPosts", "PUBLICAÇÕES")}
        </button>
        <button onClick={() => setActiveTab("prayers")} style={{ background: "none", border: "none", padding: "15px 0", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: activeTab === "prayers" ? "#262626" : "#8e8e8e", borderTop: activeTab === "prayers" ? "1px solid #262626" : "none", marginTop: "-1px" }}>
          <Heart size={14} /> {t("profile.tabPrayers", "ORAÇÕES")}
        </button>
      </div>

      {/* Grid de Conteúdo Vazio */}
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ width: "62px", height: "62px", borderRadius: "50%", border: "2px solid #262626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto" }}>
          <Camera size={32} />
        </div>
        <h2 style={{ fontSize: "28px", fontWeight: "800" }}>{t("profile.emptyTitle", "Ainda não há publicações")}</h2>
      </div>
    </div>
  );
}
