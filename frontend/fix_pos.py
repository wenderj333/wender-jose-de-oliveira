c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()
c = c.replace(
    "      </div></div>\n        {showUploader",
    "      </div></div>\n      {showUploader"
)
c = c.replace(
    "    </div></div>\n      {showUploader && <PhotoUploader token={token} onSuccess={(p)=>{setPhotos(prev=>[p,...prev]);}} onClose={()=>setShowUploader(false)} />}\n  );",
    "    </div></div>\n    )}\n    {showUploader && <PhotoUploader token={token} onSuccess={(p)=>setPhotos(prev=>[p,...prev])} onClose={()=>setShowUploader(false)} />\n  );"
)
open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('tentativa feita')
