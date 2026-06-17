import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const API = "https://sigo-com-fe-api.onrender.com/api";

export default function Settings() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    full_name: "", birth_date: "", gender: "", city: "", country: "", profession: "", marital_status: "",
    christian_years: "", church_name: "", denomination: "", pastor_name: "",
    church_role: "", role_years: "",
    ministry: "",
    favorite_verse: "", favorite_worship: "", favorite_book: "", testimony: "", bio: "",
    interests: [], objectives: [],
    prayer_request: "", final_message: "",
    avatar_url: "", cover_url: ""
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = React.useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(API + "/auth/me", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(d => {
        const u = d?.user || d;
        if (u?.id) {
          setForm(prev => ({
            ...prev,
            full_name: u.full_name || "",
            city: u.city || "",
            country: u.country || "",
            profession: u.profession || "",
            marital_status: u.marital_status || "",
            church_name: u.church_name || "",
            denomination: u.church_denomination || "",
            christian_years: u.faith_years || "",
            favorite_verse: u.favorite_verse || "",
            testimony: u.testimony || "",
            bio: u.bio || "",
            avatar_url: u.avatar_url || "",
            cover_url: u.cover_url || "",
            interests: u.interests || [],
            objectives: u.objectives || []
          }));
        }
      }).catch(() => {});
  }, []);

  const uploadAvatar = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "sigo_com_fe");
      const res = await fetch("https://api.cloudinary.com/v1_1/degxiuf43/image/upload", { method: "POST", body: fd });
      const data = await res.json();
      const url = data.secure_url;
      const token = localStorage.getItem("token");
      await fetch(API + "/profile/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ photoURL: url })
      });
      setForm(prev => ({ ...prev, avatar_url: url }));
      setMsg("Foto atualizada com sucesso!");
    } catch(e) { setMsg("Erro ao atualizar foto"); }
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API + "/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          full_name: form.full_name,
          bio: form.bio,
          city: form.city,
          country: form.country,
          profession: form.profession,
          marital_status: form.marital_status,
          church_name: form.church_name,
          denomination: form.denomination,
          christian_years: form.christian_years,
          favorite_verse: form.favorite_verse,
          testimony: form.testimony,
          avatar_url: form.avatar_url,
          cover_url: form.cover_url
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Perfil atualizado com sucesso!");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setMsg("Erro: " + (data.error || "servidor"));
      }
    } catch {
      setMsg("Erro de conexao com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckbox = (field, value) => {
    const list = [...form[field]];
    setForm({ ...form, [field]: list.includes(value) ? list.filter(i => i !== value) : [...list, value] });
  };

  const sectionStyle = { marginBottom: "25px", padding: "15px", border: "1px solid #eee", borderRadius: "10px", background: "#fbfbfe" };
  const labelStyle = { display: "block", fontWeight: "bold", marginBottom: "5px", color: "#333", fontSize: "14px" };
  const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box", marginBottom: "12px" };
  const radioGroupStyle = { display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "12px" };

  return (
    <div style={{ padding: "25px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e0e0e0", margin: "20px auto", maxWidth: "700px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#6C3FA0", marginBottom: "20px", borderBottom: "2px solid #f0c040", paddingBottom: "10px", textAlign: "center" }}>{t('profile.title','SOBRE MIM / MEU PERFIL')}</h2>

      {msg && <p style={{ color: msg.includes("Erro") ? "#e11d48" : "#16a34a", fontWeight: "bold", marginBottom: "15px", textAlign: "center", fontSize: "16px" }}>{msg}</p>}

      <div style={{...sectionStyle, textAlign:"center"}}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>📸 {t('profile.photoTitle','Foto de Perfil')}</h3>
        <img src={form.avatar_url || "/pro.jpg"} onError={e=>e.target.src="/pro.jpg"} style={{width:100,height:100,borderRadius:"50%",objectFit:"cover",border:"3px solid #6C3FA0",marginBottom:12}} />
        <br/>
        <input ref={avatarInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadAvatar(e.target.files[0])} />
        <button onClick={()=>avatarInputRef.current?.click()} disabled={uploadingAvatar} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>
          {uploadingAvatar ? t('profile.uploading','A fazer upload...') : t('profile.changePhoto','Mudar Foto')}
        </button>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionPersonal','INFORMACOES PESSOAIS')}</h3>
        <label style={labelStyle}>{t("profile.full_name","Nome Completo")}:</label>
        <input style={inputStyle} value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
        <label style={labelStyle}>{t("profile.birthdate","Data de Nascimento")}:</label>
        <input type="date" style={inputStyle} value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} />
        <label style={labelStyle}>{t("profile.gender","Sexo")}:</label>
        <div style={radioGroupStyle}>
          {[t("profile.male","Masculino"), t("profile.female","Feminino")].map(s => (
            <label key={s} style={{ cursor: "pointer", marginRight: "10px" }}><input type="radio" name="gender" checked={form.gender === s} onChange={() => setForm({...form, gender: s})} /> {s}</label>
          ))}
        </div>
        <label style={labelStyle}>{t("profile.city","Cidade")}:</label>
        <input style={inputStyle} value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
        <label style={labelStyle}>{t("profile.country","Pais")}:</label>
        <input style={inputStyle} value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
        <label style={labelStyle}>{t("profile.profession","Profissao")}:</label>
        <input style={inputStyle} value={form.profession} onChange={e => setForm({...form, profession: e.target.value})} />
        <label style={labelStyle}>{t("profile.maritalStatus","Estado Civil")}:</label>
        <div style={radioGroupStyle}>
          {[t("profile.single","Solteiro(a)"), t("profile.dating","Namorando"), t("profile.engaged","Noivo(a)"), t("profile.married","Casado(a)"), t("profile.divorced","Divorciado(a)"), t("profile.widowed","Viuvo(a)")].map(ec => (
            <label key={ec} style={{ cursor: "pointer", marginRight: "10px" }}><input type="radio" name="marital_status" checked={form.marital_status === ec} onChange={() => setForm({...form, marital_status: ec})} /> {ec}</label>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionChurch','VIDA CRISTA')}</h3>
        <label style={labelStyle}>{t("profile.faithYears","Anos de fe")}:</label>
        <input type="number" style={inputStyle} value={form.christian_years} onChange={e => setForm({...form, christian_years: e.target.value})} />
        <label style={labelStyle}>{t("profile.church","Igreja")}:</label>
        <input style={inputStyle} value={form.church_name} onChange={e => setForm({...form, church_name: e.target.value})} />
        <label style={labelStyle}>{t("profile.denomination","Denominacao")}:</label>
        <input style={inputStyle} value={form.denomination} onChange={e => setForm({...form, denomination: e.target.value})} />
        <label style={labelStyle}>{t("profile.pastor","Pastor")}:</label>
        <input style={inputStyle} value={form.pastor_name} onChange={e => setForm({...form, pastor_name: e.target.value})} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionRole','FUNCAO NA IGREJA')}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {[t("role.member","Membro"), t("role.newConvert","Novo Convertido"), t("role.worker","Obreiro"), t("role.deacon","Diacono"), t("role.elder","Presbitero"), t("role.evangelist","Evangelista"), t("role.missionary","Missionario"), t("role.pastor","Pastor"), t("role.bishop","Bispo"), t("role.youthLeader","Lider Jovens"), t("role.worshipLeader","Lider Louvor"), t("role.teacher","Professor"), t("role.other","Outro")].map(f => (
            <label key={f} style={{ cursor: "pointer" }}><input type="radio" name="church_role" checked={form.church_role === f} onChange={() => setForm({...form, church_role: f})} /> {f}</label>
          ))}
        </div>
        <label style={labelStyle}>{t("profile.roleYears","Anos nessa funcao")}:</label>
        <input type="number" style={inputStyle} value={form.role_years} onChange={e => setForm({...form, role_years: e.target.value})} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionMinistry','MINISTERIO')}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {[t("ministry.evangelism","Evangelismo"), t("ministry.worship","Louvor"), t("ministry.prayer","Intercessao"), t("ministry.teaching","Ensino"), t("ministry.missions","Missoes"), t("ministry.children","Criancas"), t("ministry.youth","Jovens"), t("ministry.couples","Casais"), t("ministry.social","Acao Social"), t("ministry.other","Outro")].map(m => (
            <label key={m} style={{ cursor: "pointer" }}><input type="radio" name="ministry" checked={form.ministry === m} onChange={() => setForm({...form, ministry: m})} /> {m}</label>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionPrefs','PREFERENCIAS E TESTEMUNHO')}</h3>
        <label style={labelStyle}>{t("profile.favoriteVerse","Versiculo Favorito")}:</label>
        <input style={inputStyle} value={form.favorite_verse} onChange={e => setForm({...form, favorite_verse: e.target.value})} />
        <label style={labelStyle}>{t("profile.favoriteWorship","Louvor Favorito")}:</label>
        <input style={inputStyle} value={form.favorite_worship} onChange={e => setForm({...form, favorite_worship: e.target.value})} />
        <label style={labelStyle}>{t("profile.favoriteBook","Livro Favorito")}:</label>
        <input style={inputStyle} value={form.favorite_book} onChange={e => setForm({...form, favorite_book: e.target.value})} />
        <label style={labelStyle}>{t("profile.testimony","Testemunho")}:</label>
        <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.testimony} onChange={e => setForm({...form, testimony: e.target.value})} />
        <label style={labelStyle}>{t("profile.aboutMe","Sobre Mim")}:</label>
        <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionInterests','INTERESSES')}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {[t("interests.biblicalStudies","Estudos Biblicos"), t("interests.prayer","Oracao"), t("interests.evangelism","Evangelismo"), t("interests.missions","Missoes"), t("interests.gospelMusic","Musica Gospel"), t("interests.reading","Leitura"), t("interests.family","Familia"), t("interests.christianFriends","Amizades Cristas"), t("interests.christianEvents","Eventos Cristaos"), t("interests.other","Outro")].map(i => (
            <label key={i} style={{ cursor: "pointer" }}><input type="checkbox" checked={form.interests.includes(i)} onChange={() => handleCheckbox("interests", i)} /> {i}</label>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionObjectives','OBJETIVOS')}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[t("interests.makeFriends","Fazer amizades cristas"), t("interests.shareWord","Compartilhar a Palavra"), t("interests.prayerGroup","Grupo de oracao"), t("interests.biblicalStudiesGoal","Estudos biblicos"), t("interests.meetBrothers","Conhecer irmaos em Cristo"), t("interests.christianNetworking","Networking cristao"), t("interests.seriousRelationship","Relacionamento serio"), t("interests.spiritualSupport","Apoio espiritual")].map(o => (
            <label key={o} style={{ cursor: "pointer" }}><input type="checkbox" checked={form.objectives.includes(o)} onChange={() => handleCheckbox("objectives", o)} /> {o}</label>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionFinish','FINALIZANDO PERFIL')}</h3>
        <label style={labelStyle}>{t("profile.prayerRequest","Pedido de oracao")}:</label>
        <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.prayer_request} onChange={e => setForm({...form, prayer_request: e.target.value})} />
        <label style={labelStyle}>{t("profile.finalMessage","Mensagem final")}:</label>
        <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.final_message} onChange={e => setForm({...form, final_message: e.target.value})} />
      </div>

      {msg && <p style={{ color: msg.includes("Erro") ? "#e11d48" : "#16a34a", fontWeight: "bold", marginBottom: "15px", textAlign: "center" }}>{msg}</p>}

      <button onClick={handleSave} disabled={loading} style={{ background: "linear-gradient(135deg, #6C3FA0, #4A2270)", color: "#fff", border: "none", padding: "14px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", width: "100%", fontSize: "16px" }}>
        {loading ? t('profile.saving','Salvando...') : t("profile.saveProfile","SALVAR PERFIL")}
      </button>
    </div>
  );
}

