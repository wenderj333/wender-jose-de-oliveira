c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()

# 1. Import
c = c.replace(
    'import { Loader2, Grid, Settings } from "lucide-react";',
    'import { Loader2, Grid, Settings } from "lucide-react";\nimport PhotoModal from "../components/PhotoModal";\nimport PhotoUploader from "../components/PhotoUploader";'
)

# 2. Estados
c = c.replace(
    "  const [showUpload, setShowUpload] = useState(false);",
    "  const [showUpload, setShowUpload] = useState(false);\n  const [showUploader, setShowUploader] = useState(false);\n  const [selPhoto, setSelPhoto] = useState(null);"
)

# 3. Click nas fotos
c = c.replace(
    'onClick={()=>setSelectedPhoto(p.url)}',
    'onClick={()=>setSelPhoto(p.url)}'
)

# 4. Botao abrir uploader
c = c.replace(
    "onClick={()=>setShowUpload(!showUpload)}",
    "onClick={()=>setShowUploader(true)}"
)

# 5. PhotoModal e PhotoUploader no final do return
c = c.replace(
    "    </div></div>\n  );\n}\n// cover",
    "    </div></div>\n      <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />\n      {showUploader && <PhotoUploader token={token} onSuccess={(p)=>setPhotos(prev=>[p,...prev])} onClose={()=>setShowUploader(false)} />}\n  );\n}\n// cover"
)

open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('OK!')
