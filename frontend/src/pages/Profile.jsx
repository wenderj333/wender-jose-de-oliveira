import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { Camera, Settings, Grid, Bookmark, UserSquare2, Loader2, Link as LinkIcon, QrCode, Bell, Shield, LogOut, Plus } from "lucide-react";

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
      } catch (err) { setMember(authUser); }
      finally { setLoading(false); }
    }
    load();
  }, [memberId, token, authUser]);

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      const cRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
      const cData = await cRes.json();
      
      await fetch(`${API}/profile/photo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ photoURL: cData.secure_url })
      });
      setMember({ ...member, avatar_url: cData.secure_url });
      if (typeof updateUser === 'function') updateUser({ ...member, avatar_url: cData.secure_url });
      localStorage.setItem('avatar_url', cData.secure_url);
    } catch (err) { alert(t('profile.upload_error') || "Erro upload"); }
    finally { setUploading(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "30px 20px", background: "#fafafa", minHeight: "100vh", fontFamily: "sans-serif", position: "relative" }}>
      
      <header style={{ display: "flex", marginBottom: "44px" }}>
        <div style={{ flex: "1", display: "flex", justifyContent: "center", position: "relative" }}>
          <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", border: "1px solid #dbdbdb", cursor: isOwnProfile ? "pointer" : "default" }} onClick={() => isOwnProfile && fileInputRef.current.click()}>
            <img src={member?.avatar_url || "/pro.jpg"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}><Loader2 className="animate-spin" color="white" /></div>}
          </div>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleUploadAvatar} />
        </div>

        <div style={{ flex: "2", paddingTop: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "400" }}>{member?.username || (member?.full_name ? member.full_name.split(' ')[0].toLowerCase() : "usuario")}</h2>
            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => navigate("/settings/edit")} style={btnActionStyle}>{t('profile.edit') || "Editar Perfil"}</button>
                <Settings style={{ cursor: "pointer" }} size={24} onClick={() => setShowSettings(true)} />
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            <span><strong>0</strong> {t('profile.posts') || "publicações"}</span>
            <span><strong>0</strong> {t('profile.followers') || "seguidores"}</span>
            <span><strong>0</strong> {t('profile.following') || "seguindo"}</span>
          </div>

          <div style={{ fontWeight: "600" }}>{member?.full_name}</div>
          <p style={{ fontSize: "14px", color: "#262626" }}>{member?.bio || "Sigo com Fé"}</p>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderTop: "1px solid #dbdbdb", display: "flex", justifyContent: "center", gap: "60px" }}>
        <div style={{ borderTop: "1px solid #262626", marginTop: "-1px", display: "flex", alignItems: "center", gap: "6px", padding: "15px 0", fontSize: "12px", fontWeight: "600", color: "#262626", cursor: "pointer" }}>
          <Grid size={12} /> {t('profile.grid') || "PUBLICAÇÕES"}
        </div>
      </div>

      {/* BOTÃO FLUTUANTE PARA POSTAR (ESTILO MODERNO) */}
      {isOwnProfile && (
        <button 
          onClick={() => navigate("/mural")} 
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#daa520",
            color: "white",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            cursor: "pointer",
            zIndex: 999
          }}
          title="Nova Publicação"
        >
          <Plus size={32} />
        </button>
      )}

      {/* Menu Config */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSettings(false)}>
          <div style={{ background: 'white', width: '400px', borderRadius: '12px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <button style={menuBtnStyle} onClick={() => navigate("/settings/edit")}><Shield size={18} /> {t('settings.privacy') || "Privacidade"}</button>
            <button style={{ ...menuBtnStyle, color: '#ed4956', fontWeight: 'bold' }} onClick={() => { logout(); navigate("/login"); }}>
              <LogOut size={18} /> {t('settings.logout') || "Sair"}
            </button>
            <button style={menuBtnStyle} onClick={() => setShowSettings(false)}>{t('common.cancel') || "Cancelar"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnActionStyle = { background: "#efefef", border: "none", borderRadius: "8px", padding: "7px 16px", fontSize: "14px", fontWeight: "600", cursor: "pointer" };
const menuBtnStyle = { width: '100%', padding: '14px', border: 'none', background: 'none', borderBottom: '1px solid #dbdbdb', cursor: 'pointer', fontSize: '14px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' };
