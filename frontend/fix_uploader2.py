c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()

# Adicionar import
c = c.replace(
    'import { Loader2, Grid, Settings } from "lucide-react";',
    'import { Loader2, Grid, Settings } from "lucide-react";\nimport PhotoUploader from "../components/PhotoUploader";'
)

# Adicionar estado
c = c.replace(
    "  const [showUpload, setShowUpload] = useState(false);",
    "  const [showUpload, setShowUpload] = useState(false);\n  const [showUploader, setShowUploader] = useState(false);"
)

# Substituir botao
c = c.replace(
    "+ Adicionar Foto</button>",
    "+ Adicionar Foto</button>{showUploader && <PhotoUploader token={token} onSuccess={(p)=>setPhotos(prev=>[p,...prev])} onClose={()=>setShowUploader(false)} />}"
)

# Mudar onclick do botao
c = c.replace(
    "onClick={()=>setShowUpload(!showUpload)}",
    "onClick={()=>setShowUploader(true)}"
)

open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('OK!')
