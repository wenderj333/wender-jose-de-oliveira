content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
lines = content.split("\r\n")
lines[346] = "        <div onClick={()=>window.location.href='/perfil/'+(post.author_id||post.user_id)} style={{ width: 42, height: 42, borderRadius: '50%', background: linear-gradient(135deg,,88), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0, cursor:'pointer', overflow:'hidden' }}>"
lines[347] = "          {post.author_avatar||post.avatar_url ? <img src={post.author_avatar||post.avatar_url} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : authorInitials}"
open("frontend/src/pages/MuralGrid.jsx", "wb").write("\r\n".join(lines).encode("utf-8"))
print("Feito!")
