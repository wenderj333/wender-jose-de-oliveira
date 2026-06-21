import React, { useState, useEffect } from "react";

export default function Settings() {
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
      <h2 style={{ color: "#6C3FA0", marginBottom: "20px", borderBottom: "2px solid #f0c040", paddingBottom: "10px", textAlign: "center" }}>SOBRE MIM / MEU PERFIL</h2>
      
      {msg && <p style={{ color: msg.includes("❌") ? "#e11d48" : "#16a34a", fontWeight: "bold", marginBottom: "15px", textAlign: "center", fontSize: "16px" }}>{msg}</p>}

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>INFORMAÇÕES PESSOAIS</h3>
        
        <label style={labelStyle}>Nome Completo:</label>
        <input style={inputStyle} value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />

        <label style={labelStyle}>Nome de Usuário:</label>
        <input style={inputStyle} value={form.username} onChange={e => setForm({...form, username: e.target.value})} />

        <label style={labelStyle}>Data de Nascimento:</label>
        <input type="date" style={inputStyle} value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} />

        <label style={labelStyle}>Sexo:</label>
        <div style={radioGroupStyle}>
          {["Masculino", "Feminino"].map(s => (
            <label key={s} style={{ cursor: "pointer", marginRight: "10px" }}><input type="radio" name="gender" checked={form.gender === s} onChange={() => setForm({...form, gender: s})} /> {s}</label>
          ))}
        </div>

        <label style={labelStyle}>Cidade:</label>
        <input style={inputStyle} value={form.city} onChange={e => setForm({...form, city: e.target.value})} />

        <label style={labelStyle}>Estado:</label>
        <input style={inputStyle} value={form.state} onChange={e => setForm({...form, state: e.target.value})} />

        <label style={labelStyle}>País:</label>
        <input style={inputStyle} value={form.country} onChange={e => setForm({...form, country: e.target.value})} />

        <label style={labelStyle}>Profissão:</label>
        <input style={inputStyle} value={form.profession} onChange={e => setForm({...form, profession: e.target.value})} />

        <label style={labelStyle}>Estado Civil:</label>
        <div style={radioGroupStyle}>
          {["Solteiro(a)", "Namorando", "Noivo(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"].map(ec => (
            <label key={ec} style={{ cursor: "pointer", marginRight: "10px" }}><input type="radio" name="marital_status" checked={form.marital_status === ec} onChange={() => setForm({...form, marital_status: ec})} /> {ec}</label>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>VIDA CRISTÃ</h3>
        
        <label style={labelStyle}>Você é cristão há quantos anos?</label>
        <input type="number" style={inputStyle} value={form.christian_years} onChange={e => setForm({...form, christian_years: e.target.value})} />

        <label style={labelStyle}>Nome da Igreja:</label>
        <input style={inputStyle} value={form.church_name} onChange={e => setForm({...form, church_name: e.target.value})} />

        <label style={labelStyle}>Denominação:</label>
        <input style={inputStyle} value={form.denomination} onChange={e => setForm({...form, denomination: e.target.value})} />

        <label style={labelStyle}>Pastor da Igreja:</label>
        <input style={inputStyle} value={form.pastor_name} onChange={e => setForm({...form, pastor_name: e.target.value})} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>FUNÇÃO NA IGREJA</h3>
        <label style={labelStyle}>Qual é sua função na igreja?</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {["Membro", "Novo Convertido", "Obreiro", "Diácono", "Presbítero", "Evangelista", "Missionário", "Pastor", "Bispo", "Líder de Jovens", "Líder de Louvor", "Professor da Escola Bíblica", "Outro"].map(f => (
            <label key={f} style={{ cursor: "pointer" }}><input type="radio" name="church_role" checked={form.church_role === f} onChange={() => setForm({...form, church_role: f})} /> {f}</label>
          ))}
        </div>
        {form.church_role === "Outro" && (
          <>
            <label style={labelStyle}>Especifique a função:</label>
            <input style={inputStyle} value={form.church_role_other} onChange={e => setForm({...form, church_role_other: e.target.value})} />
          </>
        )}
        <label style={labelStyle}>Há quantos anos exerce essa função?</label>
        <input type="number" style={inputStyle} value={form.role_years} onChange={e => setForm({...form, role_years: e.target.value})} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>MINISTÉRIO</h3>
        <label style={labelStyle}>Você participa de algum ministério?</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {["Evangelismo", "Louvor", "Intercessão", "Ensino", "Missões", "Crianças", "Jovens", "Casais", "Ação Social", "Outro"].map(m => (
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
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>PREFERÊNCIAS E TESTEMUNHO</h3>
        
        <label style={labelStyle}>Versículo Favorito:</label>
        <input style={inputStyle} value={form.favorite_verse} onChange={e => setForm({...form, favorite_verse: e.target.value})} />

        <label style={labelStyle}>Louvor Favorito:</label>
        <input style={inputStyle} value={form.favorite_worship} onChange={e => setForm({...form, favorite_worship: e.target.value})} />

        <label style={labelStyle}>Livro Cristão Favorito:</label>
        <input style={inputStyle} value={form.favorite_book} onChange={e => setForm({...form, favorite_book: e.target.value})} />

        <label style={labelStyle}>Conte um pouco do seu testemunho:</label>
        <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.testimony} onChange={e => setForm({...form, testimony: e.target.value})} />

        <label style={labelStyle}>Fale um pouco sobre você (Sobre Mim):</label>
        <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>INTERESSES (Gosto de)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {["Estudos Bíblicos", "Oração", "Evangelismo", "Missões", "Música Gospel", "Leitura", "Família", "Amizades Cristãs", "Eventos Cristãos", "Outro"].map(i => (
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
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>OBJETIVOS NA PLATAFORMA</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {["Fazer amizades cristãs", "Compartilhar a Palavra", "Grupo de oração", "Estudos bíblicos", "Conhecer irmãos em Cristo", "Networking cristão", "Relacionamento sério", "Apoio espiritual"].map(o => (
            <label key={o} style={{ cursor: "pointer" }}><input type="checkbox" checked={form.objectives.includes(o)} onChange={() => handleCheckbox("objectives", o)} /> {o}</label>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>FINALIZANDO PERFIL</h3>
        
        <label style={labelStyle}>Deseja compartilhar algum pedido de oração?</label>
        <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.prayer_request} onChange={e => setForm({...form, prayer_request: e.target.value})} />

        <label style={labelStyle}>Deixe uma mensagem para quem visitar seu perfil:</label>
        <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.final_message} onChange={e => setForm({...form, final_message: e.target.value})} />
      </div>

      {msg && <p style={{ color: msg.includes("❌") ? "#e11d48" : "#16a34a", fontWeight: "bold", marginBottom: "15px", textAlign: "center" }}>{msg}</p>}

      <button onClick={handleSave} disabled={loading} style={{ background: "linear-gradient(135deg, #6C3FA0, #4A2270)", color: "#fff", border: "none", padding: "14px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", width: "100%", fontSize: "16px" }}>
        {loading ? "Salvando Alterações..." : "SALVAR PERFIL"}
      </button>
    </div>
  );
}
