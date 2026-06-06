c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()
c = c.replace(
    'import PhotoModal from "../components/PhotoModal";',
    'import PhotoModal from "../components/PhotoModal";\nimport PhotoUploader from "../components/PhotoUploader";'
)
c = c.replace(
    "  const [showUpload, setShowUpload] = useState(false);",
    "  const [showUpload, setShowUpload] = useState(false);\n  const [showUploader, setShowUploader] = useState(false);"
)
c = c.replace(
    '<button onClick={()=>setShowUpload(!showUpload)} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:14}}>+ Adicionar Foto</button>',
    '<button onClick={()=>setShowUploader(true)} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:14}}>+ Adicionar Foto</button>'
)
c = c.replace(
    "      <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />",
    "      <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />\n      {showUploader && <PhotoUploader token={token} onSuccess={(p)=>setPhotos(prev=>[p,...prev])} onClose={()=>setShowUploader(false)} />}"
)
open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('OK!')
