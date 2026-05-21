content = open("frontend/src/pages/AjudaUmaVida.jsx", "rb").read().decode("utf-8")

old = '              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>\n                <span style={{color:"#6c47d4",fontSize:12,fontWeight:600}}>🙏 {post.prayer_count||0} pessoas contigo nesta oracao</span>\n                <button onClick={()=>handlePray(post.id)} disabled={prayed} style={{padding:"8px 18px",borderRadius:20,border:"none",background:prayed?"#eee":"linear-gradient(135deg,#6c47d4,#4A2270)",color:prayed?"#aaa":"white",fontWeight:700,cursor:prayed?"default":"pointer",fontSize:13,transition:"all 0.2s"}}>\n                  {prayed ? "✓ " + t("ajuda.prayNow","Orei") : t("ajuda.prayNow","🙏 Orar agora")}\n                </button>\n              </div>'

new = '              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>\n                <span style={{color:"#6c47d4",fontSize:12,fontWeight:600}}>🙏 {post.prayer_count||0} pessoas contigo nesta oracao</span>\n                <div style={{display:"flex",gap:8"}}>\n                  <button onClick={()=>handlePray(post.id)} disabled={prayed} style={{padding:"8px 18px",borderRadius:20,border:"none",background:prayed?"#eee":"linear-gradient(135deg,#6c47d4,#4A2270)",color:prayed?"#aaa":"white",fontWeight:700,cursor:prayed?"default":"pointer",fontSize:13,transition:"all 0.2s"}}>\n                    {prayed ? "✓ " + t("ajuda.prayNow","Orei") : t("ajuda.prayNow","🙏 Orar agora")}\n                  </button>\n                  {post.pix_key && (\n                    <button onClick={()=>{navigator.clipboard.writeText(post.pix_key);alert("Chave PIX copiada! " + post.pix_key);}} style={{padding:"8px 18px",borderRadius:20,border:"none",background:"linear-gradient(135deg,#27ae60,#1e8a5a)",color:"white",fontWeight:700,cursor:"pointer",fontSize:13}}>\n                      💚 Doar via PIX\n                    </button>\n                  )}\n                </div>\n              </div>'

if old in content:
    content = content.replace(old, new)
    open("frontend/src/pages/AjudaUmaVida.jsx", "wb").write(content.encode("utf-8"))
    print("Feito!")
else:
    print("Texto nao encontrado - tentando alternativa")
    # Try to find the pray button section
    idx = content.find('personas contigo nesta oracao')
    if idx > 0:
        print("Encontrado na posicao:", idx)
