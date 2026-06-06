c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()

# Remover imports duplicados
c = c.replace(
    'import PhotoModal from "../components/PhotoModal";\nimport PhotoUploader from "../components/PhotoUploader";\nimport PhotoModal from "../components/PhotoModal";',
    'import PhotoModal from "../components/PhotoModal";\nimport PhotoUploader from "../components/PhotoUploader";'
)

# Remover estados duplicados
c = c.replace(
    "  const [selPhoto, setSelPhoto] = useState(null);\n  const [selectedPhoto, setSelectedPhoto] = useState(null);",
    "  const [selPhoto, setSelPhoto] = useState(null);"
)
c = c.replace(
    "  const [showUploader, setShowUploader] = useState(false);\n  const [selPhoto, setSelPhoto] = useState(null);\n  const [showUploader, setShowUploader] = useState(false);",
    "  const [showUploader, setShowUploader] = useState(false);\n  const [selPhoto, setSelPhoto] = useState(null);"
)

open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('OK!')
