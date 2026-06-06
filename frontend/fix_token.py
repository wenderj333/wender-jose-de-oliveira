with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "    if (!targetId || !token) return;",
    "    if (!targetId) return;"
)

c = c.replace(
    "const h = token ? { Authorization: \"Bearer \" + token } : {};",
    "const h = token ? { Authorization: \"Bearer \" + token } : {}; console.log('Loading profile for:', targetId);"
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
