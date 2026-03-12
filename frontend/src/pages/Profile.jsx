import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const typeColors = {
  verse: "#F59E0B",
  testimony: "#10B981",
  photo: "#3B82F6",
  prayer: "#8B5CF6",
};
const typeIcons = { verse:"📖", testimony:"🙌", photo:"📸", prayer:"🙏" };

export default function ProfilePage({ onSave, onFollow, onMessage }) {
  const { t } = useTranslation();
  const { userId } = useParams();
  const { user: currentUser, token } = useAuth();

  const isOwnProfile = !userId || userId === currentUser?.id;
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userStats, setUserStats] = useState({ posts: 0, friends: 0, prayers: 0 });

  const [isEditing,      setIsEditing]      = useState(false);
  const [editData,       setEditData]       = useState({ name: profileUser?.name || "", bio: profileUser?.bio || "" });
  const [avatarPreview,  setAvatarPreview]  = useState(profileUser?.photoURL  || null);
  const [coverPreview,   setCoverPreview]   = useState(profileUser?.coverURL  || null);
  const [cropModal,      setCropModal]      = useState(null);
  const [isConsecrating, setIsConsecrating] = useState(profileUser?.isConsecrating || false);
  const [activeTab,      setActiveTab]      = useState("posts");
  const [lightbox,       setLightbox]       = useState(null);
  const avatarRef = useRef();
  const coverRef  = useRef();

  const API_BASE = import.meta.env.VITE_API_URL || '';
  const API = `${API_BASE}/api`;

  useEffect(() => {

  const API_BASE = import.meta.env.VITE_API_URL || '';
  const API = `${API_BASE}/api`;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser && !userId) return; // Not logged in and no specific user ID

      const targetUserId = userId || currentUser?.id;
      if (!targetUserId) return;

      try {
        // Fetch profile user data
        const userRes = await fetch(`${API}/profile/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();
        setProfileUser(userData.user);
        setEditData({ name: userData.user?.name || "", bio: userData.user?.bio || "" });
        setAvatarPreview(userData.user?.photoURL || null);
        setCoverPreview(userData.user?.coverURL || null);
        setIsConsecrating(userData.user?.isConsecrating || false);

        // Fetch user posts
        const postsRes = await fetch(`${API}/feed/user/${targetUserId}?limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const postsData = await postsRes.json();
        setUserPosts(postsData.posts || []);

        // Fetch user stats (assuming stats are part of profile data for now, or fetch separately)
        // For simplicity, let's assume basic stats are part of the user object or derived from posts/friends
        setUserStats({ // Placeholder, real stats would come from backend
          posts: postsData.posts?.length || 0,
          friends: userData.user?.friendsCount || 0, // Assuming a field on user object
          prayers: userData.user?.prayersCount || 0, // Assuming a field on user object
        });

      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        // Handle error, e.g., show an error message
      }
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
    page: {
      minHeight:"100vh",
      background:"linear-gradient(160deg,#060d20 0%,#0a1833 45%,#0d2410 100%)",
      fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif",
      color:"#fff",
    },
    wrap:  { maxWidth:680, margin:"0 auto", paddingBottom:64 },
    cover: {
      position:"relative", height:210,
      borderRadius:"0 0 28px 28px", overflow:"hidden",
      background: coverPreview
        ? `url(${coverPreview}) center/cover no-repeat`
        : "linear-gradient(135deg,#060d20 0%,#0a1e50 40%,#1a4060 70%,#0d2410 100%)",
    },
    coverGlow: {
      position:"absolute", inset:0,
      background:"linear-gradient(135deg,transparent 30%,rgba(245,158,11,0.05) 55%,transparent 75%)",
      pointerEvents:"none",
    },
    coverFade: {
      position:"absolute", bottom:0, left:0, right:0, height:70,
      background:"linear-gradient(to top,rgba(6,13,32,0.7),transparent)",
      pointerEvents:"none",
    },
    body:  { padding:"0 20px" },
    topRow:{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginTop:-52, marginBottom:16 },
    actions:{ display:"flex", gap:8, paddingBottom:6, flexWrap:"wrap", justifyContent:"flex-end" },
    nameLine:{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 },
    h1:  { fontSize:22, fontWeight:800, letterSpacing:"-0.4px" },
    handle:{ color:"rgba(255,255,255,0.32)", fontSize:12, marginBottom:8 },
    bio: { color:"rgba(255,255,255,0.68)", fontSize:14, lineHeight:1.65, marginBottom:14 },
    meta:{ display:"flex", flexWrap:"wrap", gap:14, marginBottom:20 },
    metaItem:{ display:"flex", alignItems:"center", gap:5, color:"rgba(255,255,255,0.35)", fontSize:12 },
    stats:{ display:"flex", gap:10, marginBottom:20 },
    divider:{ height:1, background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.18),transparent)", margin:"20px 0" },
    tabs:{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.06)", marginBottom:20 },
    emptyState:{ textAlign:"center", padding:"48px 0", color:"rgba(255,255,255,0.22)" },
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}

        .pb{padding:10px 20px;border-radius:50px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .22s ease;letter-spacing:.2px}
        .pb:hover{transform:translateY(-2px)} .pb:active{transform:translateY(0)}
        .pb-gold{background:linear-gradient(135deg,#F59E0B,#D97706);color:#060d20;box-shadow:0 4px 20px rgba(245,158,11,.35)}
        .pb-gold:hover{box-shadow:0 6px 28px rgba(245,158,11,.55)}
        .pb-blue{background:linear-gradient(135deg,#1D4ED8,#1E40AF);color:#fff;box-shadow:0 4px 18px rgba(29,78,216,.3)}
        .pb-ghost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.11);backdrop-filter:blur(8px)}
        .pb-ghost:hover{background:rgba(255,255,255,.12)}
        .pb-fire{background:${isConsecrating?"linear-gradient(135deg,#374151,#1F2937)":"linear-gradient(135deg,#F97316,#DC2626)"};color:#fff;
          box-shadow:${isConsecrating?"none":"0 4px 20px rgba(249,115,22,.4)"};
          animation:${isConsecrating?"fireGlow 2s ease-in-out infinite":"none"}}
        @keyframes fireGlow{0%,100%{box-shadow:0 4px 20px rgba(249,115,22,.5)}50%{box-shadow:0 4px 36px rgba(249,115,22,.9)}}

        .tab-b{padding:12px 18px;background:transparent;border:none;color:rgba(255,255,255,.38);font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s}
        .tab-b.act{color:#F59E0B;border-bottom-color:#F59E0B}
        .tab-b:hover:not(.act){color:rgba(255,255,255,.7)}

        .pc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:18px;transition:all .22s;cursor:pointer}
        .pc:hover{background:rgba(245,158,11,.04);border-color:rgba(245,158,11,.18);transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.3)}

        .sb{text-align:center;padding:16px 8px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:18px;flex:1;transition:all .22s;cursor:default}
        .sb:hover{background:rgba(245,158,11,.05);border-color:rgba(245,158,11,.22);transform:translateY(-2px)}

        .av-ring{width:104px;height:104px;border-radius:50%;padding:3px;background:linear-gradient(135deg,#1D4ED8,#F59E0B);cursor:pointer;transition:transform .2s;flex-shrink:0}
        .av-ring:hover{transform:scale(1.04)}
        .av-inner{width:100%;height:100%;border-radius:50%;background:#0a1833;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:800;color:#F59E0B;position:relative}
        .av-overlay{position:absolute;inset:0;background:rgba(0,0,0,.65);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;opacity:0;transition:opacity .2s}
        .av-inner:hover .av-overlay{opacity:1}

        .cov-btn{position:absolute;bottom:12px;right:12px;padding:7px 14px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.18);border-radius:50px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;backdrop-filter:blur(8px);transition:all .2s;font-family:'Plus Jakarta Sans',sans-serif}
        .cov-btn:hover{background:rgba(0,0,0,.8)}

        .badge-fire{display:inline-flex;align-items:center;gap:5px;padding:3px 11px;border-radius:50px;font-size:11px;font-weight:700;background:rgba(249,115,22,.15);border:1px solid rgba(249,115,22,.35);color:#FB923C;animation:bp 2s infinite}
        @keyframes bp{0%,100%{opacity:1}50%{opacity:.6}}
        .badge-ch{display:inline-flex;align-items:center;gap:5px;padding:3px 11px;border-radius:50px;font-size:11px;font-weight:600;background:rgba(29,78,216,.15);border:1px solid rgba(29,78,216,.28);color:#60A5FA}

        .inp{width:100%;padding:12px 16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:14px;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;outline:none;transition:border-color .2s}
        .inp:focus{border-color:#F59E0B} .inp::placeholder{color:rgba(255,255,255,.22)}

        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(12px)}
        .modal-box{background:linear-gradient(160deg,#0a1833,#060d20);border:1px solid rgba(245,158,11,.15);border-radius:24px;padding:32px;width:90%;max-width:420px;box-shadow:0 32px 64px rgba(0,0,0,.7),0 0 0 1px rgba(245,158,11,.08)}
      `}</style>

      <div style={S.wrap}>

        {/* COVER */}
        <div style={S.cover}>
          {!coverPreview && <><div style={S.coverGlow}/><div style={S.coverFade}/></>}
          {isOwnProfile && (
            <button className="cov-btn" onClick={() => coverRef.current?.click()}>
              📷 {t("profile.editCover","Alterar capa")}
            </button>
          )}
          <input ref={coverRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleCoverChange}/>
        </div>

        <div style={S.body}>

          {/* AVATAR + ACTIONS */}
          <div style={S.topRow}>
            <div className="av-ring" onClick={() => {
              if (avatarPreview) setLightbox(avatarPreview);
              else if (isOwnProfile) avatarRef.current?.click();
            }}>
              <div className="av-inner">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : (user?.name?.charAt(0) || "?")}
                {isOwnProfile && <div className="av-overlay">✏️</div>}
              </div>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarChange}/>

            <div style={S.actions}>
              {isOwnProfile ? <>
                <button className="pb pb-fire" onClick={() => setIsConsecrating(!isConsecrating)}>
                  {isConsecrating ? `🔥 ${t("consecration.consecrating","Consagrando...")}` : `🔥 ${t("profile.consecrate","Consagrar")}`}
                </button>
                <button className="pb pb-ghost" onClick={() => setIsEditing(true)}>
                  ✏️ {t("profile.editProfile","Editar")}
                </button>
              </> : <>
                {profileUser && <button className="pb pb-blue" onClick={onMessage}>💬 {t("messages.title","Mensagem")}</button>}
                {profileUser && <button className="pb pb-gold" onClick={onFollow}>➕ {t("friends.addFriend","Seguir")}</button>}
              </>}
            </div>
          </div>

          {/* NAME */}
          <div style={S.nameLine}>
            <h1 style={S.h1}>{profileUser?.name || t("common.user","Utilizador")}</h1>
            {isConsecrating && <span className="badge-fire">🔥 {t("consecration.consecrating","Em Consagração")}</span>}
            {profileUser?.church && <span className="badge-ch">⛪ {profileUser.church}</span>}
          </div>
          {profileUser?.handle && <p style={S.handle}>{profileUser.handle}</p>}
          {profileUser?.bio    && <p style={S.bio}>{profileUser.bio}</p>}

          {/* META */}
          <div style={S.meta}>
            {[
              profileUser?.church   && { icon:"⛪", text: profileUser.church },
              profileUser?.location && { icon:"📍", text: profileUser.location },
              profileUser?.joinDate && { icon:"📅", text:`${t("profile.memberSince","Desde")} ${profileUser.joinDate}` },
            ].filter(Boolean).map((m,i) => (
              <span key={i} style={S.metaItem}><span>{m.icon}</span><span>{m.text}</span></span>
            ))}
          </div>

          {/* STATS */}
          <div style={S.stats}>
            {[
              { label:t("profile.posts","Posts"),          value:userStats.posts   ||0, icon:"📝" },
              { label:t("profile.friends","Amigos"),       value:userStats.friends ||0, icon:"👥" },
              { label:t("nav.prayers","Orações"),          value:userStats.prayers ||0, icon:"🙏" },
            ].map((s,i) => (
              <div key={i} className="sb">
                <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
                <div style={{fontSize:22,fontWeight:800,color:"#F59E0B",lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.32)",fontWeight:500,marginTop:4,textTransform:"uppercase",letterSpacing:".5px"}}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={S.divider}/>

          {/* TABS */}
          <div style={S.tabs}>
            {[
              {key:"posts",   lbl:`📝 ${t("profile.posts","Posts")}`},
              {key:"prayers", lbl:`🙏 ${t("nav.prayers","Orações")}`},
              {key:"friends", lbl:`👥 ${t("profile.friends","Amigos")}`},
            ].map(tab => (
              <button key={tab.key} className={`tab-b ${activeTab===tab.key?"act":""}`} onClick={()=>setActiveTab(tab.key)}>
                {tab.lbl}
              </button>
            ))}
          </div>

          {/* POSTS */}
          {activeTab==="posts" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(userPosts||[]).length===0
                ? <div style={S.emptyState}><div style={{fontSize:40,marginBottom:10}}>📝</div><p style={{fontSize:13}}>{t("common.noPostsYet","Nenhum post ainda")}</p></div>
                : (userPosts||[]).map(p=>(
                  <div key={p.id} className="pc">
                    <div style={{marginBottom:10}}>
                      <span style={{padding:"3px 10px",borderRadius:50,fontSize:11,fontWeight:600,
                        background:`${typeColors[p.type]||"#F59E0B"}18`,color:typeColors[p.type]||"#F59E0B",
                        border:`1px solid ${typeColors[p.type]||"#F59E0B"}33`}}>
                        {typeIcons[p.type]} {p.type}
                      </span>
                    </div>
                    <p style={{color:"rgba(255,255,255,.75)",fontSize:14,lineHeight:1.6,marginBottom:12}}>{p.content}</p>
                    <div style={{display:"flex",gap:16}}>
                      <span style={{color:"rgba(255,255,255,.28)",fontSize:12}}>❤️ {p.likes}</span>
                      <span style={{color:"rgba(255,255,255,.28)",fontSize:12}}>💬 {p.comments}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
          {(activeTab==="prayers"||activeTab==="friends") && (
            <div style={S.emptyState}>
              <div style={{fontSize:44,marginBottom:12}}>{activeTab==="prayers"?"🙏":"👥"}</div>
              <p style={{fontSize:13}}>{t("common.noPostsYet","Nada por aqui ainda")}</p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="modal-bg" onClick={()=>setIsEditing(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h2 style={{fontSize:18,fontWeight:700,marginBottom:6}}>✏️ {t("profile.editProfile","Editar Perfil")}</h2>
            <p style={{fontSize:12,color:"rgba(255,255,255,.32)",marginBottom:24}}>{t("profile.addPhotoDesc","Atualize suas informações")}</p>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:"rgba(255,255,255,.32)",marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:".5px"}}>{t("register.fullName","Nome")}</label>
              <input className="inp" value={editData.name} onChange={e=>setEditData({...editData,name:e.target.value})} placeholder={t("register.fullNamePlaceholder","Seu nome")}/>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:11,color:"rgba(255,255,255,.32)",marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:".5px"}}>{t("profile.bio","Bio")}</label>
              <textarea className="inp" value={editData.bio} onChange={e=>setEditData({...editData,bio:e.target.value})} placeholder={t("profile.noBio","Conte algo sobre você...")} rows={3} style={{resize:"none"}}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="pb pb-gold" style={{flex:1}} onClick={handleSave}>✅ {t("profile.save","Salvar")}</button>
              <button className="pb pb-ghost" onClick={()=>setIsEditing(false)}>{t("profile.cancel","Cancelar")}</button>
            </div>
          </div>
        </div>
      )}

      {/* CROP MODAL */}
      {cropModal && (
        <div className="modal-bg">
          <div className="modal-box" style={{textAlign:"center"}}>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:6}}>📸 {t("profile.addPhotoPrompt","Pré-visualizar foto")}</h2>
            <p style={{fontSize:12,color:"rgba(255,255,255,.32)",marginBottom:20}}>{t("profile.addPhotoDesc","Esta será sua foto de perfil")}</p>
            <div style={{width:150,height:150,borderRadius:"50%",margin:"0 auto 24px",
              background:`url(${cropModal.url}) center/cover`,
              boxShadow:"0 0 0 3px #F59E0B,0 8px 32px rgba(245,158,11,.3)"}}/>
            <div style={{display:"flex",gap:10}}>
              <button className="pb pb-gold" style={{flex:1}} onClick={()=>{
                if(cropModal.type==="avatar") setAvatarPreview(cropModal.url);
                setCropModal(null);
              }}>✅ {t("profile.save","Usar esta foto")}</button>
              <button className="pb pb-ghost" onClick={()=>setCropModal(null)}>{t("profile.cancel","Cancelar")}</button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="modal-bg" onClick={()=>setLightbox(null)}>
          <img src={lightbox} alt="profile" style={{maxWidth:"88vw",maxHeight:"88vh",borderRadius:20,
            boxShadow:"0 0 0 2px rgba(245,158,11,.3),0 32px 64px rgba(0,0,0,.8)"}}/>
        </div>
      )}
    </div>
  );
}
