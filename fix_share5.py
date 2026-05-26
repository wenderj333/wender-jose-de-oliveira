content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
lines = content.split("\r\n")

modal_lines = [
    '    {showShareModal && (',
    '      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowShareModal(false)}>',
    '        <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:400,padding:24,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>',
    '          <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:700}}>Partilhar com membro</h3>',
    '          {shareMembers.map(m=>(',
    '            <div key={m.id} onClick={()=>sendPostToMember(m.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 8px",borderRadius:8,cursor:"pointer",borderBottom:"1px solid #f0f0f0"}}>',
    '              <div style={{width:36,height:36,borderRadius:"50%",background:"#4a80d4",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:14}}>{(m.full_name||"U").charAt(0).toUpperCase()}</div>',
    '              <div style={{fontWeight:600,fontSize:14}}>{m.full_name}</div>',
    '            </div>',
    '          ))}',
    '        </div>',
    '      </div>',
    '    )}',
]

new_lines = lines[:480] + modal_lines + lines[480:]
open("frontend/src/pages/MuralGrid.jsx", "wb").write("\r\n".join(new_lines).encode("utf-8"))
print("Feito!")