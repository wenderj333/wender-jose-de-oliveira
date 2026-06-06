with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "fetch(API + \"/photos/\" + targetId, { headers: h }).then(r => r.json()),",
    "fetch(API + \"/photos/\" + targetId, { headers: h }).then(r => r.ok ? r.json() : { photos: [] }),"
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
