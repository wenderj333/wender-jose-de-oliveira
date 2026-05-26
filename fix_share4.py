content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")

# 1. Adicionar estados depois de isMusicPlaying
old1 = "  const [isMusicPlaying, setIsMusicPlaying] = useState(false);"
new1 = """  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMembers, setShareMembers] = useState([]);
  const loadShareMembers = async () => {
    try {
      const res = await fetch(API + '/members', { headers: token ? { Authorization: 'Bearer ' + token } : {} });
      const data = await res.json();
      setShareMembers(Array.isArray(data) ? data : (data.members || []));
    } catch(e) {}
  };
  const sendPostToMember = async (memberId) => {
    const url = window.location.origin + '/mural?post=' + post.id;
    const msg = 'Post: ' + (post.content || '') + ' ' + url;
    try {
      await fetch(API + '/api/messages', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ receiverId: memberId, content: msg }) });
      setShowShareModal(false);
      alert('Post enviado!');
    } catch(e) { alert('Erro'); }
  };"""
if old1 in content:
    content = content.replace(old1, new1)
    print("Estados OK")
else:
    print("Estados nao encontrado")

# 2. Substituir botao share
old2 = 'onClick={() => { const url = window.location.origin + "/mural?post=" + post.id; if (navigator.share) { navigator.share({ title: "Sigo com Fe", text: post.content, url }); } else { navigator.clipboard.writeText(url); alert("Link copiado!"); } }}'
new2 = 'onClick={() => { setShowShareModal(true); loadShareMembers(); }}'
if old2 in content:
    content = content.replace(old2, new2)
    print("Botao OK")
else:
    print("Botao nao encontrado")

# 3. Adicionar modal antes do </div> final do PostCard
old3 = "      {selectedPost"
new3 = """      {showShareModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowShareModal(false)}>
          <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:400,padding:24,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:700}}>Partilhar com membro</h3>
            {shareMembers.map(m=>(
              <div key={m.id} onClick={()=>sendPostToMember(m.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 8px",borderRadius:8,cursor:"pointer",borderBottom:"1px solid #f0f0f0"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"#4a80d4",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:14,overflow:"hidden",flexShrink:0}}>{(m.full_name||"U").charAt(0).toUpperCase()}</div>
                <div style={{fontWeight:600,fontSize:14}}>{m.full_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedPost"""
if old3 in content:
    content = content.replace(old3, new3, 1)
    print("Modal OK")
else:
    print("Modal nao encontrado")

open("frontend/src/pages/MuralGrid.jsx", "wb").write(content.encode("utf-8"))
print("Feito!")