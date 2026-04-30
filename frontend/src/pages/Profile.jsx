import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { Camera, Settings, Grid, Bookmark, Loader2, Plus, LogOut, Shield } from "lucide-react";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sigo_com_fe';
const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const { id: paramId } = useParams();
  const { token, user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const memberId = paramId || authUser?.id;
  const isOwnProfile = String(authUser?.id) === String(memberId);

  useEffect(() => {
    async function load() {
      if (!memberId) return;
      try {
        const res = await fetch(`${API}/profile/${memberId}`, {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        setMember(data.user || authUser);
      } catch (err) { console.error("Erro ao carregar perfil:", err); setMember(authUser); }
      finally { setLoading(false); }
    }
    load();
  }, [memberId, token, authUser]);

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    console.log("🚀 Iniciando upload para Cloudinary...");

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      
      const cRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
      const cData = await cRes.json();
      
      if (!cData.secure_url) throw new Error("Cloudinary não retornou URL");
      
      console.log("✅ Foto no Cloudinary:", cData.secure_url);
      console.log("📡 Tentando salvar no Backend via:", `${API}/profile/photo`);

      const saveRes = await fetch(`${API}/profile/photo`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: "Bearer " + token 
        },
        body: JSON.stringify({ photoURL: cData.secure_url })
      });

      const resultText = await saveRes.text();
      console.log("📥 Resposta do Servidor:", saveRes.status, resultText);

      if (saveRes.ok) {
        setMember(prev => ({ ...prev, avatar_url: cData.secure_url }));
        alert("Salvo no Banco de Dados com sucesso!");
      } else {
        alert(`Erro do Servidor (${saveRes.status}): ${resultText}`);
      }
      
    } catch (err) { 
      console.error("❌ ERRO CRÍTICO NO UPLOAD:", err);
      alert("Erro ao processar. Olhe o console (F12)."); 
    } finally { 
      setUploading(false); 
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "30px 20px", background: "#fafafa", minHeight: "100vh", position: "relative", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", marginBottom: "44px" }}>
        <div style={{ flex: "1", display: "flex", justifyContent: "center", position: "relative" }}>
          <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", border: "1px solid #dbdbdb", cursor: "pointer", backgroundColor: "#eee" }} onClick={() => isOwnProfile && fileInputRef.current.click()}>
            <img src={member?.avatar_url || "/pro.jpg"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}><Loader2 className="animate-spin" color="white" /></div>}
          </div>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleUploadAvatar} />
        </div>

        <div style={{ flex: "2", paddingTop: "10px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "400" }}>{member?.username || "usuario"}</h2>
            <button onClick={() => navigate("/settings/edit")} style={{ background: "#efefef", border: "none", borderRadius: "8px", padding: "7px 16px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Editar perfil</button>
            <Settings style={{ cursor: "pointer" }} size={24} onClick={() => setShowSettings(true)} />
          </div>
          <div style={{ fontWeight: "600" }}>{member?.full_name}</div>
          <p>{member?.bio || "Sigo com Fé"}</p>
        </div>
      </header>
      
      {isOwnProfile && <button onClick={() => navigate("/mural")} style={{ position: "fixed", bottom: "30px", right: "30px", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#daa520", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", cursor: "pointer", zIndex: 999 }}><Plus size={32} /></button>}

      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSettings(false)}>
          <div style={{ background: 'white', width: '350px', borderRadius: '12px', padding: '10px' }}>
            <button style={{ width: '100%', padding: '12px', border: 'none', background: 'none', borderBottom: '1px solid #eee', cursor: 'pointer', color: '#ed4956', fontWeight: 'bold' }} onClick={logout}>Sair</button>
            <button style={{ width: '100%', padding: '12px', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setShowSettings(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
