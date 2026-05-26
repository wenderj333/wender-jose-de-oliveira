content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
lines = content.split("\r\n")

# Remover modal da posicao errada
new_lines = []
skip = 0
for i, line in enumerate(lines):
    if '{showShareModal && (' in line and i > 470:
        skip = 13
    if skip > 0:
        skip -= 1
        continue
    new_lines.append(line)

# Adicionar modal na posicao certa (antes da linha 492 agora reduzida)
modal = [
    '    {showShareModal && (',
    '      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowShareModal(false)}>',
    '        <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:400,padding:24,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>',
    '          <h3 style={{margin:"0 0 16px",fontWeight:700}}>Partilhar com membro</h3>',
    '          {shareMembers.map(m=>(<div key={m.id} onClick={()=>sendPostToMember(m.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 8px",cursor:"pointer",borderBottom:"1px solid #f0f0f0"}}><div style={{width:32,height:32,borderRadius:"50%",background:"#4a80d4",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700}}>{(m.full_name||"U").charAt(0)}</div><span>{m.full_name}</span></div>))}',
    '        </div>',
    '      </div>',
    '    )}',
]

# Encontrar posicao do ); final
for i, line in enumerate(new_lines):
    if line.strip() == ')' and i > 470:
        new_lines = new_lines[:i] + modal + new_lines[i:]
        print("Modal inserido na linha:", i)
        break

open("frontend/src/pages/MuralGrid.jsx", "wb").write("\r\n".join(new_lines).encode("utf-8"))
print("Feito!")