import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { Camera, User, ArrowLeft, Settings, Loader2 } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const { id: paramId } = useParams();
  const { token, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const memberId = paramId || currentUser?.id;
  const isOwnProfile = currentUser?.id === memberId;

  useEffect(() => {
    async function load() {
      if (!memberId) return;
      try {
        const res = await fetch(`${API}/members/${memberId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMember(data);
        } else {
          setMember(currentUser);
        }
      } catch (err) {
        setMember(currentUser);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [memberId, token, currentUser]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(`${API}/members/upload-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setMember({ ...member, avatar_url: data.url });
        alert("Foto atualizada com sucesso!");
        window.location.reload(); // Recarrega para aplicar em todo o site
      } else {
        alert("Erro ao subir foto. Verifique o tamanho do arquivo.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha na conexão com o servidor.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px" }}>Carregando...</div>;

  const avatarUrl = member?.avatar_url?.startsWith("http") 
    ? member.avatar_url 
    : member?.avatar_url ? (import.meta.env.VITE_API_URL || "") + member.avatar_url : "/pro.jpg";

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "20px", background: "#fff", minHeight: "100vh" }}>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <ArrowLeft size={20} /> Voltar
      </button>

      <header style={{ display: "flex", gap: "40px", flexWrap: "wrap", borderBottom: "1px solid #eee", paddingBottom: "40px" }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", border: "3px solid #FFD700" }}>
            <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => e.target.src="/pro.jpg"} />
          </div>
          
          {isOwnProfile && (
            <>
              <button 
                onClick={() => fileInputRef.current.click()}
                style={{ position: "absolute", bottom: "5px", right: "5px", background: "#FFD700", border: "none", borderRadius: "50%", padding: "8px", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}
              >
                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} accept="image/*" />
            </>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "300" }}>{member?.full_name || member?.username}</h2>
            {isOwnProfile && <Settings style={{ cursor: "pointer" }} size={24} />}
          </div>
          <p style={{ color: "#666" }}>{member?.bio || "Sigo com Fé!"}</p>
          <div style={{ marginTop: "10px", fontWeight: "bold", color: "#FFD700" }}>{(member?.role || "Membro").toUpperCase()}</div>
        </div>
      </header>

      <div style={{ textAlign: "center", padding: "50px", color: "#ccc" }}>
        <Camera size={48} />
        <p>Sua galeria de bençãos aparecerá aqui.</p>
      </div>
    </div>
  );
}
