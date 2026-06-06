c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()

# Remover o que foi adicionado mal
c = c.replace(
    "    </div></div>\n    </>\n      )}\n    <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />\n    {showUploader && <PhotoUploader token={token} onSuccess={(p)=>setPhotos(prev=>[p,...prev])} onClose={()=>setShowUploader(false)} />}\n  );\n}\n// cover",
    "    </div></div>\n  );\n}\n// cover"
)

# Adicionar dentro do div principal antes de fechar
c = c.replace(
    "    </div></div>\n  );\n}\n// cover",
    "    <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />\n    {showUploader && <PhotoUploader token={token} onSuccess={(p)=>setPhotos(prev=>[p,...prev])} onClose={()=>setShowUploader(false)} />}\n    </div></div>\n  );\n}\n// cover"
)

open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('OK!')
