import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    full_name: "", username: "", birth_date: "", gender: "", city: "", state: "", country: "", profession: "", marital_status: "",
    christian_years: "", church_name: "", denomination: "", pastor_name: "",
    church_role: "", church_role_other: "", role_years: "",
    ministry: "", ministry_other: "",
    favorite_verse: "", favorite_worship: "", favorite_book: "", testimony: "", bio: "",
    interests: [], interests_other: "",
    objectives: [],
    prayer_request: "", final_message: ""
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("https://sigo-com-fe-api.onrender.com/api/auth/me", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(r => r.json())
    .then(d => {
      if (d?.user) {
        setForm(prev => ({
          ...prev,
          ...d.user,
          interests: d.user.interests || [],
          objectives: d.user.objectives || []
        }));
      }
    }).catch(() => {});
  }, []);

  const handleCheckbox = (field, value) => {
    const currentList = [...form[field]];
    if (currentList.includes(value)) {
      setForm({ ...form, [field]: currentList.filter(item => item !== value) });
    } else {
      setForm({ ...form, [field]: [...currentList, value] });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://sigo-com-fe-api.onrender.com/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMsg("✅ Perfil atualizado e salvo com sucesso!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMsg("❌ Erro ao salvar dados no servidor.");
      }
    } catch {
      setMsg("❌ Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const sectionStyle = { marginBottom: "25px", padding: "15px", border: "1px solid #eee", borderRadius: "10px", background: "#fbfbfe" };
  const labelStyle = { display: "block", fontWeight: "bold", marginBottom: "5px", color: "#333", fontSize: "14px" };
  const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box", marginBottom: "12px" };
  const radioGroupStyle = { display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "12px" };

  return (
    <div style={{ padding: "25px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e0e0e0", margin: "20px auto", maxWidth: "700px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#6C3FA0", marginBottom: "20px", borderBottom: "2px solid #f0c040", paddingBottom: "10px", textAlign: "center" }}>{t('profile.title','SOBRE MIM / MEU PERFIL')}</h2>
      
      {msg && <p style={{ color: msg.includes("❌") ? "#e11d48" : "#16a34a", fontWeight: "bold", marginBottom: "15px", textAlign: "center", fontSize: "16px" }}>{msg}</p>}

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionPersonal','INFORMACOES PESSOAIS')}</h3>
        
        <label style={labelStyle}>{t("profile.full_name","Nome Completo")}:</label>
        <input style={inputStyle} value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />

        <label style={labelStyle}>{t("profile.username","Nome de Usuario")}:</label>
        <input style={inputStyle} value={form.username} onChange={e => setForm({...form, username: e.target.value})} />

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

        <label style={labelStyle}>{t("profile.state","Estado")}:</label>
        <input style={inputStyle} value={form.state} onChange={e => setForm({...form, state: e.target.value})} />

        <label style={labelStyle}>{t("profile.country","País")}:</label>
        <input style={inputStyle} value={form.country} onChange={e => setForm({...form, country: e.target.value})} />

        <label style={labelStyle}>{t("profile.profession","Profissão")}:</label>
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
        
        <label style={labelStyle}>{t("profile.faithYears","Anos de fe")}</label>
        <input type="number" style={inputStyle} value={form.christian_years} onChange={e => setForm({...form, christian_years: e.target.value})} />

        <label style={labelStyle}>{t("profile.church","Igreja")}:</label>
        <input style={inputStyle} value={form.church_name} onChange={e => setForm({...form, church_name: e.target.value})} />

        <label style={labelStyle}>{t("profile.denomination","Denominação")}:</label>
        <input style={inputStyle} value={form.denomination} onChange={e => setForm({...form, denomination: e.target.value})} />

        <label style={labelStyle}>{t("profile.pastor","Pastor")}:</label>
        <input style={inputStyle} value={form.pastor_name} onChange={e => setForm({...form, pastor_name: e.target.value})} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionRole','FUNCAO NA IGREJA')}</h3>
        <label style={labelStyle}>{t("profile.churchRole","Funcao na igreja")}</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {[t("role.member","Membro"), t("role.newConvert","Novo Convertido"), t("role.worker","Obreiro"), t("role.deacon","Diacono"), t("role.elder","Presbitero"), t("role.evangelist","Evangelista"), t("role.missionary","Missionario"), t("role.pastor","Pastor"), t("role.bishop","Bispo"), t("role.youthLeader","Lider Jovens"), t("role.worshipLeader","Lider Louvor"), t("role.teacher","Professor"), t("role.other","Outro")].map(f => (
            <label key={f} style={{ cursor: "pointer" }}><input type="radio" name="church_role" checked={form.church_role === f} onChange={() => setForm({...form, church_role: f})} /> {f}</label>
          ))}
        </div>
        {form.church_role === "Outro" && (
          <>
            <label style={labelStyle}>Especifique a função:</label>
            <input style={inputStyle} value={form.church_role_other} onChange={e => setForm({...form, church_role_other: e.target.value})} />
          </>
        )}
        <label style={labelStyle}>{t("profile.roleYears","Anos nessa funcao")}</label>
        <input type="number" style={inputStyle} value={form.role_years} onChange={e => setForm({...form, role_years: e.target.value})} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionMinistry','MINISTERIO')}</h3>
        <label style={labelStyle}>{t("profile.ministry","Ministerio")}</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {[t("ministry.evangelism","Evangelismo"), t("ministry.worship","Louvor"), t("ministry.prayer","Intercessao"), t("ministry.teaching","Ensino"), t("ministry.missions","Missoes"), t("ministry.children","Criancas"), t("ministry.youth","Jovens"), t("ministry.couples","Casais"), t("ministry.social","Acao Social"), t("ministry.other","Outro")].map(m => (
            <label key={m} style={{ cursor: "pointer" }}><input type="radio" name="ministry" checked={form.ministry === m} onChange={() => setForm({...form, ministry: m})} /> {m}</label>
          ))}
        </div>
        {form.ministry === "Outro" && (
          <>
            <label style={labelStyle}>Qual ministério?</label>
            <input style={inputStyle} value={form.ministry_other} onChange={e => setForm({...form, ministry_other: e.target.value})} />
          </>
        )}
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>{t('profile.sectionPrefs','PREFERENCIAS E TESTEMUNHO')}</h3>
        
        <label style={labelStyle}>{t("profile.favoriteVerse","Versículo Favorito")}:</label>
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
        {form.interests.includes("Outro") && (
          <>
            <label style={labelStyle}>Qual interesse?</label>
            <input style={inputStyle} value={form.interests_other} onChange={e => setForm({...form, interests_other: e.target.value})} />
          </>
        )}
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
        
        <label style={labelStyle}>{t("profile.prayerRequest","Pedido de oracao")}</label>
        <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.prayer_request} onChange={e => setForm({...form, prayer_request: e.target.value})} />

        <label style={labelStyle}>{t("profile.finalMessage","Mensagem final")}</label>
        <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.final_message} onChange={e => setForm({...form, final_message: e.target.value})} />
      </div>

      {msg && <p style={{ color: msg.includes("❌") ? "#e11d48" : "#16a34a", fontWeight: "bold", marginBottom: "15px", textAlign: "center" }}>{msg}</p>}

      <button onClick={handleSave} disabled={loading} style={{ background: "linear-gradient(135deg, #6C3FA0, #4A2270)", color: "#fff", border: "none", padding: "14px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", width: "100%", fontSize: "16px" }}>
        {loading ? "Salvando Alterações..." : t("profile.saveProfile","SALVAR PERFIL")}
      </button>
    </div>
  );
}
