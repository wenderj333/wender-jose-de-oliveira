c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()
old = "    </div></div>\n  );\n}\n// cover"
new = "    </div></div>\n      {showUploader && <PhotoUploader token={token} onSuccess={(p)=>{setPhotos(prev=>[p,...prev]);}} onClose={()=>setShowUploader(false)} />}\n  );\n}\n// cover"
if old in c:
    c = c.replace(old, new)
    print('OK!')
else:
    print('NAO: ' + repr(c[-100:]))
open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
