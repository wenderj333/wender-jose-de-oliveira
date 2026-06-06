import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Loader2, Settings } from "lucide-react";
import PhotoModal from "../components/PhotoModal";
import PhotoUploader from "../components/PhotoUploader";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuth();
  const { t } = useTranslation();
  
  // ESTADOS LIMPOS (Removidas duplicatas)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amens, setAmens] = useState(0);
  const [amenDado, setAmenDado] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [photos, setPhotos] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [selPhoto, setSelPhoto] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);

  const targetId = userId || currentUser?.id;

  // EFEITOS E LÓGICA
  useEffect(() => {
    if (!targetId || !token) return;
    
    // Carregar Perfil
    fetch(`${API}/profile/${targetId}`, { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(d => { setUser(d.user || d); setLoading(false); })
      .catch(() => setLoading(false));

    // Carregar Feed e Fotos
    fetch(`${API}/feed`, { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(d => setUserPosts((d.posts || []).filter(p => p.user_id === targetId || p.author_id === targetId)))
      .catch(() => {});

    fetch(`${API}/photos/${targetId}`, { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.ok ? r.json() : { photos: [] })
      .then(d => setPhotos(d.photos || []))
      .catch(() => {});
  }, [targetId, token]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}><Loader2 className="animate-spin" /></div>;
  if (!user) return <div style={{ textAlign: "center", padding: "20px" }}>Utilizador não encontrado.</div>;

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "0" }}>
      {user.cover_url && <img src={user.cover_url} style={{width:"100%",height:"200px",objectFit:"cover"}} onError={e=>e.target.style.display="none"} />}
      
      <div style={{padding:"20px"}}>
        {/* HEADER DO PERFIL */}
        <header style={{ display: "flex", alignItems: "center", marginBottom: "44px", gap: "30px" }}>
          <div style={{position:"relative",display:"inline-block"}}>
            <img src={user.avatar_url || "/pro.jpg"} style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover", border: "1px solid #dbdbdb" }} onError={e => e.target.src="/pro.jpg"} />
            <button onClick={()=>{if(!amenDado){setAmens(a=>a+1);setAmenDado(true);}}} style={{position:"absolute",bottom:4,right:4,background:amenDado?"#6C3FA0":"white",border:"2px solid #6C3FA0",borderRadius:"50%",width:38,height:38,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>🙏</button>
          </div>
          <section>
             <h2>{user.username || user.full_name}</h2>
             <p>{user.bio}</p>
          </section>
        </header>

        {/* ABAS */}
        <div style={{display:"flex",justifyContent:"center",gap:"20px",borderTop:"1px solid #dbdbdb",marginTop:16}}>
          {['all', 'foto', 'video', 'galeria'].map(tab => (
            <div key={tab} onClick={()=>setActiveTab(tab)} style={{cursor:"pointer",padding:"12px 4px",borderTop:activeTab===tab?"2px solid #262626":"2px solid transparent"}}>{tab.toUpperCase()}</div>
          ))}
        </div>

        {/* GALERIA */}
        {activeTab === "galeria" && (
          <div style={{marginTop:16}}>
            {(!userId || userId === currentUser?.id) && (
              <button onClick={()=>setShowUploader(true)} style={{background:"#6C3FA0",color:"white",padding:"8px 16px",borderRadius:8,marginBottom:12}}>+ Adicionar Foto</button>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3}}>
              {photos.map(p => (
                <img key={p.id} src={p.url} onClick={()=>setSelPhoto(p.url)} style={{aspectRatio:"1",objectFit:"cover",cursor:"pointer"}} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAIS */}
      <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />
      {showUploader && (
        <PhotoUploader 
          token={token} 
          onSuccess={(p)=>{ setPhotos(prev=>[p,...prev]); setShowUploader(false); }} 
          onClose={()=>setShowUploader(false)} 
        />
      )}
    </div>
  );
}