c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()
c = c.replace("  const photoInputRef = React.useRef(null);", "  const photoInputRef = React.useRef(null);\n  const [selPhoto, setSelPhoto] = useState(null);")
c = c.replace('onClick={()=>setSelectedPhoto(p.url)}', 'onClick={()=>setSelPhoto(p.url)}')
modal = '\n      {selPhoto && <div onClick={()=>setSelPhoto(null)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.92)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={selPhoto} style={{maxWidth:"90vw",maxHeight:"90vh",objectFit:"contain"}}/><span onClick={()=>setSelPhoto(null)} style={{position:"absolute",top:20,right:20,color:"white",fontSize:30,cursor:"pointer"}}>X</span></div>}'
c = c.replace("    </div></div>\n  );\n}\n// cover", "    </div></div>" + modal + "\n  );\n}\n// cover")
open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('OK!')
