with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "    if (!targetId) return;",
    "    if (!targetId || !token) return;"
)

c = c.replace(
    "console.log('API response:', JSON.stringify(uRes)); setData({",
    "setData({"
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
