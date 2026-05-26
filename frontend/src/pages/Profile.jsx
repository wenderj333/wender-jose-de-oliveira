import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Loader2, Grid, Settings } from "lucide-react";
const API = (import.meta.env.VITE_API_URL || "") + "/api";
export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuth();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amens, setAmens] = useState(0);
  const [amenDado, setAmenDado] = useState(false);
  const targetId = id || currentUser?.id;
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
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "30px 20px" }}>
      <header style={{ display: "flex", alignItems: "center", marginBottom: "44px", gap: "30px" }}>
        <div style={{position:"relative",display:"inline-block"}}>
          <img src={user.avatar_url || "/pro.jpg"} style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover", border: "1px solid #dbdbdb" }} onError={e => e.target.src="/pro.jpg"} />
          <button onClick={()=>{if(!amenDado){setAmens(a=>a+1);setAmenDado(true);}}} style={{position:"absolute",bottom:4,right:4,background:amenDado?"#6C3FA0":"white",border:"2px solid #6C3FA0",borderRadius:"50%",width:38,height:38,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>🙏</button>
          {amens > 0 && <span style={{position:"absolute",bottom:4,left:0,background:"#6C3FA0",color:"white",borderRadius:12,padding:"2px 8px",fontSize:12,fontWeight:"bold"}}>{amens} {t("amen","Amem")}</span>}
        </div>
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "300" }}>{user.username || user.full_name || "Usuario"}</h2>
            {(!id || id === currentUser?.id) && (
              <>
                <button onClick={() => navigate("/configuracoes")} style={{ background: "transparent", border: "1px solid #dbdbdb", borderRadius: "4px", padding: "5px 9px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Editar perfil</button>
                <Settings style={{ cursor: "pointer" }} onClick={() => navigate("/configuracoes")} />
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
      <div style={{ display: "flex", justifyContent: "center", gap: "60px", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: "1px solid #262626", padding: "15px 0", marginTop: "-1px" }}>
          <Grid size={12} /> Publicacoes
        </div>
      </div>
    </div>
  );
}