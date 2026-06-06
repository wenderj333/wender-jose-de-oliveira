c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()

# Remover estado duplicado
c = c.replace(
    "  const [selPhoto, setSelPhoto] = useState(null);\n  const [selPhoto, setSelPhoto] = useState(null);",
    "  const [selPhoto, setSelPhoto] = useState(null);"
)
c = c.replace(
    "  const [selectedPhoto, setSelectedPhoto] = useState(null);",
    ""
)

# Corrigir posicao do PhotoModal - deve estar DENTRO do return
c = c.replace(
    "      </div></div>\n        {selPhoto && <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />}\n  );",
    "      </div></div>\n      {selPhoto && <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />}\n  );"
)

open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('OK!')
