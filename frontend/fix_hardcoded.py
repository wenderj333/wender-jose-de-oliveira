with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('"pedido enviado"', 't("profile.requestSent","pedido enviado")')
c = c.replace('"✓ irmaos"', '"✓ " + t("profile.following","irmaos")')
c = c.replace('"A fazer upload..."', 't("profile.uploading","A fazer upload...")')
c = c.replace('"Escolher foto"', 't("profile.choosePhoto","Escolher foto")')
c = c.replace('"Legenda (opcional)"', 't("profile.photoCaption","Legenda")')
c = c.replace('"🌎 Publico"', '"🌎 " + t("profile.visPublic","Publico")')
c = c.replace('"🤝 So irmaos"', '"🤝 " + t("profile.visFriends","So irmaos")')
c = c.replace('"🔒 So eu"', '"🔒 " + t("profile.visPrivate","So eu")')
c = c.replace('"📤 Publicar Foto"', '"📤 " + t("profile.addPhoto","Publicar Foto")')
c = c.replace('"Nenhuma publicacao ainda."', 't("profile.noPosts","Nenhuma publicacao ainda.")')
c = c.replace('"Nenhuma foto ainda."', 't("profile.noPhotos","Nenhuma foto ainda.")')
c = c.replace('"Editar perfil"', 't("profile.editProfile","Editar perfil")')
c = c.replace('"Ver Perfil"', 't("profile.viewProfile","Ver Perfil")')

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
