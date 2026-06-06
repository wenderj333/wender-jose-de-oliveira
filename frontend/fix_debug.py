with open("src/pages/ProfileView.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Adicionar debug
content = content.replace(
    ".then(data => { setProfile(data.user || data); setLoading(false); })",
    ".then(data => { console.log('API data:', JSON.stringify(data)); setProfile(data.user || data); setLoading(false); })"
)

with open("src/pages/ProfileView.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
