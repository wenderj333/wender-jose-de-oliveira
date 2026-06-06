c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()
c = c.replace(
    'import { Loader2, Grid, Settings } from "lucide-react";',
    'import { Loader2, Grid, Settings } from "lucide-react";\nimport PhotoModal from "../components/PhotoModal";'
)
c = c.replace(
    "  const photoInputRef = React.useRef(null);",
    "  const photoInputRef = React.useRef(null);\n  const [selPhoto, setSelPhoto] = useState(null);"
)
c = c.replace(
    'objectFit:"cover"}}/>',
    'objectFit:"cover",cursor:"pointer"}} onClick={()=>setSelPhoto(p.url)}/>'
)
c = c.replace(
    '// cover',
    '// cover\n'
)
# Adicionar PhotoModal antes do return final
c = c.replace(
    "  );\n}\n// cover",
    "  );\n}\n// cover"
)
open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('OK!')
