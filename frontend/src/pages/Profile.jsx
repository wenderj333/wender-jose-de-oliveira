import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, Grid, Heart, ArrowLeft, User, Camera, UserCheck, UserPlus, Clock } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const params = useParams();
  const location = useLocation();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState(null); // null, 'pending', 'accepted'
  const [sendingRequest, setSendingRequest] = useState(false);
  const [friendMsg, setFriendMsg] = useState('');
  const [showAvatarBig, setShowAvatarBig] = useState(false);

  const memberId = params.id || params.userId || location.pathname.split("/").pop();
  const isOwnProfile = user?.id === memberId;

  useEffect(() => {
    if (!memberId) { setLoading(false); return; }

    fetch(`${API}/members`, { headers: { Authorization: "Bearer " + token } })
      .then(res => res.json())
      .then(data => {
        const allMembers = data.members || data;
        if (Array.isArray(allMembers)) {
          const found = allMembers.find(m => String(m.id).trim() === String(memberId).trim());
          setMember(found);
          if (found) setFriendStatus(found.friendship_status || null);
        }
        setLoading(false);
      })
      .catch(err => { console.error("Erro na busca:", err); setLoading(false); });
  }, [memberId, token]);

  async function sendFriendRequest() {
    if (sendingRequest) return;
    setSendingRequest(true);
    try {
      const res = await fetch(`${API}/friends/request`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressee_id: memberId }),
      });
      const data = await res.json();
      setFriendMsg(data.message || 'Pedido enviado!');
      setFriendStatus('pending');
      setTimeout(() => setFriendMsg(''), 3000);
    } catch (err) { console.error(err); }
    finally { setSendingRequest(false); }
  }

  if (loading) return <div style={{ textAlign: "center", padding: "100px" }}>{t("common.loading", "Carregando...")}</div>;

  if (!member) return (
    <div style={{ textAlign: "center", padding: "100px" }}>
      <h2 style={{ color: "#262626" }}>{t("members.notFound", "Usuário não encontrado")}</h2>
      <button onClick={() => navigate("/membros")} style={{ marginTop: "20px", padding: "10px 20px", borderRadius: "8px", border: "1px solid #dbdbdb", cursor: "pointer" }}>
        Voltar para a Lista
      </button>
    </div>
  );

  const avatarUrl = member.avatar_url
    ? (member.avatar_url.startsWith("http") ? member.avatar_url : (import.meta.env.VITE_API_URL || "") + member.avatar_url)
    : null;

  // ── BOTÃO DE AMIZADE ──────────────────────────────────
  const FriendButton = () => {
    if (isOwnProfile) return null;

    if (friendStatus === 'accepted') {
      return (
        <button style={{
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          color: "#fff", border: "none", padding: "8px 20px",
          borderRadius: "8px", fontWeight: "700", cursor: "default",
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 2px 8px rgba(34,197,94,0.4)"
        }}>
          <UserCheck size={16} /> {t('members.friends', 'Amigos')}
        </button>
      );
    }

    if (friendStatus === 'pending') {
      return (
        <button style={{
          background: "#efefef", color: "#666", border: "none",
          padding: "8px 20px", borderRadius: "8px", fontWeight: "600",
          cursor: "default", display: "flex", alignItems: "center", gap: 6
        }}>
          <Clock size={16} /> {t('members.pending', 'Pendente')}
        </button>
      );
    }

    return (
      <button onClick={sendFriendRequest} disabled={sendingRequest} style={{
        background: "linear-gradient(135deg, #0095f6, #0077cc)",
        color: "#fff", border: "none", padding: "8px 20px",
        borderRadius: "8px", fontWeight: "600", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6,
        boxShadow: "0 2px 8px rgba(0,149,246,0.4)"
      }}>
        <UserPlus size={16} /> {t('members.follow', 'Seguir')}
      </button>
    );
  };

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>

      {/* Modal Avatar Grande */}
      {showAvatarBig && (
        <div onClick={() => setShowAvatarBig(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer"
        }}>
          <div style={{ width: 350, height: 350, borderRadius: "50%", overflow: "hidden", border: "4px solid #fff" }}>
            {avatarUrl
              ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#333" }}><User size={120} color="#ccc" /></div>}
          </div>
        </div>
      )}

      {/* Voltar */}
      <div style={{ padding: "15px 20px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
          <ArrowLeft size={22} /> {t("common.back", "Voltar")}
        </button>
      </div>

      {/* Header do Perfil */}
      <header style={{ display: "flex", padding: "40px 20px", gap: "50px", borderBottom: "1px solid #dbdbdb", flexWrap: "wrap" }}>

        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          <div onClick={() => setShowAvatarBig(true)} style={{
            width: "150px", height: "150px", borderRadius: "50%", padding: "3px", cursor: "pointer",
            background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
            transition: "transform 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid #fff", overflow: "hidden", background: "#eee" }}>
              {avatarUrl
                ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={80} color="#ccc" /></div>}
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "25px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "300", margin: 0 }}>{member.full_name || member.name}</h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <FriendButton />
              <button onClick={() => navigate("/chat/" + member.id)} style={{
                background: "#efefef", color: "#262626", border: "none",
                padding: "8px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6
              }}>
                <MessageCircle size={16} /> {t('members.message', 'Mensagem')}
              </button>
            </div>
          </div>

          {friendMsg && (
            <div style={{ background: "#d4edda", color: "#155724", padding: "8px 14px", borderRadius: 8, marginBottom: 12, fontSize: "0.85rem", fontWeight: 600 }}>
              ✅ {friendMsg}
            </div>
          )}

          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            <span><strong>0</strong> {t('profile.posts', 'publicações')}</span>
            <span><strong>0</strong> {t('profile.friends', 'amigos')}</span>
          </div>

          <div style={{ fontWeight: "700", color: friendStatus === 'accepted' ? '#22c55e' : '#262626', fontSize: "0.9rem" }}>
            {(member.role || "Membro").toUpperCase()}
            {friendStatus === 'accepted' && " ✅"}
          </div>
          <p style={{ marginTop: "10px", color: "#555" }}>{member.bio || t('profile.defaultBio', 'Bem-vindo ao meu perfil!')}</p>
        </div>
      </header>

      {/* Publicações */}
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#8e8e8e" }}>
        <Camera size={32} style={{ marginBottom: "15px" }} />
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#262626" }}>{t('profile.noPosts', 'Sem publicações')}</h2>
      </div>
    </div>
  );
}
