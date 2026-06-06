c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()

# Adicionar import
c = c.replace(
    'import { Loader2, Grid, Settings } from "lucide-react";',
    'import { Loader2, Grid, Settings } from "lucide-react";\nimport PhotoModal from "../components/PhotoModal";'
)

# Adicionar estado
c = c.replace(
    "  const photoInputRef = React.useRef(null);",
    "  const photoInputRef = React.useRef(null);\n  const [selPhoto, setSelPhoto] = useState(null);"
)

# Adicionar click nas fotos
c = c.replace(
    'onClick={()=>setSelectedPhoto(p.url)}',
    'onClick={()=>setSelPhoto(p.url)}'
)

open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('Passo 1 OK!')
