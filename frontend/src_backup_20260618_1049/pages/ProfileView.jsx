import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function ProfileView() {
  const { userId } = useParams();
  const { user: currentUser, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetId = userId || currentUser?.id;
  const savedUser = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch(e) { return null; } })();

  useEffect(() => {
    if (!targetId) return;
    fetch(API + "/profile/" + targetId, {
      headers: { Authorization: "Bearer " + (token || localStorage.getItem("token")) }
    })
    .then(r => r.json())
    .then(data => { setProfile(data.user || data || savedUser); setLoading(false); })
    .catch(() => setLoading(false));
  }, [targetId, token]);

  if (loading) return <div style={{textAlign:"center",padding:40}}>Carregando...</div>;
  if (!profile) return <div style={{textAlign:"center",padding:40}}>Utilizador nao encontrado.</div>;

  const card = {background:"#f9f9fe",borderRadius:12,padding:16,marginBottom:16,border:"1px solid #eee"};
  const title = {color:"#6C3FA0",fontWeight:700,fontSize:15,marginBottom:10,borderBottom:"1px solid #ddd",paddingBottom:6};
  const row = {display:"flex",gap:8,marginBottom:8,fontSize:14};
  const label = {fontWeight:600,color:"#555",minWidth:140};
  const value = {color:"#333"};

  return (
    <div style={{maxWidth:700,margin:"0 auto",padding:24}}>
      <button onClick={() => navigate(-1)} style={{background:"none",border:"none",cursor:"pointer",color:"#6C3FA0",fontSize:16,marginBottom:16}}>← Voltar</button>
      <div style={{textAlign:"center",marginBottom:24}}>
        <img src={profile.avatar_url || "/pro.jpg"} style={{width:120,height:120,borderRadius:"50%",objectFit:"cover",border:"3px solid #6C3FA0"}} onError={e=>e.target.src="/pro.jpg"} />
        <h2 style={{color:"#1a1a2e",marginTop:12}}>{profile.full_name || profile.username || "Utilizador"}</h2>
        {profile.bio && <p style={{color:"#666",fontSize:14}}>{profile.bio}</p>}
        {(!userId || userId === currentUser?.id) && (
          <button onClick={() => navigate("/settings")} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"8px 20px",cursor:"pointer",marginTop:8,fontSize:14}}>✏️ {t("profile.editProfile","Editar Perfil")}</button>
        )}
      </div>
      <div style={card}>
        <div style={title}>👤 {t("profile.sectionPersonal","Informacoes Pessoais")}</div>
        {profile.city && <div style={row}><span style={label}>{t("profile.city","Cidade")}:</span><span style={value}>{profile.city}</span></div>}
        {profile.state && <div style={row}><span style={label}>{t("profile.state","Estado")}:</span><span style={value}>{profile.state}</span></div>}
        {profile.country && <div style={row}><span style={label}>{t("profile.country","Pais")}:</span><span style={value}>{profile.country}</span></div>}
        {profile.profession && <div style={row}><span style={label}>{t("profile.profession","Profissao")}:</span><span style={value}>{profile.profession}</span></div>}
        {profile.marital_status && <div style={row}><span style={label}>{t("profile.maritalStatus","Estado Civil")}:</span><span style={value}>{profile.marital_status}</span></div>}
      </div>
      <div style={card}>
        <div style={title}>✝️ {t("profile.sectionChurch","Vida Crista")}</div>
        {profile.church_name && <div style={row}><span style={label}>{t("profile.church","Igreja")}:</span><span style={value}>{profile.church_name}</span></div>}
        {profile.denomination && <div style={row}><span style={label}>{t("profile.denomination","Denominacao")}:</span><span style={value}>{profile.denomination}</span></div>}
        {profile.christian_years && <div style={row}><span style={label}>{t("profile.faithYears","Anos de fe")}:</span><span style={value}>{profile.christian_years}</span></div>}
        {profile.church_role && <div style={row}><span style={label}>{t("profile.churchRole","Funcao")}:</span><span style={value}>{profile.church_role}</span></div>}
        {profile.ministry && <div style={row}><span style={label}>{t("profile.ministry","Ministerio")}:</span><span style={value}>{profile.ministry}</span></div>}
      </div>
      {profile.favorite_verse && <div style={card}>
        <div style={title}>📖 {t("profile.favoriteVerse","Versiculo Favorito")}</div>
        <p style={{color:"#444",fontStyle:"italic",fontSize:14}}>{profile.favorite_verse}</p>
      </div>}
      {profile.testimony && <div style={card}>
        <div style={title}>🙏 {t("profile.testimony","Testemunho")}</div>
        <p style={{color:"#444",fontSize:14,whiteSpace:"pre-wrap"}}>{profile.testimony}</p>
      </div>}
      {profile.bio && <div style={card}>
        <div style={title}>💬 {t("profile.aboutMe","Sobre Mim")}</div>
        <p style={{color:"#444",fontSize:14,whiteSpace:"pre-wrap"}}>{profile.bio}</p>
      </div>}
    </div>
  );
}
