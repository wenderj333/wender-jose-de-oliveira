{showInfo && (
  <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
    {(user.city || user.country || user.profession || user.marital_status) && (
      <div style={{ background: "#f9f9fe", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
        <b style={{ color: "#6C3FA0" }}>👤 Info Pessoais</b><br/>
        {user.city && <div style={{ fontSize: 13 }}>Cidade: {user.city}</div>}
        {user.country && <div style={{ fontSize: 13 }}>País: {user.country}</div>}
        {user.profession && <div style={{ fontSize: 13 }}>Profissão: {user.profession}</div>}
        {user.marital_status && <div style={{ fontSize: 13 }}>Estado Civil: {user.marital_status}</div>}
      </div>
    )}
    {(user.church_name || user.church_denomination || user.faith_years || user.church_role) && (
      <div style={{ background: "#f9f9fe", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
        <b style={{ color: "#6C3FA0" }}>✝️ Vida Cristã</b><br/>
        {user.church_name && <div style={{ fontSize: 13 }}>Igreja: {user.church_name}</div>}
        {user.church_denomination && <div style={{ fontSize: 13 }}>Denominação: {user.church_denomination}</div>}
        {user.faith_years && <div style={{ fontSize: 13 }}>Anos de Fé: {user.faith_years}</div>}
        {user.church_role && <div style={{ fontSize: 13 }}>Função: {user.church_role}</div>}
      </div>
    )}
    {user.favorite_verse && (
      <div style={{ background: "#f9f9fe", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
        <b style={{ color: "#6C3FA0" }}>📖 Versículo Favorito</b>
        <p style={{ fontSize: 13, fontStyle: "italic", margin: "4px 0" }}>{user.favorite_verse}</p>
      </div>
    )}
    {user.testimony && (
      <div style={{ background: "#f9f9fe", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
        <b style={{ color: "#6C3FA0" }}>🙏 Testemunho</b>
        <p style={{ fontSize: 13, margin: "4px 0", whiteSpace: "pre-wrap" }}>{user.testimony}</p>
      </div>
    )}
    {user.bio && (
      <div style={{ background: "#f9f9fe", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
        <b style={{ color: "#6C3FA0" }}>📝 Sobre Mim</b>
        <p style={{ fontSize: 13, margin: "4px 0" }}>{user.bio}</p>
      </div>
    )}
  </div>
)}