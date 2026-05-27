import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
const API = (import.meta.env.VITE_API_URL || "") + "/api";
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "degxiuf43";
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "sigo_com_fe";

async function uploadPhoto(file) {
  const fd = new FormData();
  fd.append("file", file); fd.append("upload_preset", PRESET); fd.append("folder", "sigo-com-fe/avatars");
  const r = await fetch("https://api.cloudinary.com/v1_1/"+CLOUD+"/image/upload", {method:"POST",body:fd});
  if (!r.ok) throw new Error("Erro upload");
  return (await r.json()).secure_url;
}
export default function Settings() {
  const { user, token, setUser } = useAuth();
  if (!user) return <div style={{padding:40,textAlign:'center',color:'#6C3FA0',fontSize:18}}>A carregar perfil...</div>;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    bio: user?.bio || "",
    city: user?.city || "",
    country: user?.country || "",
    church_name: user?.church_name || "",
    church_denomination: user?.church_denomination || "",
    faith_years: user?.faith_years || "",
    favorite_verse: user?.favorite_verse || "",
    testimony: user?.testimony || "",
    profession: user?.profession || "",
    marital_status: user?.marital_status || "",
    spiritual_state: user?.spiritual_state || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState(user?.avatar_url || null);
  const fileRef = useRef(null);
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPreview(URL.createObjectURL(file)); setUploading(true);
    try {
      const photoURL = await uploadPhoto(file);
      const res = await fetch(API+"/profile/photo", {method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({photoURL})});
      const data = await res.json();
      if (res.ok) { setMsg(t("settings.saved","Guardado!")); setUser(prev=>({...prev,avatar_url:photoURL,photoURL})); }
      else { setMsg(data.error||"Erro"); }
    } catch(e) { setMsg("Erro: "+e.message); }
    finally { setUploading(false); }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(API+"/profile", {method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify(form)});
      const data = await res.json();
      if (res.ok) { setMsg(t("settings.saved","Guardado!")); if (data.user) setUser(prev=>({...prev,...data.user,...form})); }
      else { setMsg(data.error||"Erro"); }
    } catch(e) { setMsg("Erro"); }
    finally { setSaving(false); }
  };
  const inp = {width:"100%",padding:"10px",borderRadius:8,border:"1px solid #dbdbdb",fontSize:15,marginBottom:12,boxSizing:"border-box"};
  const lbl = {display:"block",fontWeight:600,marginBottom:4,color:"#333",fontSize:14};
  const sec = {background:"#f9f9f9",borderRadius:12,padding:16,marginBottom:16};
  const sech = {fontWeight:700,fontSize:16,color:"#6C3FA0",marginBottom:12};

  return (
    <div style={{maxWidth:600,margin:"0 auto",padding:24,background:"#fff",minHeight:"100vh"}}>
      <button onClick={()=>navigate(-1)} style={{marginBottom:16,background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#6C3FA0"}}>← {t("common.back","Voltar")}</button>
      <h2 style={{marginBottom:24,color:"#1a1a2e"}}>{t("settings.title","Editar Perfil")}</h2>
      <div style={{textAlign:"center",marginBottom:24}}>
        <img src={preview||"/pro.jpg"} style={{width:100,height:100,borderRadius:"50%",objectFit:"cover",border:"3px solid #6C3FA0",cursor:"pointer"}} onClick={()=>fileRef.current?.click()} />
        <input type="file" accept="image/*" ref={fileRef} onChange={handlePhoto} style={{display:"none"}} />
        <p style={{fontSize:13,color:"#6C3FA0",cursor:"pointer",marginTop:8}} onClick={()=>fileRef.current?.click()}>{uploading?"A carregar...":t("settings.photo","Mudar foto")}</p>
      </div>
      <div style={sec}>
        <div style={sech}>👤 {t("profile.about","Sobre mim")}</div>
        <label style={lbl}>{t("settings.name","Nome completo")}</label>
        <input style={inp} value={form.full_name} onChange={e=>set("full_name",e.target.value)} />
        <label style={lbl}>{t("settings.bio","Bio")}</label>
        <textarea style={{...inp,minHeight:80}} value={form.bio} onChange={e=>set("bio",e.target.value)} />
        <label style={lbl}>{t("settings.city","Cidade")}</label>
        <input style={inp} value={form.city} onChange={e=>set("city",e.target.value)} />
        <label style={lbl}>{t("settings.country","Pais")}</label>
        <input style={inp} value={form.country} onChange={e=>set("country",e.target.value)} />
        <label style={lbl}>{t("settings.profession","Profissao")}</label>
        <input style={inp} value={form.profession} onChange={e=>set("profession",e.target.value)} />
        <label style={lbl}>{t("settings.marital","Estado civil")}</label>
        <select style={inp} value={form.marital_status} onChange={e=>set("marital_status",e.target.value)}>
          <option value="">-</option>
          <option value="single">{t("settings.maritalOptions.single","Solteiro")}</option>
          <option value="married">{t("settings.maritalOptions.married","Casado")}</option>
          <option value="divorced">{t("settings.maritalOptions.divorced","Divorciado")}</option>
          <option value="widowed">{t("settings.maritalOptions.widowed","Viuvo")}</option>
        </select>
      </div>
      <div style={sec}>
        <div style={sech}>✝️ {t("profile.christianLife","Vida Crista")}</div>
        <label style={lbl}>{t("settings.church","Igreja")}</label>
        <input style={inp} value={form.church_name} onChange={e=>set("church_name",e.target.value)} />
        <label style={lbl}>{t("settings.denomination","Denominacao")}</label>
        <input style={inp} value={form.church_denomination} onChange={e=>set("church_denomination",e.target.value)} />
        <label style={lbl}>{t("settings.faithYears","Anos de fe")}</label>
        <input style={inp} type="number" value={form.faith_years} onChange={e=>set("faith_years",e.target.value)} />
        <label style={lbl}>{t("settings.verse","Versiculo favorito")}</label>
        <input style={inp} value={form.favorite_verse} onChange={e=>set("favorite_verse",e.target.value)} />
        <label style={lbl}>{t("settings.testimony","Testemunho")}</label>
        <textarea style={{...inp,minHeight:100}} value={form.testimony} onChange={e=>set("testimony",e.target.value)} />
        <label style={lbl}>{t("settings.spiritual","Estado espiritual")}</label>
        <input style={inp} value={form.spiritual_state} onChange={e=>set("spiritual_state",e.target.value)} />
      </div>
      {msg && <p style={{color:msg.includes("Erro")?"red":"green",marginBottom:16,fontWeight:600}}>{msg}</p>}
      <button onClick={handleSave} disabled={saving} style={{width:"100%",background:"#6C3FA0",color:"white",border:"none",borderRadius:10,padding:"14px",fontSize:16,fontWeight:700,cursor:"pointer",marginBottom:40}}>
        {saving?t("settings.saving","A guardar..."):t("settings.save","Guardar")}
      </button>
    </div>
  );
}