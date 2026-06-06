jsx = '''import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Loader2, Settings } from "lucide-react";
const API = (import.meta.env.VITE_API_URL || "") + "/api";
export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState({ user: null, posts: [], photos: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [friendStatus, setFriendStatus] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoVisibility, setPhotoVisibility] = useState("public");
  const [amens, setAmens] = useState(0);
  const [amenDado, setAmenDado] = useState(false);
  const photoInputRef = useRef(null);
  const targetId = userId || currentUser?.id;
  const isOwner = !userId || userId === currentUser?.id;
  useEffect(() => {
    if (!targetId) return;
    const load = async () => {
      setLoading(true);
      try {
        const h = token ? { Authorization: "Bearer " + token } : {};
        const [uRes, pRes, phRes] = await Promise.all([
          fetch(API + "/profile/" + targetId, { headers: h }).then(r => r.json()),
          fetch(API + "/feed", { headers: h }).then(r => r.json()),
          fetch(API + "/photos/" + targetId, { headers: h }).then(r => r.json())
        ]);
        setData({
          user: uRes.user || uRes,
          posts: (pRes.posts || []).filter(p => p.user_id === targetId || p.author_id === targetId),
          photos: phRes.photos || []
        });
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [targetId, token]);
  useEffect(() => {
    if (!token || !userId || isOwner) return;
    fetch(API + "/friends", { headers: { Authorization: "Bearer " + token } })
    .then(r => r.json()).then(d => { if ((d.friends||[]).find(f => f.id === userId)) setFriendStatus("accepted"); }).catch(() => {});
  }, [token, userId]);
  const handleFollow = async () => {
    if (!token || friendStatus) return;
    try { await fetch(API + "/friends/request", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ addresseeId: userId }) }); setFriendStatus("pending"); } catch(e) {}
  };
  const uploadPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("upload_preset", "sigo_com_fe");
      const res = await fetch("https://api.cloudinary.com/v1_1/degxiuf43/image/upload", { method: "POST", body: fd });
      const d = await res.json();
      await fetch(API + "/photos", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ url: d.secure_url, caption: photoCaption, visibility: photoVisibility }) });
      setData(prev => ({ ...prev, photos: [{ id: Date.now(), url: d.secure_url, caption: photoCaption, visibility: photoVisibility }, ...prev.photos] }));
      setShowUpload(false); setPhotoCaption("");
    } catch(e) { alert("Erro ao fazer upload"); }
    setUploading(false);
  };
  const filteredPosts = useMemo(() => {
    if (activeTab === "all") return data.posts;
    return data.posts.filter(p => activeTab === "foto" ? (p.media_url && !p.media_url.includes("video")) : (p.media_url && p.media_url.includes("video")));
  }, [data.posts, activeTab]);
  if (loading) return <div style={{display:"flex",justifyContent:"center",padding:"50px"}}><Loader2 className="animate-spin"/></div>;
  if (!data.user) return <div style={{textAlign:"center",padding:"20px"}}>Utilizador nao encontrado.</div>;
  const u = data.user;
  const tabs = [["all",t("profile.allPosts","Todas")],["foto","📸 "+t("profile.photos","Fotos")],["video","🎥 "+t("profile.videos","Videos")],["galeria","🖼️ "+t("profile.gallery","Galeria")]];
  return (
    <div style={{maxWidth:"935px",margin:"0 auto"}}>
      {u.cover_url && <img src={u.cover_url} style={{width:"100%",height:"200px",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>}
      <div style={{padding:"20px"}}>
        <header style={{display:"flex",gap:"30px",marginBottom:"30px",flexWrap:"wrap"}}>
          <div style={{position:"relative",flexShrink:0}}>
            <img src={u.avatar_url||"/pro.jpg"} style={{width:"120px",height:"120px",borderRadius:"50%",objectFit:"cover",border:"1px solid #dbdbdb"}} onError={e=>e.target.src="/pro.jpg"}/>
            <button onClick={()=>{if(!amenDado){setAmens(a=>a+1);setAmenDado(true);}}} style={{position:"absolute",bottom:4,right:4,background:amenDado?"#6C3FA0":"white",border:"2px solid #6C3FA0",borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>🙏</button>
            {amens>0&&<span style={{position:"absolute",bottom:4,left:0,background:"#6C3FA0",color:"white",borderRadius:12,padding:"2px 6px",fontSize:11,fontWeight:"bold"}}>{amens}</span>}
          </div>
          <section style={{flex:1,minWidth:200}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px",flexWrap:"wrap"}}>
              <h2 style={{fontSize:"22px",fontWeight:"300",margin:0}}>{u.username||u.full_name||"Usuario"}</h2>
              {isOwner ? (<><button onClick={()=>navigate("/settings")} style={{background:"transparent",border:"1px solid #dbdbdb",borderRadius:"4px",padding:"5px 9px",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>{t("profile.editProfile","Editar")}</button><button onClick={()=>setShowInfo(!showInfo)} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:"4px",padding:"5px 9px",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>{t("profile.viewProfile","Ver Info")}</button><Settings size={18} style={{cursor:"pointer"}} onClick={()=>navigate("/settings")}/></>) : (<button onClick={handleFollow} disabled={!!friendStatus} style={{background:friendStatus==="accepted"?"#6C3FA0":friendStatus==="pending"?"#aaa":"transparent",color:friendStatus?"white":"#6C3FA0",border:"1px solid #6C3FA0",borderRadius:"20px",padding:"4px 14px",fontWeight:"600",fontSize:"13px",cursor:friendStatus?"default":"pointer"}}>{friendStatus==="accepted"?"✓ "+t("profile.following","irmaos"):friendStatus==="pending"?t("profile.requestSent","pedido enviado"):t("profile.followers","segui um irmao")}</button>)}
            </div>
            <div style={{display:"flex",gap:"24px",marginBottom:"12px",flexWrap:"wrap"}}>
              <span><strong>{data.posts.length}</strong> {t("profile.posts","publicacoes")}</span>
              <span><strong>{data.photos.length}</strong> {t("profile.photos","fotos")}</span>
              <span><strong>0</strong> {t("profile.following","irmaos")}</span>
            </div>
            <div style={{fontSize:14}}><b>{u.full_name}</b><p style={{margin:"4px 0",color:"#555"}}>{u.bio||""}</p></div>
          </section>
        </header>
        {showInfo&&(u.city||u.country||u.church_name||u.testimony||u.favorite_verse)&&(
          <div style={{marginBottom:16,display:"flex",flexDirection:"column",gap:10}}>
            {(u.city||u.country||u.profession)&&(<div style={{background:"#f9f9fe",borderRadius:10,padding:14,border:"1px solid #eee"}}><b style={{color:"#6C3FA0"}}>👤 {t("profile.sectionPersonal","Info Pessoais")}</b><br/>{u.city&&<span style={{fontSize:13,marginRight:12}}>{t("profile.city","Cidade")}: {u.city}</span>}{u.country&&<span style={{fontSize:13,marginRight:12}}>{t("profile.country","Pais")}: {u.country}</span>}{u.profession&&<span style={{fontSize:13}}>{t("profile.profession","Profissao")}: {u.profession}</span>}</div>)}
            {(u.church_name||u.denomination)&&(<div style={{background:"#f9f9fe",borderRadius:10,padding:14,border:"1px solid #eee"}}><b style={{color:"#6C3FA0"}}>✝️ {t("profile.sectionChurch","Igreja")}</b><br/>{u.church_name&&<span style={{fontSize:13,marginRight:12}}>{t("profile.church","Igreja")}: {u.church_name}</span>}{u.church_role&&<span style={{fontSize:13}}>{t("profile.churchRole","Funcao")}: {u.church_role}</span>}</div>)}
            {u.favorite_verse&&(<div style={{background:"#f9f9fe",borderRadius:10,padding:14,border:"1px solid #eee"}}><b style={{color:"#6C3FA0"}}>📖 {t("profile.favoriteVerse","Versiculo")}</b><p style={{fontSize:13,fontStyle:"italic",color:"#444",margin:"4px 0"}}>{u.favorite_verse}</p></div>)}
            {u.testimony&&(<div style={{background:"#f9f9fe",borderRadius:10,padding:14,border:"1px solid #eee"}}><b style={{color:"#6C3FA0"}}>🙏 {t("profile.testimony","Testemunho")}</b><p style={{fontSize:13,color:"#444",whiteSpace:"pre-wrap",margin:"4px 0"}}>{u.testimony}</p></div>)}
          </div>
        )}
        <div style={{display:"flex",justifyContent:"center",gap:"16px",fontSize:"12px",fontWeight:"600",borderTop:"1px solid #dbdbdb",marginTop:8}}>
          {tabs.map(([tab,label])=>(<div key={tab} onClick={()=>setActiveTab(tab)} style={{cursor:"pointer",padding:"12px 4px",borderTop:activeTab===tab?"2px solid #262626":"2px solid transparent",whiteSpace:"nowrap"}}>{label}</div>))}
        </div>
        {activeTab!=="galeria"&&(<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,marginTop:3}}>{filteredPosts.map(p=>(<div key={p.id} style={{aspectRatio:"1",overflow:"hidden",background:"#f0f0f0"}}>{p.media_url&&p.media_url.includes("video")?<video src={p.media_url} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>:p.media_url?<img src={p.media_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{padding:8,fontSize:11,color:"#666",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"}}>{(p.content||"").slice(0,60)}</div>}</div>))}{filteredPosts.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#999"}}>{t("profile.noPosts","Nenhuma publicacao ainda.")}</div>}</div>)}
        {activeTab==="galeria"&&(<div style={{marginTop:16}}>{isOwner&&(<div style={{marginBottom:12}}><button onClick={()=>setShowUpload(!showUpload)} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:14}}>+ {t("profile.addPhoto","Adicionar Foto")}</button>{showUpload&&(<div style={{background:"#f9f9fe",borderRadius:12,padding:16,marginTop:10,border:"1px solid #eee"}}><input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadPhoto(e.target.files[0])}/><select value={photoVisibility} onChange={e=>setPhotoVisibility(e.target.value)} style={{padding:8,borderRadius:8,border:"1px solid #ddd",fontSize:13,width:"100%",marginBottom:8}}><option value="public">🌎 {t("profile.visPublic","Publico")}</option><option value="friends">🤝 {t("profile.visFriends","So irmaos")}</option><option value="private">🔒 {t("profile.visPrivate","So eu")}</option></select><input placeholder={t("profile.photoCaption","Legenda")} value={photoCaption} onChange={e=>setPhotoCaption(e.target.value)} style={{display:"block",width:"100%",padding:8,borderRadius:8,border:"1px solid #ddd",marginBottom:8,fontSize:13,boxSizing:"border-box"}}/><button onClick={()=>photoInputRef.current?.click()} disabled={uploading} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"10px 0",cursor:"pointer",fontSize:14,width:"100%"}}>{uploading?t("profile.uploading","A fazer upload..."):"📤 "+t("profile.addPhoto","Publicar Foto")}</button></div>)}</div>)}<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3}}>{data.photos.map(p=>(<div key={p.id} style={{aspectRatio:"1",overflow:"hidden",background:"#f0f0f0",position:"relative"}}><img src={p.url} alt={p.caption||""} style={{width:"100%",height:"100%",objectFit:"cover"}}/>{p.visibility==="friends"&&<span style={{position:"absolute",top:4,right:4}}>🤝</span>}{p.visibility==="private"&&<span style={{position:"absolute",top:4,right:4}}>🔒</span>}</div>))}{data.photos.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#999"}}>{t("profile.noPhotos","Nenhuma foto ainda.")}</div>}</div></div>)}
      </div>
    </div>
  );
}
'''
with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(jsx)
print('Feito!')
