import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { Settings, Grid, Bookmark, UserSquare2, Loader2, Plus, LogOut, Shield, Link as LinkIcon } from "lucide-react";

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
      
      if (!cData.secure_url) return;

      // Tentativa de salvar com headers reforçados para evitar o 401
      const saveRes = await fetch(`${API}/profile/photo`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ photoURL: cData.secure_url })
      });

      if (saveRes.ok) {
        setMember(prev => ({ ...prev, avatar_url: cData.secure_url }));
        alert("Foto salva com sucesso!");
      } else {
        console.error("Erro 401 ou similar ao salvar");
        // Se falhar o PATCH, tentamos atualizar o estado local para o usuário ver
        setMember(prev => ({ ...prev, avatar_url: cData.secure_url }));
      }
    } catch (err) { 
      alert("Erro na conexão."); 
    } finally { 
      setUploading(false); 
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "30px 20px", background: "#fff", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      
      <header style={{ display: "flex", marginBottom: "44px", alignItems: "center" }}>
        {/* Foto de Perfil à esquerda igual IG */}
        <div style={{ flex: "1", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "150px", height: "150px" }}>
             <div 
              style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", border: "1px solid #dbdbdb", cursor: "pointer" }} 
              onClick={() => isOwnProfile && fileInputRef.current.click()}
            >
              <img src={member?.avatar_url || "/pro.jpg"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}><Loader2 className="animate-spin" color="white" /></div>}
            </div>
            {/* Círculo de Nota (opcional) */}
            <div style={{ position: "absolute", top: "-10px", left: "0", background: "white", border: "1px solid #dbdbdb", borderRadius: "10px", padding: "2px 8px", fontSize: "12px" }}>Nota...</div>
          </div>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleUploadAvatar} />
        </div>

        {/* Info à direita igual IG */}
        <div style={{ flex: "2", paddingLeft: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "400" }}>{member?.username || "usuario"}</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => navigate("/settings/edit")} style={btnGray}>{t('profile.edit') || "Editar perfil"}</button>
              <button style={btnGray}>{t('profile.archive') || "Ver archivo"}</button>
              <Settings style={{ cursor: "pointer" }} size={24} onClick={() => setShowSettings(true)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            <span><strong>56</strong> publicaciones</span>
            <span><strong>357</strong> seguidores</span>
            <span><strong>676</strong> seguidos</span>
          </div>

          <div style={{ fontWeight: "600" }}>{member?.full_name}</div>
          <div style={{ color: "#8e8e8e" }}>Cozinhando Jose</div>
          <p style={{ margin: "5px 0" }}>{member?.bio || "Bem-vindo ao Sigo com Fé!"}</p>
          
          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#00376b", fontSize: "14px", fontWeight: "600" }}>
            <LinkIcon size={14} /> <a href="#" style={{ textDecoration: "none", color: "inherit" }}>sigo-com-fe.vercel.app</a>
          </div>
        </div>
      </header>

      {/* Grid de publicações estilo IG */}
      <div style={{ borderTop: "1px solid #dbdbdb", display: "flex", justifyContent: "center", gap: "60px" }}>
        <div style={{ borderTop: "1px solid #262626", marginTop: "-1px", display: "flex", alignItems: "center", gap: "6px", padding: "15px 0", fontSize: "12px", fontWeight: "600", color: "#262626", cursor: "pointer" }}>
          <Grid size={12} /> PUBLICACIONES
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "15px 0", fontSize: "12px", fontWeight: "600", color: "#8e8e8e", cursor: "pointer" }}>
          <Bookmark size={12} /> GUARDADO
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "15px 0", fontSize: "12px", fontWeight: "600", color: "#8e8e8e", cursor: "pointer" }}>
          <UserSquare2 size={12} /> ETIQUETADAS
        </div>
      </div>

      {/* Botão flutuante para postar */}
      {isOwnProfile && (
        <button onClick={() => navigate("/mural")} style={fabStyle}><Plus size={30} /></button>
      )}

      {/* Modal de Configurações */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSettings(false)}>
          <div style={{ background: 'white', width: '400px', borderRadius: '12px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <button style={menuBtnStyle}>Configuración y privacidad</button>
            <button style={menuBtnStyle}>Código QR</button>
            <button style={menuBtnStyle}>Notificaciones</button>
            <button style={{ ...menuBtnStyle, color: '#ed4956', fontWeight: 'bold' }} onClick={logout}>Cerrar sesión</button>
            <button style={menuBtnStyle} onClick={() => setShowSettings(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnGray = { background: "#efefef", border: "none", borderRadius: "8px", padding: "7px 16px", fontSize: "14px", fontWeight: "600", cursor: "pointer" };
const menuBtnStyle = { width: '100%', padding: '14px', border: 'none', background: 'none', borderBottom: '1px solid #dbdbdb', cursor: 'pointer', fontSize: '14px' };
const fabStyle = { position: "fixed", bottom: "80px", right: "20px", width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#daa520", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer", zIndex: 100 };
