import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { Camera, ArrowLeft, Settings, Loader2, User, Check } from "lucide-react";

// Configurações do Cloudinary extraídas dos seus componentes
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sigo_com_fe';
const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const { id: paramId } = useParams();
  const { token, user: authUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const memberId = paramId || authUser?.id;
  const isOwnProfile = String(authUser?.id) === String(memberId);

  useEffect(() => {
    async function loadProfile() {
      if (!memberId) return;
      try {
        const res = await fetch(`${API}/profile/${memberId}`, {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        if (data && data.user) setMember(data.user);
        else setMember(authUser);
      } catch (err) {
        setMember(authUser);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [memberId, token, authUser]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload para o Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url) throw new Error("Falha no Cloudinary");

      const photoURL = cloudData.secure_url;

      // 2. Salvar o link no seu Backend
      const res = await fetch(`${API}/profile/photo`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer " + token 
        },
        body: JSON.stringify({ photoURL })
      });

      if (res.ok) {
        setMember({ ...member, avatar_url: photoURL });
        alert("Foto de perfil atualizada com sucesso! ✨");
      } else {
        alert("Erro ao salvar a foto no seu perfil.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao processar imagem.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px" }}>Carregando...</div>;

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "20px", background: "#fff", minHeight: "100vh" }}>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <ArrowLeft size={20} /> Voltar
      </button>

      <header style={{ display: "flex", gap: "40px", flexWrap: "wrap", borderBottom: "1px solid #eee", paddingBottom: "40px" }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", border: "4px solid #daa520", background: "#f9f9f9" }}>
            <img 
              src={member?.avatar_url || "/pro.jpg"} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              onError={(e) => e.target.src="/pro.jpg"} 
            />
          </div>
          
          {isOwnProfile && (
            <>
              <button 
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                style={{ position: "absolute", bottom: "5px", right: "5px", background: "linear-gradient(135deg, #daa520, #f4c542)", border: "none", borderRadius: "50%", padding: "10px", cursor: "pointer", color: "white", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}
              >
                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
              </button>
              <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileChange} />
            </>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "15px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "600", color: "#333" }}>{member?.full_name || member?.display_name || "Usuário"}</h2>
            {isOwnProfile && <Settings style={{ cursor: "pointer", color: "#999" }} size={24} />}
          </div>
          
          <div style={{ display: "flex", gap: "30px", marginBottom: "15px" }}>
            <span><strong>0</strong> publicações</span>
            <span><strong>0</strong> amigos</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "bold", color: "#daa520", marginBottom: "10px" }}>
            {(member?.role || "Membro").toUpperCase()} <Check size={16} />
          </div>

          <p style={{ color: "#444", fontSize: "1.05rem", maxWidth: "500px" }}>{member?.bio || "Sigo com Fé! Bem-vindo ao meu perfil."}</p>
          {member?.church_name && <p style={{ marginTop: "10px", color: "#777" }}>⛪ {member.church_name}</p>}
        </div>
      </header>

      <div style={{ textAlign: "center", padding: "100px 20px", color: "#ccc" }}>
        <Camera size={48} style={{ marginBottom: "10px" }} />
        <p style={{ fontSize: "18px" }}>Nenhuma publicação no mural ainda.</p>
      </div>
    </div>
  );
}
