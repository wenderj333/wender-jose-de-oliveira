content = open("src/pages/ProfileView.jsx", "r", encoding="utf-8").read()

# Usar dados do localStorage como fallback
old = "  const targetId = userId || currentUser?.id;"
new = """  const targetId = userId || currentUser?.id;
  const savedUser = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch(e) { return null; } })();"""

content = content.replace(old, new)

# Usar token do localStorage
content = content.replace(
    'headers: { Authorization: "Bearer " + token }',
    'headers: { Authorization: "Bearer " + (token || localStorage.getItem("token")) }'
)

# Fallback para dados salvos
content = content.replace(
    '.then(data => { console.log(\'API data:\', JSON.stringify(data)); setProfile(data.user || data); setLoading(false); })',
    '.then(data => { setProfile(data.user || data || savedUser); setLoading(false); })'
)

open("src/pages/ProfileView.jsx", "w", encoding="utf-8").write(content)
print("Feito!")
