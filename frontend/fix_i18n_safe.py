jsx = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()

# Corrigir textos hardcoded - um por vez com cuidado
replacements = [
    ('"pedido enviado"', 't("profile.requestSent","pedido enviado")'),
    ('"A fazer upload..."', 't("profile.uploading","A fazer upload...")'),
    ('"Nenhuma publicacao ainda."', 't("profile.noPosts","Nenhuma publicacao ainda.")'),
]

for old, new in replacements:
    if old in jsx:
        jsx = jsx.replace(old, new)
        print('OK: ' + old[:30])
    else:
        print('NAO: ' + old[:30])

open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(jsx)
print('Feito!')
