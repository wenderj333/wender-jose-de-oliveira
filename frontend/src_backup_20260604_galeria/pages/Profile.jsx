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
  const [showInfo, setShowInfo] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [photos, setPhotos] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoVisibility, setPhotoVisibility] = useState('public');
  const photoInputRef = React.useRef(null);
  const [following, setFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [friendStatus, setFriendStatus] = useState(null); // null, pending, accepted

  useEffect(() => {
    if (!token || !userId || userId === currentUser?.id) return;
    fetch((import.meta.env.VITE_API_URL || "") + "/api/friends", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(r => r.json())
    .then(data => {
      const friends = data.friends || [];
      const isFriend = friends.find(f => f.id === userId);
      if (isFriend) setFriendStatus("accepted");
    })
    .catch(() => {});
  }, [token, userId]);

  const handleFollow = async () => {
    if (!token) return;
    if (friendStatus === "accepted") return;
    try {
      await fetch((import.meta.env.VITE_API_URL || "") + "/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ addresseeId: userId })
      });
      setFriendStatus("pending");
    } catch(e) {}
  };
  const targetId = userId || currentUser?.id;
  useEffect(() => {
    if (!targetId || !token) return;
    fetch((import.meta.env.VITE_API_URL || '') + '/api/feed', { headers: { Authorization: 'Bearer ' + token } })
    .then(r => r.json()).then(d => setUserPosts((d.posts||[]).filter(p=>p.user_id===targetId||p.author_id===targetId))).catch(()=>{});
    fetch((import.meta.env.VITE_API_URL || '') + '/api/photos/' + targetId, { headers: { Authorization: 'Bearer ' + token } })
    .then(r => r.ok ? r.json() : {photos:[]}).then(d => setPhotos(d.photos||[])).catch(()=>{});
  }, [targetId, token]);
  const uploadPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('upload_preset', 'sigo_com_fe');
      const res = await fetch('https://api.cloudinary.com/v1_1/degxiuf43/image/upload', {method:'POST',body:fd});
      const d = await res.json();
      await fetch((import.meta.env.VITE_API_URL||'')+'/api/photos', {method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({url:d.secure_url,caption:photoCaption,visibility:photoVisibility})});
      setPhotos(prev=>[{id:Date.now(),url:d.secure_url,caption:photoCaption,visibility:photoVisibility},...prev]);
      setShowUpload(false); setPhotoCaption('');
    } catch(e) { alert('Erro ao fazer upload'); }
    setUploading(false);
  };
  useEffect(() => {
    if (!targetId) return;
    fetch(API + "/profile/" + targetId, { headers: { Authorization: "Bearer " + token } })
    .then(res => res.json())
    .then(data => { console.log('PERFIL DATA:', JSON.stringify(data)); setUser(data.user || data); setLoading(false); })
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
                <button onClick={() => setShowInfo(!showInfo)} style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: "4px", padding: "5px 9px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Ver Perfil</button>
                <Settings style={{ cursor: "pointer" }} onClick={() => navigate("/settings")} />
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            <span><strong>0</strong> {t("profile.posts","publicacoes")}</span>
            <span><strong>0</strong> {t("profile.followers","juntos na fe")}</span>
            <span><strong>0</strong> {t("profile.following","sigo na fe")}</span>
            {userId && userId !== currentUser?.id && (
              <button onClick={handleFollow} disabled={friendStatus !== null} style={{ background: friendStatus === "accepted" ? "#6C3FA0" : friendStatus === "pending" ? "#ccc" : "transparent", color: friendStatus ? "white" : "#6C3FA0", border: "1px solid #6C3FA0", borderRadius: "20px", padding: "4px 14px", fontWeight: "600", fontSize: "13px", cursor: friendStatus ? "default" : "pointer" }}>{friendStatus === "accepted" ? "✓ irmaos" : friendStatus === "pending" ? "pedido enviado" : t("profile.followers","segui um irmao")}</button>
            )}
          </div>
          <div>
            <span style={{ fontWeight: "600" }}>{user.full_name}</span>
            <p style={{ whiteSpace: "pre-wrap" }}>{user.bio || ""}</p>
          </div>
        </section>
      </header>
      <hr style={{ border: "0", borderTop: "1px solid #dbdbdb", marginBottom: "0" }} />
      {showInfo && (user.city || user.country || user.church_name || user.testimony || user.favorite_verse) && (
        <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:12}}>
          {(user.city || user.country || user.profession) && (
            <div style={{background:"#f9f9fe",borderRadius:12,padding:16,border:"1px solid #eee"}}>
              <div style={{fontWeight:700,color:"#6C3FA0",marginBottom:10,fontSize:15}}>👤 {t("profile.sectionPersonal","Informacoes Pessoais")}</div>
              {user.city && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.city","Cidade")}:</b> {user.city}</div>}
              {user.state && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.state","Estado")}:</b> {user.state}</div>}
              {user.country && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.country","Pais")}:</b> {user.country}</div>}
              {user.profession && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.profession","Profissao")}:</b> {user.profession}</div>}
              {user.marital_status && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.maritalStatus","Estado Civil")}:</b> {user.marital_status}</div>}
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
      <div style={{display:"flex",justifyContent:"center",gap:"20px",fontSize:"12px",fontWeight:"600",borderTop:"1px solid #dbdbdb",marginTop:16}}>
        <div onClick={()=>setActiveTab("all")} style={{cursor:"pointer",padding:"12px 4px",borderTop:activeTab==="all"?"2px solid #262626":"2px solid transparent"}}>Todas</div>
        <div onClick={()=>setActiveTab("foto")} style={{cursor:"pointer",padding:"12px 4px",borderTop:activeTab==="foto"?"2px solid #262626":"2px solid transparent"}}>📸 Fotos</div>
        <div onClick={()=>setActiveTab("video")} style={{cursor:"pointer",padding:"12px 4px",borderTop:activeTab==="video"?"2px solid #262626":"2px solid transparent"}}>🎥 Videos</div>
        <div onClick={()=>setActiveTab("galeria")} style={{cursor:"pointer",padding:"12px 4px",borderTop:activeTab==="galeria"?"2px solid #262626":"2px solid transparent"}}>🖼️ Galeria</div>
      </div>
      {activeTab !== "galeria" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,marginTop:3}}>
          {userPosts.filter(p=>activeTab==="all"?true:activeTab==="foto"?(p.media_url&&!p.media_url.includes("video")):(p.media_url&&p.media_url.includes("video"))).map(p=>(
            <div key={p.id} style={{aspectRatio:"1",overflow:"hidden",background:"#f0f0f0"}}>
              {p.media_url&&p.media_url.includes("video")?<video src={p.media_url} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>:p.media_url?<img src={p.media_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{padding:8,fontSize:11,color:"#666",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"}}>{(p.content||"").slice(0,60)}</div>}
            </div>
          ))}
          {userPosts.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#999"}}>Nenhuma publicacao ainda.</div>}
        </div>
      )}
      {activeTab === "galeria" && (
        <div style={{marginTop:16}}>
          {(!userId||userId===currentUser?.id) && (
            <div style={{marginBottom:12}}>
              <button onClick={()=>setShowUpload(!showUpload)} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:14}}>+ Adicionar Foto</button>
              {showUpload && (
                <div style={{background:"#f9f9fe",borderRadius:12,padding:16,marginTop:10,border:"1px solid #eee"}}>
                  <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadPhoto(e.target.files[0])}/>
                  <select value={photoVisibility} onChange={e=>setPhotoVisibility(e.target.value)} style={{padding:8,borderRadius:8,border:"1px solid #ddd",fontSize:13,width:"100%",marginBottom:8}}>
                    <option value="public">🌎 Publico</option>
                    <option value="friends">🤝 So irmaos</option>
                    <option value="private">🔒 So eu</option>
                  </select>
                  <input placeholder="Legenda" value={photoCaption} onChange={e=>setPhotoCaption(e.target.value)} style={{display:"block",width:"100%",padding:8,borderRadius:8,border:"1px solid #ddd",marginBottom:8,fontSize:13,boxSizing:"border-box"}}/>
                  <button onClick={()=>photoInputRef.current?.click()} disabled={uploading} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"10px 0",cursor:"pointer",fontSize:14,width:"100%"}}>{uploading?"A fazer upload...":"📤 Publicar Foto"}</button>
                </div>
              )}
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3}}>
            {photos.map(p=>(<div key={p.id} style={{aspectRatio:"1",overflow:"hidden",background:"#f0f0f0",position:"relative"}}><img src={p.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>{p.visibility==="friends"&&<span style={{position:"absolute",top:4,right:4}}>🤝</span>}{p.visibility==="private"&&<span style={{position:"absolute",top:4,right:4}}>🔒</span>}</div>))}
            {photos.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#999"}}>Nenhuma foto ainda.</div>}
          </div>
        </div>
      )}
    </div></div>
  );
}
// cover
