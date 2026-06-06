with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Adicionar estado do lightbox
c = c.replace(
    "  const photoInputRef = React.useRef(null);",
    "  const photoInputRef = React.useRef(null);\n  const [selectedPhoto, setSelectedPhoto] = useState(null);"
)

# Adicionar click na foto e lightbox
c = c.replace(
    "<img src={p.url} alt=\"\" style={{width:\"100%\",height:\"100%\",objectFit:\"cover\"}}/>",
    "<img src={p.url} alt=\"\" style={{width:\"100%\",height:\"100%\",objectFit:\"cover\",cursor:\"pointer\"}} onClick={()=>setSelectedPhoto(p.url)}/>"
)

# Adicionar modal lightbox antes do ultimo </div>
c = c.replace(
    "    </div>\n  );\n}",
    """    </div>
      {selectedPhoto && (
        <div onClick={()=>setSelectedPhoto(null)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.9)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <img src={selectedPhoto} style={{maxWidth:"90vw",maxHeight:"90vh",objectFit:"contain",borderRadius:8}}/>
          <button onClick={()=>setSelectedPhoto(null)} style={{position:"absolute",top:20,right:20,background:"white",border:"none",borderRadius:"50%",width:40,height:40,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
      )}
  );
}"""
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
