c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()
c = c.replace(
    "    </div></div>\n  );\n}\n// cover",
    "    </div></div>\n      {selPhoto && <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />}\n  );\n}\n// cover"
)
if 'PhotoModal' in c:
    print('OK!')
else:
    print('NAO')
open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
