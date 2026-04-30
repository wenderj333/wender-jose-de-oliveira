import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, Camera, User, ArrowLeft, UserCheck, UserPlus, Clock, Settings } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const { id: paramId } = useParams();
  const location = useLocation();
  const { token, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showAvatarBig, setShowAvatarBig] = useState(false);

  // Pega o ID da URL ou do usuário logado
  const memberId = paramId || currentUser?.id || location.pathname.split("/").pop();
  const isOwnProfile = currentUser?.id === memberId;

  useEffect(() => {
    async function loadProfileData() {
      if (!memberId) { setLoading(false); return; }
      setLoading(true);

      try {
        // Tenta buscar o perfil específico
        const res = await fetch(`${API}/members/${memberId}`, { 
          headers: { Authorization: "Bearer " + token } 
        });
        
        if (res.ok) {
          const data = await res.json();
          setMember(data);
          setFriendStatus(data.friendship_status || null);
        } else {
          // Se falhar a busca individual, tenta na lista geral como backup
          const listRes = await fetch(`${API}/members`, { headers: { Authorization: "Bearer " + token } });
          const listData = await listRes.json();
          const allMembers = listData.members || listData;
          const found = Array.isArray(allMembers) && allMembers.find(m => String(m.id) === String(memberId));
          
          if (found) {
            setMember(found);
          } else if (isOwnProfile) {
            // Se for o MEU perfil e deu erro, usa os dados do contexto
            setMember(currentUser);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        if (isOwnProfile) setMember(currentUser);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [memberId, token, currentUser, isOwnProfile]);

  if (loading) return <div style={{ textAlign: "center", padding: "100px", color: "#666" }}>{t("common.loading", "Carregando...")}</div>;

  if (!member) return (
    <div style={{ textAlign: "center", padding: "100px" }}>
      <h2>{t("members.notFound", "Usuário não encontrado")}</h2>
      <button onClick={() => navigate("/membros")} style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}>
        Voltar para Membros
      </button>
    </div>
  );

  const avatarUrl = member.avatar_url?.startsWith("http") 
    ? member.avatar_url 
    : member.avatar_url ? (import.meta.env.VITE_API_URL || "") + member.avatar_url : "/pro.jpg";

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", background: "#fff", minHeight: "100vh", padding: "20px" }}>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <ArrowLeft size={20} /> {t("common.back", "Voltar")}
      </button>

      <header style={{ display: "flex", gap: "40px", flexWrap: "wrap", borderBottom: "1px solid #eee", paddingBottom: "40px" }}>
        <div onClick={() => setShowAvatarBig(true)} style={{ cursor: "pointer" }}>
          <img src={avatarUrl} style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover", border: "3px solid #FFD700" }} 
               onError={(e) => e.target.src="https://via.placeholder.com/150"} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "300" }}>{member.full_name || member.name || member.username}</h2>
            {isOwnProfile ? (
              <button onClick={() => navigate("/configuracoes")} style={{ padding: "5px 15px", borderRadius: "5px", border: "1px solid #dbdbdb", background: "none", cursor: "pointer" }}>
                Editar Perfil
              </button>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={{ background: "#0095f6", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}>Seguir</button>
                <button onClick={() => navigate("/chat/" + member.id)} style={{ background: "#efefef", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}>Mensagem</button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
            <span><strong>0</strong> publicações</span>
            <span><strong>0</strong> amigos</span>
          </div>
          <div style={{ fontWeight: "600" }}>{(member.role || "Membro").toUpperCase()}</div>
          <p style={{ color: "#666" }}>{member.bio || "Bem-vindo ao meu perfil!"}</p>
        </div>
      </header>

      <div style={{ textAlign: "center", paddingTop: "50px", color: "#999" }}>
        <Camera size={40} style={{ marginBottom: "10px" }} />
        <h3>Sem publicações ainda</h3>
      </div>
    </div>
  );
}
