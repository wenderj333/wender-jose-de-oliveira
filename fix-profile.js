const fs = require('fs');
const content = `import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const typeColors = { verse:"#F59E0B", testimony:"#10B981", photo:"#3B82F6", prayer:"#8B5CF6" };
const typeIcons = { verse:"📖", testimony:"🙌", photo:"📸", prayer:"🙏" };

export default function ProfilePage({ onSave, onFollow, onMessage }) {
  const { t } = useTranslation();
  const { userId } = useParams();
  const { user: currentUser, token } = useAuth();
  const isOwnProfile = !userId || userId === currentUser?.id;
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userStats, setUserStats] = useState({ posts: 0, friends: 0, prayers: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", bio: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [cropModal, setCropModal] = useState(null);
  const [isConsecrating, setIsConsecrating] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [lightbox, setLightbox] = useState(null);
  const avatarRef = useRef();
  const coverRef = useRef();
  const API_BASE = import.meta.env.VITE_API_URL || '';
  const API = \`\${API_BASE}/api\`;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser && !userId) return;
      const targetUserId = userId || currentUser?.id;
      if (!targetUserId) return;
      try {
        const userRes = await fetch(\`\${API}/profile/\${targetUserId}\`, { headers: { Authorization: \`Bearer \${token}\` } });
        const userData = await userRes.json();
        setProfileUser(userData.user);
        setEditData({ name: userData.user?.full_name || "", bio: userData.user?.bio || "" });
        setAvatarPreview(userData.user?.avatar_url || null);
        setCoverPreview(userData.user?.cover_url || null);
        const postsRes = await fetch(\`\${API}/feed/user/\${targetUserId}?limit=50\`, { headers: { Authorization: \`Bearer \${token}\` } });
        const postsData = await postsRes.json();
        setUserPosts(postsData.posts || []);
        setUserStats({ posts: postsData.posts?.length || 0, friends: userData.user?.friendsCount || 0, prayers: userData.user?.prayersCount || 0 });
      } catch (error) { console.error("Failed to fetch profile data:", error); }
    };
    fetchProfileData();
  }, [userId, currentUser?.id, token]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setCropModal({ type:"avatar", url: URL.createObjectURL(file) });
  };
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  };
  const handleSave = () => { if (onSave) onSave(editData); setIsEditing(false); };

  const S = {
    page: { minHeight:"100vh", background:"linear-gradient(160deg,#060d20 0%,#0a1833 45%,#0d2410 100%)", fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif", color:"#fff" },
    wrap: { maxWidth:680, margin:"0 auto", paddingBottom:64 },
    cover: { position:"relative", height:210, borderRadius:"0 0 28px 28px", overflow:"hidden", background: coverPreview ? \`url(\${coverPreview}) center/cover no-repeat\` : "linear-gradient(135deg,#060d20 0%,#0a1e50 40%,#1a4060 70%,#0d2410 100%)" },
    body: { padding:"0 20px" },
    topRow: { display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginTop:-52, marginBottom:16 },
    actions: { display:"flex", gap:8, paddingBottom:6, flexWrap:"wrap", justifyContent:"flex-end" },
    nameLine: { display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 },
    h1: { fontSize:22, fontWeight:800 },
    handle: { color:"rgba(255,255,255,0.32)", fontSize:12, marginBottom:8 },
    bio: { color:"rgba(255,255,255,0.68)", fontSize:14, lineHeight:1.65, marginBottom:14 },
    meta: { display:"flex", flexWrap:"wrap", gap:14, marginBottom:20 },
    metaItem: { display:"flex", alignItems:"center", gap:5, color:"rgba(255,255,255,0.35)", fontSize:12 },
    stats: { display:"flex", gap:10, marginBottom:20 },
    divider: { height:1, background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.18),transparent)", margin:"20px 0" },
    tabs: { display:"flex", borderBottom:"1px solid rgba(255,255,255,0.06)", marginBottom:20 },
    emptyState: { textAlign:"center", padding:"48px 0", color:"rgba(255,255,255,0.22)" },
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.cover}>
          {isOwnProfile && <button onClick={() => coverRef.current?.click()} style={{position:"absolute",bottom:12,right:12,padding:"7px 14px",background:"rgba(0,0,0,.55)",border:"1px solid rgba(255,255,255,.18)",borderRadius:50,color:"#fff",fontSize:12,cursor:"pointer"}}>📷 {t("profile.editCover","Alterar capa")}</button>}
          <input ref={coverRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleCoverChange}/>
        </div>
        <div style={S.body}>
          <div style={S.topRow}>
            <div style={{width:104,height:104,borderRadius:"50%",padding:3,background:"linear-gradient(135deg,#1D4ED8,#F59E0B)",cursor:"pointer"}} onClick={() => { if (avatarPreview) setLightbox(avatarPreview); else if (isOwnProfile) avatarRef.current?.click(); }}>
              <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"#0a1833",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,fontWeight:800,color:"#F59E0B"}}>
                {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (currentUser?.name?.charAt(0) || "?")}
              </div>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarChange}/>
            <div style={S.actions}>
              {isOwnProfile ? <>
                <button onClick={() => setIsConsecrating(!isConsecrating)} style={{padding:"10px 20px",borderRadius:50,border:"none",background:"linear-gradient(135deg,#F97316,#DC2626)",color:"#fff",fontWeight:700,cursor:"pointer"}}>🔥 {t("profile.consecrate","Consagrar")}</button>
                <button onClick={() => setIsEditing(true)} style={{padding:"10px 20px",borderRadius:50,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.06)",color:"#fff",fontWeight:600,cursor:"pointer"}}>✏️ {t("profile.editProfile","Editar")}</button>
              </> : <>
                <button onClick={onMessage} style={{padding:"10px 20px",borderRadius:50,border:"none",background:"linear-gradient(135deg,#1D4ED8,#1E40AF)",color:"#fff",fontWeight:600,cursor:"pointer"}}>💬 {t("messages.title","Mensagem")}</button>
                <button onClick={onFollow} style={{padding:"10px 20px",borderRadius:50,border:"none",background:"linear-gradient(135deg,#F59E0B,#D97706)",color:"#060d20",fontWeight:700,cursor:"pointer"}}>➕ {t("friends.addFriend","Seguir")}</button>
              </>}
            </div>
          </div>
          <div style={S.nameLine}>
            <h1 style={S.h1}>{profileUser?.full_name || t("common.user","Utilizador")}</h1>
          </div>
          {profileUser?.bio && <p style={S.bio}>{profileUser.bio}</p>}
          <div style={S.meta}>
            {profileUser?.church_name && <span style={S.metaItem}>⛪ {profileUser.church_name}</span>}
            {profileUser?.location && <span style={S.metaItem}>📍 {profileUser.location}</span>}
          </div>
          <div style={S.stats}>
            {[
              { label:t("profile.posts","Posts"), value:userStats.posts||0, icon:"📝" },
              { label:t("profile.friends","Amigos"), value:userStats.friends||0, icon:"👥" },
              { label:t("nav.prayers","Orações"), value:userStats.prayers||0, icon:"🙏" },
            ].map((s,i) => (
              <div key={i} style={{textAlign:"center",padding:"16px 8px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:18,flex:1}}>