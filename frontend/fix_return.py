c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()
c = c.replace(
    "    </div></div>\n      <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />\n      {showUploader && <PhotoUploader token={token} onSuccess={(p)=>setPhotos(prev=>[p,...prev])} onClose={()=>setShowUploader(false)} />}\n  );\n}\n// cover",
    "    </div></div>\n    </>\n      )}\n    <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />\n    {showUploader && <PhotoUploader token={token} onSuccess={(p)=>setPhotos(prev=>[p,...prev])} onClose={()=>setShowUploader(false)} />}\n  );\n}\n// cover"
)
open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('tentativa')
