content = open("frontend/src/pages/AjudaUmaVida.jsx", "rb").read().decode("utf-8")

# Adicionar estado pixKey
old1 = '  const [submitting, setSubmitting] = useState(false);'
new1 = '  const [submitting, setSubmitting] = useState(false);\n  const [pixKey, setPixKey] = useState("");'
content = content.replace(old1, new1)

# Adicionar pixKey no submit
old2 = 'body:JSON.stringify({content, type:postType, is_anonymous:isAnon, is_urgent:isUrgent})'
new2 = 'body:JSON.stringify({content, type:postType, is_anonymous:isAnon, is_urgent:isUrgent, pix_key:pixKey})'
content = content.replace(old2, new2)

# Adicionar campo PIX no formulario depois do textarea
old3 = '          <div style={{display:"flex",gap:10,marginTop:10,alignItems:"center"}}>'
new3 = '          {(postType==="request" || postType==="offer") && (\n            <input value={pixKey} onChange={e=>setPixKey(e.target.value)} placeholder="Chave PIX (opcional) - para receber doações" style={{width:"100%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,padding:12,color:"white",fontSize:13,outline:"none",boxSizing:"border-box",marginTop:8}} />\n          )}\n          <div style={{display:"flex",gap:10,marginTop:10,alignItems:"center"}}>'
content = content.replace(old3, new3)

open("frontend/src/pages/AjudaUmaVida.jsx", "wb").write(content.encode("utf-8"))
print("Feito!")
