with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Mostrar fotos da galeria tambem nas abas Todas e Fotos
old = "          {userPosts.filter(p=>activeTab===\"all\"?true:activeTab===\"foto\"?(p.media_url&&!p.media_url.includes(\"video\")):(p.media_url&&p.media_url.includes(\"video\"))).map(p=>("
new = """          {[...userPosts.filter(p=>activeTab==="all"?true:activeTab==="foto"?(p.media_url&&!p.media_url.includes("video")):(p.media_url&&p.media_url.includes("video"))),
            ...(activeTab==="all"||activeTab==="foto"?photos.map(p=>({id:"ph_"+p.id,media_url:p.url,content:""})):[])
          ].map(p=>("""

c = c.replace(old, new)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
