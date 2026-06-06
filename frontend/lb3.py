with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

old = "    </div></div>\n  );\n}\n// cover"
new = """    </div></div>
      {selPhoto && (
        <div onClick={()=>setSelPhoto(null)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.92)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <img src={selPhoto} style={{maxWidth:"90vw",maxHeight:"90vh",objectFit:"contain",borderRadius:8}}/>
          <button onClick={()=>setSelPhoto(null)} style={{position:"absolute",top:20,right:20,background:"white",border:"none",borderRadius:"50%",width:40,height:40,fontSize:18,cursor:"pointer",fontWeight:"bold"}}>X</button>
        </div>
      )}
  );
}
// cover"""

if old in c:
    c = c.replace(old, new)
    print('OK!')
else:
    print('NAO encontrado')

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
