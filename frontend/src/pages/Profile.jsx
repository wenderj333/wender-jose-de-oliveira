import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Camera, Edit2, Grid, List, Heart, MessageCircle, UserPlus, UserCheck, Send, X, Settings, MapPin, Church, Link as LinkIcon } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sigo_com_fe';

async function uploadPhoto(file) {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
  const data = await res.json();
  return data.secure_url;
}

export default function Profile() {
  const { userId, id } = useParams(); const _userId = userId || id;
  const { user: currentUser, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const avatarRef = useRef(null);
  const [showAvatarBig, setShowAvatarBig] = React.useState(false);
  const coverRef = useRef(null);

  const targetId = _userId || currentUser?.id;
  const isOwn = !userId || userId === currentUser?.id;
  const [cropModal, setCropModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropType, setCropType] = useState('avatar');
  const onCropComplete = useCallback((_, p) => setCroppedAreaPixels(p), []);
  const getCroppedImage = async () => {
    const image = new Image();
    image.src = cropImage;
    await new Promise(r => { image.onload = r; });
    const canvas = document.createElement('canvas');
    canvas.width = croppedAreaPixels.width; canvas.height = croppedAreaPixels.height;
    canvas.getContext('2d').drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  };
  const handleCropSave = async () => {
    try {
      const blob = await getCroppedImage();
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      const url = await uploadPhoto(file);
      const field = cropType === 'avatar' ? 'avatar_url' : 'cover_url';
      setProfile(prev => ({ ...prev, [field]: url }));
      await fetch(API + '/profile', { method: 'PATCH', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: url }) });
      setCropModal(false); setCropImage(null);
    } catch(e) { console.error(e); }
  };

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [editMode, setEditMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editData, setEditData] = useState({ full_name: '', bio: '', location: '', church_name: '' });
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    Promise.all([
        fetch(`${API}/profile/${targetId}`, { headers }).then(r => r.json()),
        fetch(`${API}/feed/user/${targetId}?limit=30`, { headers }).then(r => r.json()),
    ]).then(([profileData, feedData]) => {
      const u = profileData.user || profileData;
      setProfile(u);
      setEditData({ full_name: u.full_name || '', bio: u.bio || '', location: '', church_name: u.church_name || '' });
      setPosts(feedData.posts || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [targetId, token]);

  async function saveProfile() {
    const res = await fetch(`${API}/profile`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile(prev => ({ ...prev, ...editData }));
      setEditMode(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setCropImage(reader.result); setCropType('avatar'); setCropModal(true); setCrop({x:0,y:0}); setZoom(1); };
    reader.readAsDataURL(file); e.target.value = ''; return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      await fetch(`${API}/profile`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: url }),
      });
      setProfile(prev => ({ ...prev, avatar_url: url }));
    } finally { setUploading(false); }
  }

  async function handleCoverChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setCropImage(reader.result); setCropType('cover'); setCropModal(true); setCrop({x:0,y:0}); setZoom(1); };
    reader.readAsDataURL(file); e.target.value = ''; return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      await fetch(`${API}/profile`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_url: url }),
      });
      setProfile(prev => ({ ...prev, cover_url: url }));
    } finally { setUploading(false); }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '3rem' }}>­ƒÿö Perfil nao encontrado.</div>;

  const initials = (profile.full_name || 'U').slice(0, 2).toUpperCase();
  const totalPosts = posts.length;

  return (
    <div style={{ maxWidth: 935, margin: "0 auto", padding: "0 0 40px", background: "#fafafa" }}>
      <div style={{ position: "relative", height: 220, background: profile.cover_url ? "url("+profile.cover_url+") center/cover" : "linear-gradient(135deg,#1a0a3e,#4a1a8e,#daa520)", overflow: "hidden" }}>
        {isOwn && (<><button onClick={() => coverRef.current?.click()} style={{ position:"absolute", bottom:10, right:10, background:"rgba(0,0,0,0.5)", border:"none", borderRadius:8, padding:"6px 12px", color:"#fff", cursor:"pointer", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}><Camera size={14}/> {t("profile.changeCover")}</button><input ref={coverRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleCoverChange}/></>)}
      </div>
      <div style={{ background:"#fff", borderBottom:"1px solid #dbdbdb", padding:"0 24px 20px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:32, flexWrap:"wrap" }}>
          <div style={{ position:"relative", marginTop:-60, flexShrink:0 }}>
            <div style={{ width:150, height:150, borderRadius:"50%", border:"4px solid #fff", overflow:"hidden", background:"linear-gradient(135deg,#daa520,#f0c040)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, fontWeight:700, color:"#fff", boxShadow:"0 2px 12px rgba(0,0,0,0.15)" }}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" onClick={()=>setShowAvatarBig(true)} style={{width:"100%",height:"100%",objectFit:"cover",cursor:"pointer"}}/> : initials}
            </div>
            {showAvatarBig && (<div onClick={()=>setShowAvatarBig(false)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={profile.avatar_url} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:12}}/></div>)}
            {isOwn && (<><button onClick={()=>avatarRef.current?.click()} style={{position:"absolute",bottom:4,right:4,width:30,height:30,borderRadius:"50%",background:"#daa520",border:"3px solid #fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Camera size={13} color="#fff"/></button><input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarChange}/></>)}
          </div>
          <div style={{ flex:1, paddingTop:16, minWidth:200 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:12 }}>
              <h1 style={{ margin:0, fontSize:20, fontWeight:400, color:"#1a1a2e" }}>{profile.full_name || "Utilizador"}</h1>
              {profile.role==="pastor" && <span style={{background:"#daa520",color:"#fff",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>Pastor</span>}
              {profile.role==="admin" && <span style={{background:"#e74c3c",color:"#fff",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>Admin</span>}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
              {isOwn ? (<><button onClick={()=>setEditMode(true)} style={{padding:"7px 18px",borderRadius:8,border:"1px solid #dbdbdb",background:"#fff",cursor:"pointer",fontWeight:600,fontSize:13}}>{t("profile.editProfile")}</button></>) : (<><button onClick={()=>navigate("/mensagens/" + profileUser?.id)} style={{padding:"7px 18px",borderRadius:8,border:"none",background:"#0095f6",color:"#fff",cursor:"pointer",fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6}}><Send size={14}/> {t("profile.message")}</button><button style={{padding:"7px 18px",borderRadius:8,border:"1px solid #dbdbdb",background:"#fff",cursor:"pointer",fontWeight:600,fontSize:13}}><UserPlus size={14}/> {t("profile.follow")}</button></>)}
            </div>
            <div style={{ display:"flex", gap:32, marginBottom:12 }}>
              <div><span style={{fontWeight:600,fontSize:16,color:"#1a1a2e"}}>{totalPosts}</span> <span style={{fontSize:14,color:"#555"}}>{t("profile.posts")}</span></div>
              <div><span style={{fontWeight:600,fontSize:16,color:"#1a1a2e"}}>{profile.stats?.friends||0}</span> <span style={{fontSize:14,color:"#555"}}>{t("profile.friends")}</span></div>
              <div><span style={{fontWeight:600,fontSize:16,color:"#1a1a2e"}}>{profile.stats?.prayers||0}</span> <span style={{fontSize:14,color:"#555"}}>{t("profile.prayers")}</span></div>
            </div>
            {profile.bio && <p style={{margin:"0 0 4px",fontSize:14,color:"#1a1a2e",lineHeight:1.5}}>{profile.bio}</p>}
            {profile.church_name && <div style={{display:"flex",alignItems:"center",gap:4,fontSize:13,color:"#555",marginBottom:2}}><Church size={13}/> {profile.church_name}</div>}
            {profile.location && <div style={{display:"flex",alignItems:"center",gap:4,fontSize:13,color:"#555"}}><MapPin size={13}/> {profile.location}</div>}
          </div>
        </div>
      </div>
      <div style={{background:"#fff",borderBottom:"1px solid #dbdbdb",display:"flex",justifyContent:"center"}}>
        {[["posts",t("profile.posts")],["prayers",t("profile.prayers")],["friends",t("profile.friends")]].map(([tab,label])=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"14px 28px",border:"none",background:"none",cursor:"pointer",fontWeight:600,fontSize:12,color:activeTab===tab?"#1a1a2e":"#888",borderTop:activeTab===tab?"2px solid #1a1a2e":"2px solid transparent",letterSpacing:"0.08em",textTransform:"uppercase"}}>
            {label}
          </button>
        ))}
        {activeTab==="posts" && <div style={{display:"flex",marginLeft:"auto",borderLeft:"1px solid #dbdbdb"}}>
          <button onClick={()=>setViewMode("grid")} style={{padding:"14px",border:"none",background:"none",cursor:"pointer",color:viewMode==="grid"?"#1a1a2e":"#bbb"}}><Grid size={18}/></button>
          <button onClick={()=>setViewMode("list")} style={{padding:"14px",border:"none",background:"none",cursor:"pointer",color:viewMode==="list"?"#1a1a2e":"#bbb"}}><List size={18}/></button>
        </div>}
      </div>
      {activeTab==="posts" && (viewMode==="grid" ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,marginTop:3}}>
          {posts.map(post=>(
            <div key={post.id} onClick={()=>setSelectedPost(post)} style={{aspectRatio:"1",background:"#f0f0f0",cursor:"pointer",overflow:"hidden",position:"relative"}}>
              {post.media_url&&post.media_url.match(/\.(jpg|jpeg|png|gif|webp)/i)?<img src={post.media_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:post.media_url&&post.media_url.match(/\.(mp4|webm|mov)/i)?<video src={post.media_url} style={{width:"100%",height:"100%",objectFit:"cover"}} muted/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1a0a3e,#4a1a8e)",padding:12}}><p style={{color:"#fff",fontSize:13,textAlign:"center",margin:0}}>{post.content}</p></div>}
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0)",transition:"background 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:20,color:"#fff",fontWeight:700}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.45)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0)"}>
                <span style={{display:"flex",alignItems:"center",gap:4}}><Heart size={18} fill="#fff"/> {post.like_count||0}</span>
                <span style={{display:"flex",alignItems:"center",gap:4}}><MessageCircle size={18} fill="#fff"/> {post.comment_count||0}</span>
              </div>
            </div>
          ))}
          {posts.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",padding:"4rem",color:"#888"}}><p>Sem publicacoes ainda</p></div>}
        </div>
      ):(
        <div style={{maxWidth:614,margin:"0 auto",padding:"16px 0"}}>
          {posts.map(post=>(
            <div key={post.id} style={{background:"#fff",border:"1px solid #dbdbdb",borderRadius:4,marginBottom:24,overflow:"hidden"}}>
              {post.media_url&&<img src={post.media_url} alt="" style={{width:"100%",maxHeight:400,objectFit:"cover"}}/>}
              <div style={{padding:"12px 16px"}}>
                <p style={{margin:"0 0 10px",fontSize:14,lineHeight:1.6}}>{post.content}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
      {activeTab==="prayers" && <div style={{textAlign:"center",padding:"4rem",color:"#888"}}><Heart size={48} style={{marginBottom:16,opacity:0.2}}/><p>{t("profile.prayers")}</p></div>}
      {activeTab==="friends" && <div style={{textAlign:"center",padding:"4rem",color:"#888"}}><UserCheck size={48} style={{marginBottom:16,opacity:0.2}}/><p>{t("profile.friends")}</p></div>}
      {editMode && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:480,padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:700}}>{t("profile.editProfile")}</h2>
              <button onClick={()=>setEditMode(false)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={24}/></button>
            </div>
            {[["Nome","full_name"],[t("profile.bio","Bio"),"bio"],["Localizacao","location"],["Igreja","church_name"]].map(([label,key])=>(
              <div key={key} style={{marginBottom:16}}>
                <label style={{display:"block",fontWeight:600,fontSize:13,marginBottom:6,color:"#555"}}>{label}</label>
                {key==="bio"?<textarea value={editData[key]} onChange={e=>setEditData(prev=>({...prev,[key]:e.target.value}))} rows={3} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #dbdbdb",fontSize:14,resize:"vertical",boxSizing:"border-box"}}/>:<input value={editData[key]} onChange={e=>setEditData(prev=>({...prev,[key]:e.target.value}))} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #dbdbdb",fontSize:14,boxSizing:"border-box"}}/>}
              </div>
            ))}
            <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
              <button onClick={()=>setEditMode(false)} style={{padding:"10px 20px",borderRadius:8,border:"1px solid #dbdbdb",background:"#fff",cursor:"pointer",fontWeight:600}}>{t("profile.cancel","Cancelar")}</button>
              <button onClick={saveProfile} style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#0095f6",color:"#fff",cursor:"pointer",fontWeight:600}}>{t("profile.save")}</button>
            </div>
          </div>
        </div>
      )}
      {selectedPost && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setSelectedPost(null)}>
          <div style={{background:"#fff",borderRadius:4,maxWidth:900,width:"100%",maxHeight:"90vh",overflow:"auto",display:"flex"}} onClick={e=>e.stopPropagation()}>
            {selectedPost.media_url && <div style={{flex:1,background:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}>{selectedPost.media_url.match(/\.(mp4|webm|mov)/i)?<video src={selectedPost.media_url} controls style={{width:"100%",maxHeight:600}}/>:<img src={selectedPost.media_url} alt="" style={{width:"100%",maxHeight:600,objectFit:"contain"}}/>}</div>}
            <div style={{width:340,display:"flex",flexDirection:"column",flexShrink:0}}>
              <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #eee"}}>
                <span style={{fontWeight:600,flex:1}}>{profile.full_name}</span>
                <button onClick={()=>setSelectedPost(null)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={20}/></button>
              </div>
              <div style={{padding:16}}>
                <p style={{fontSize:14,lineHeight:1.6}}>{selectedPost.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {cropModal&&cropImage&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{position:"relative",width:"90vw",height:"55vh",maxWidth:480}}>
            <Cropper image={cropImage} crop={crop} zoom={zoom} aspect={cropType==="avatar"?1:16/5} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}/>
          </div>
          <div style={{marginTop:16,display:"flex",gap:12}}>
            <button onClick={()=>{setCropModal(false);setCropImage(null);}} style={{padding:"10px 24px",borderRadius:20,background:"rgba(255,255,255,0.2)",border:"none",color:"white",cursor:"pointer"}}>{t("profile.cancel","Cancelar")}</button>
            <button onClick={handleCropSave} style={{padding:"10px 24px",borderRadius:20,background:"#0095f6",border:"none",color:"#fff",fontWeight:700,cursor:"pointer"}}>{t("profile.save")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
