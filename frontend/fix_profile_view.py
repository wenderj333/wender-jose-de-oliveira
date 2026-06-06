with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = '      <hr style={{ border: "0", borderTop: "1px solid #dbdbdb", marginBottom: "0" }} />'
new = '''      <hr style={{ border: "0", borderTop: "1px solid #dbdbdb", marginBottom: "0" }} />
      {(user.city || user.country || user.church_name || user.testimony || user.favorite_verse) && (
        <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:12}}>
          {(user.city || user.country || user.profession) && (
            <div style={{background:"#f9f9fe",borderRadius:12,padding:16,border:"1px solid #eee"}}>
              <div style={{fontWeight:700,color:"#6C3FA0",marginBottom:10,fontSize:15}}>👤 {t("profile.sectionPersonal","Informacoes Pessoais")}</div>
              {user.city && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.city","Cidade")}:</b> {user.city}</div>}
              {user.state && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.state","Estado")}:</b> {user.state}</div>}
              {user.country && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.country","Pais")}:</b> {user.country}</div>}
              {user.profession && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.profession","Profissao")}:</b> {user.profession}</div>}
            </div>
          )}
          {(user.church_name || user.denomination || user.christian_years) && (
            <div style={{background:"#f9f9fe",borderRadius:12,padding:16,border:"1px solid #eee"}}>
              <div style={{fontWeight:700,color:"#6C3FA0",marginBottom:10,fontSize:15}}>✝️ {t("profile.sectionChurch","Vida Crista")}</div>
              {user.church_name && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.church","Igreja")}:</b> {user.church_name}</div>}
              {user.denomination && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.denomination","Denominacao")}:</b> {user.denomination}</div>}
              {user.christian_years && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.faithYears","Anos de fe")}:</b> {user.christian_years}</div>}
              {user.church_role && <div style={{fontSize:14,marginBottom:6}}><b>{t("profile.churchRole","Funcao")}:</b> {user.church_role}</div>}
            </div>
          )}
          {user.favorite_verse && (
            <div style={{background:"#f9f9fe",borderRadius:12,padding:16,border:"1px solid #eee"}}>
              <div style={{fontWeight:700,color:"#6C3FA0",marginBottom:10,fontSize:15}}>📖 {t("profile.favoriteVerse","Versiculo Favorito")}</div>
              <p style={{fontSize:14,fontStyle:"italic",color:"#444"}}>{user.favorite_verse}</p>
            </div>
          )}
          {user.testimony && (
            <div style={{background:"#f9f9fe",borderRadius:12,padding:16,border:"1px solid #eee"}}>
              <div style={{fontWeight:700,color:"#6C3FA0",marginBottom:10,fontSize:15}}>🙏 {t("profile.testimony","Testemunho")}</div>
              <p style={{fontSize:14,color:"#444",whiteSpace:"pre-wrap"}}>{user.testimony}</p>
            </div>
          )}
        </div>
      )}'''

content = content.replace(old, new)
with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
