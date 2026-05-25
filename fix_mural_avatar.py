content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
old = "        <div style={{ width: 42, height: 42, borderRadius: '50%', background: linear-gradient(135deg,,88), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>\n          {authorInitials}\n        </div>"
new = "        <div onClick={()=>window.location.href='/perfil/'+(post.author_id||post.user_id)} style={{ width: 42, height: 42, borderRadius: '50%', background: linear-gradient(135deg,,88), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0, cursor:'pointer', overflow:'hidden' }}>\n          {post.author_avatar||post.avatar_url ? <img src={post.author_avatar||post.avatar_url} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : authorInitials}\n        </div>"
if old in content:
    content = content.replace(old, new)
    open("frontend/src/pages/MuralGrid.jsx", "wb").write(content.encode("utf-8"))
    print("Feito!")
else:
    print("Nao encontrado")
