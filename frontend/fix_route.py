with open("src/App.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'import Profile from "./pages/Profile";',
    'import Profile from "./pages/Profile";\nimport ProfileView from "./pages/ProfileView";'
)
content = content.replace(
    '<Route path="/perfil/:userId" element={<Profile />} />',
    '<Route path="/perfil/:userId" element={<Profile />} />\n            <Route path="/ver-perfil/:userId" element={<ProfileView />} />',
    1
)

with open("src/App.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
