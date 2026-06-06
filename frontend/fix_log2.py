with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Adicionar log do URL
c = c.replace(
    'console.log(\'Loading profile for:\', targetId);',
    'console.log(\'Loading profile for:\', targetId); console.log(\'API URL:\', API + "/profile/" + targetId);'
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
