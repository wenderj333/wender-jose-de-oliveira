import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const API = (import.meta.env.VITE_API_URL || "") + "/api";
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "degxiuf43";
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "sigo_com_fe";

async function uploadPhoto(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", PRESET);
  fd.append("folder", "sigo-com-fe/avatars");
  const r = await fetch("https://api.cloudinary.com/v1_1/"+CLOUD+"/image/upload",{method:"POST",body:fd});
  if (!r.ok) throw new Error("Erro upload");
  return (await r.json()).secure_url;
}

export default function Settings() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [user, setUser2] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch(e) { return null; }
  });

  useEffect(() => {
    if (!token) return;
    fetch(API+"/auth/me", {headers:{Authorization:"Bearer "+token}})
      .then(r=>r.ok?r.json():null)
      .then(d=>{ if(d?.user){ setUser2(d.user); localStorage.setItem("user",JSON.stringify(d.user)); }})
      .catch(()=>{});
  }, [token]);

  const [form, setForm] = useState({
    full_name:"", bio:"", city:"", country:"",
    church_name:"", church_denomination:"", faith_years:"",
    favorite_verse:"", testimony:"", profession:"",
    marital_status:"", spiritual_state:""
  });

  useEffect(() => {
    if (user) setForm({
      full_name: user.full_name||"", bio: user.bio||"",
      city: user.city||"", country: user.country||"",
      church_name: user.church_name||"",
      church_denomination: user.church_denomination||"",
      faith_years: user.faith_years||"",
      favorite_verse: user.favorite_verse||"",
      testimony: user.testimony||"",
      profession: user.profession||"",
      marital_status: user.marital_status||"",
      spiritual_state: user.spiritual_state||""
    });
  }, [user]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPreview(URL.createObjectURL(file)); setUploading(true);
    try {
      const photoURL = await uploadPhoto(file);
      const res = await fetch(API+"/profile/photo",{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({photoURL})});
      if (res.ok) { setMsg("Foto atualizada!"); if(setUser) setUser(p=>({...p,avatar_url:photoURL})); }
      else { setMsg("Erro ao atualizar foto"); }
    } catch(e) { setMsg("Erro: "+e.message); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setMsg("");
    try {
      const res = await fetch(API+"/profile",{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify(form)});
      const data = await res.json();
      if (res.ok) { setMsg("Guardado!"); if(setUser) setUser(p=>({...p,...form})); }
      else { setMsg(data.error||"Erro"); }
    } catch(e) { setMsg("Erro"); }
    finally { setSaving(false); }
  };

  if (!user) return (
    <div style={{padding:40,textAlign:"center"}}>
      <p style={{color:"#666",marginBottom:16}}>Precisas de fazer login.</p>
      <button onClick={()=>navigate("/login")} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer"}}>Login</button>
    </div>
  );

  const inp = {width:"100%",padding:10,borderRadius:8,border:"1px solid #dbdbdb",fontSize:15,marginBottom:12,boxSizing:"border-box"};
  const lbl = {display:"block",fontWeight:600,marginBottom:4,color:"#333",fontSize:14};
  const sec = {background:"#f9f9f9",borderRadius:12,padding:16,marginBottom:16};
  const sech = {fontWeight:700,fontSize:16,color:"#6C3FA0",marginBottom:12};

  return (
    <div style={{maxWidth:600,margin:"0 auto",padding:24,background:"#fff",minHeight:"100vh"}}>
      <button onClick={()=>navigate(-1)} style={{marginBottom:16,background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#6C3FA0"}}>← Voltar</button>
      <h2 style={{marginBottom:24,color:"#1a1a2e"}}>Editar Perfil</h2>
      <div style={{textAlign:"center",marginBottom:24}}>
        <img src={preview||user?.avatar_url||"/pro.jpg"} style={{width:100,height:100,borderRadius:"50%",objectFit:"cover",border:"3px solid #6C3FA0",cursor:"pointer"}} onClick={()=>fileRef.current?.click()} onError={e=>e.target.src="/pro.jpg"} />
        <input type="file" accept="image/*" ref={fileRef} onChange={handlePhoto} style={{display:"none"}} />
        <p style={{fontSize:13,color:"#6C3FA0",cursor:"pointer",marginTop:8}} onClick={()=>fileRef.current?.click()}>{uploading?"A carregar...":"Mudar foto"}</p>
      </div>
      <div style={sec}>
        <div style={sech}>👤 Sobre mim</div>
        <label style={lbl}>Nome completo</label>
        <input style={inp} value={form.full_name} onChange={e=>set("full_name",e.target.value)} />
        <label style={lbl}>Bio</label>
        <textarea style={{...inp,minHeight:80}} value={form.bio} onChange={e=>set("bio",e.target.value)} />
        <label style={lbl}>Cidade</label>
        <input style={inp} value={form.city} onChange={e=>set("city",e.target.value)} />
        <label style={lbl}>Pais</label>
        <input style={inp} value={form.country} onChange={e=>set("country",e.target.value)} />
        <label style={lbl}>Profissao</label>
        <input style={inp} value={form.profession} onChange={e=>set("profession",e.target.value)} />
        <label style={lbl}>Estado civil</label>
        <select style={inp} value={form.marital_status} onChange={e=>set("marital_status",e.target.value)}>
          <option value="">-</option>
          <option value="single">Solteiro</option>
          <option value="married">Casado</option>
          <option value="divorced">Divorciado</option>
          <option value="widowed">Viuvo</option>
        </select>
      </div>
      <div style={sec}>
        <div style={sech}>✝️ Vida Crista</div>
        <label style={lbl}>Igreja</label>
        <input style={inp} value={form.church_name} onChange={e=>set("church_name",e.target.value)} />
        <label style={lbl}>Denominacao</label>
        <input style={inp} value={form.church_denomination} onChange={e=>set("church_denomination",e.target.value)} />
        <label style={lbl}>Anos de fe</label>
        <input style={inp} type="number" value={form.faith_years} onChange={e=>set("faith_years",e.target.value)} />
        <label style={lbl}>Versiculo favorito</label>
        <input style={inp} value={form.favorite_verse} onChange={e=>set("favorite_verse",e.target.value)} />
        <label style={lbl}>Testemunho</label>
        <textarea style={{...inp,minHeight:100}} value={form.testimony} onChange={e=>set("testimony",e.target.value)} />
        <label style={lbl}>Estado espiritual</label>
        <input style={inp} value={form.spiritual_state} onChange={e=>set("spiritual_state",e.target.value)} />
      </div>
      {msg && <p style={{color:msg.includes("Erro")?"red":"green",marginBottom:16,fontWeight:600}}>{msg}</p>}
      <button onClick={handleSave} disabled={saving} style={{width:"100%",background:"#6C3FA0",color:"white",border:"none",borderRadius:10,padding:14,fontSize:16,fontWeight:700,cursor:"pointer",marginBottom:40}}>
        {saving?"A guardar...":"Guardar"}
      </button>
    </div>
  );
}


