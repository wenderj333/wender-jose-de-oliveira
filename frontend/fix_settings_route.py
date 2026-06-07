with open('src/App.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Adicionar import
c = c.replace(
    'import Profile from "./pages/Profile";',
    'import Profile from "./pages/Profile";\nimport Settings from "./pages/Settings";'
)

# Adicionar rota
c = c.replace(
    '<Route path="/perfil/:userId" element={<Profile />} />',
    '<Route path="/perfil/:userId" element={<Profile />} />\n        <Route path="/settings" element={<Settings />} />\n        <Route path="/configuracoes" element={<Settings />} />'
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('OK: ' + str(c.count('Settings')))
