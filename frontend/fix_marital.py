with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "{user.profession && <div style={{fontSize:14,marginBottom:6}}><b>{t(\"profile.profession\",\"Profissao\")}:</b> {user.profession}</div>}",
    "{user.profession && <div style={{fontSize:14,marginBottom:6}}><b>{t(\"profile.profession\",\"Profissao\")}:</b> {user.profession}</div>}\n              {user.marital_status && <div style={{fontSize:14,marginBottom:6}}><b>{t(\"profile.maritalStatus\",\"Estado Civil\")}:</b> {user.marital_status}</div>}"
)

with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
