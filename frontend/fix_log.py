with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    ".then(data => { setUser(data.user || data); setLoading(false); })",
    ".then(data => { console.log('PERFIL DATA:', JSON.stringify(data)); setUser(data.user || data); setLoading(false); })"
)

with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
