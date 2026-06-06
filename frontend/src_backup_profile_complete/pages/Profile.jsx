import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Loader2, Grid, Settings } from "lucide-react";
const API = (import.meta.env.VITE_API_URL || "") + "/api";
export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuth();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amens, setAmens] = useState(0);
  const [amenDado, setAmenDado] = useState(false);
  const targetId = userId || currentUser?.id;
  useEffect(() => {
    if (!targetId) return;
    fetch(API + "/profile/" + targetId, { headers: { Authorization: "Bearer " + token } })
    .then(res => res.json())
    .then(data => { setUser(data.user || data); setLoading(false); })
    .catch(() => setLoading(false));
  }, [targetId, token]);
  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}><Loader2 className="animate-spin" /></div>;
  if (!user) return <div style={{ textAlign: "center", padding: "20px" }}>Utilizador nao encontrado.</div>;
  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "0" }}>
      {user.cover_url && <img src={user.cover_url} style={{width:"100%",height:"200px",objectFit:"cover"}} onError={e=>e.target.style.display="none"} />}
      <div style={{padding:"20px"}}>
      <header style={{ display: "flex", alignItems: "center", marginBottom: "44px", gap: "30px" }}>
        <div style={{position:"relative",display:"inline-block"}}>
          <img src={user.avatar_url || "/pro.jpg"} style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover", border: "1px solid #dbdbdb" }} onError={e => e.target.src="/pro.jpg"} />
          <button onClick={()=>{if(!amenDado){setAmens(a=>a+1);setAmenDado(true);}}} style={{position:"absolute",bottom:4,right:4,background:amenDado?"#6C3FA0":"white",border:"2px solid #6C3FA0",borderRadius:"50%",width:38,height:38,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>🙏</button>
          {amens > 0 && <span style={{position:"absolute",bottom:4,left:0,background:"#6C3FA0",color:"white",borderRadius:12,padding:"2px 8px",fontSize:12,fontWeight:"bold"}}>{amens} {t("amen","Amem")}</span>}
        </div>
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "300" }}>{user.username || user.full_name || "Usuario"}</h2>
            {(!userId || userId === currentUser?.id) && (
              <>
                <button onClick={() => navigate("/settings")} style={{ background: "transparent", border: "1px solid #dbdbdb", borderRadius: "4px", padding: "5px 9px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Editar perfil</button>
                <button onClick={() => navigate("/ver-perfil/" + user.id)} style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: "4px", padding: "5px 9px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Ver Perfil</button>
                <Settings style={{ cursor: "pointer" }} onClick={() => navigate("/settings")} />
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            <span><strong>0</strong> publicacoes</span>
            <span><strong>0</strong> seguidores</span>
            <span><strong>0</strong> seguindo</span>
          </div>
          <div>
            <span style={{ fontWeight: "600" }}>{user.full_name}</span>
            <p style={{ whiteSpace: "pre-wrap" }}>{user.bio || ""}</p>
          </div>
        </section>
      </header>
      <hr style={{ border: "0", borderTop: "1px solid #dbdbdb", marginBottom: "0" }} />
      {(user.city || user.country || user.church_name || user.testimony || user.favorite_verse) && (
        <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:12}}>
          {(user.city || user.country || user.profession) && (
            <div style={{background:"#f9f9fe",borderRadius:12,padding:16,border:"1px solid #eee"}}>
              <div style={{fontWeight:700,color:"#6C3FA0",marginBottom:10,fontSize:15}}>👤 {t("profile.sectionPersonal","Informacoes Pessoais")}</div>
              {user.city && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.city","Cidade")}:</b> {user.city}</div>}
              {user.state && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.state","Estado")}:</b> {user.state}</div>}
              {user.country && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.country","Pais")}:</b> {user.country}</div>}
              {user.profession && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.profession","Profissao")}:</b> {user.profession}</div>}
            </div>
          )}
          {(user.church_name || user.denomination || user.christian_years) && (
            <div style={{background:"#f9f9fe",borderRadius:12,padding:16,border:"1px solid #eee"}}>
              <div style={{fontWeight:700,color:"#6C3FA0",marginBottom:10,fontSize:15}}>✝️ {t("profile.sectionChurch","Vida Crista")}</div>
              {user.church_name && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.church","Igreja")}:</b> {user.church_name}</div>}
              {user.denomination && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.denomination","Denominacao")}:</b> {user.denomination}</div>}
              {user.christian_years && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.faithYears","Anos de fe")}:</b> {user.christian_years}</div>}
              {user.church_role && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.churchRole","Funcao")}:</b> {user.church_role}</div>}
            </div>
          )}
          {user.favorite_verse && (
            <div style={{background:"#f9f9fe",borderRadius:12,padding:16,border:"1px solid #eee"}}>
              <div style={{fontWeight:700,color:"#6C3FA0",marginBottom:10,fontSize:15}}>📖 {t("profile.favoriteVerse","Versiculo Favorito")}</div>
              <p style={{fontSize:14,fontStyle:"italic",color:"#444"}}>{user.favorite_verse}</p>
            </div>
          )}
          {user.testimony && (
            <div style={{background:"#f9f9fe",borderRadius:12,padding:16,border:"1px solid #eee"}}>
              <div style={{fontWeight:700,color:"#6C3FA0",marginBottom:10,fontSize:15}}>🙏 {t("profile.testimony","Testemunho")}</div>
              <p style={{fontSize:14,color:"#444",whiteSpace:"pre-wrap"}}>{user.testimony}</p>
            </div>
          )}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "center", gap: "60px", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: "1px solid #262626", padding: "15px 0", marginTop: "-1px" }}>
          <Grid size={12} /> Publicacoes
        </div>
      </div>
    </div></div>
  );
}
// cover
