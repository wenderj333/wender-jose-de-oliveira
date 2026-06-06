c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()

# Adicionar estados
c = c.replace(
    "  const [showUpload, setShowUpload] = useState(false);",
    "  const [showUpload, setShowUpload] = useState(false);\n  const [showUploader, setShowUploader] = useState(false);\n  const [selPhoto, setSelPhoto] = useState(null);"
)

# Mudar onclick botao
c = c.replace(
    "onClick={()=>setShowUpload(!showUpload)}",
    "onClick={()=>setShowUploader(true)}"
)

# Click nas fotos
c = c.replace(
    'onClick={()=>setSelectedPhoto(p.url)}',
    'onClick={()=>setSelPhoto(p.url)}'
)

open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('OK - estados: ' + str(c.count('selPhoto')))
