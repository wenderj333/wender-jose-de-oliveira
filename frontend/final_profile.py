jsx = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()

# Ler o conteudo atual e adicionar tudo necessario
lines = jsx.split('\n')
new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    # Adicionar imports depois da linha 4
    if i == 4 and 'lucide-react' in line:
        new_lines.append('import PhotoModal from "../components/PhotoModal";')
        new_lines.append('import PhotoUploader from "../components/PhotoUploader";')
    # Adicionar estados depois de showUpload
    if 'const [showUpload, setShowUpload]' in line:
        new_lines.append('  const [showUploader, setShowUploader] = useState(false);')
        new_lines.append('  const [selPhoto, setSelPhoto] = useState(null);')

result = '\n'.join(new_lines)

# Mudar onclick do botao
result = result.replace(
    "onClick={()=>setShowUpload(!showUpload)}",
    "onClick={()=>setShowUploader(true)}"
)

# Adicionar click nas fotos
result = result.replace(
    'onClick={()=>setSelectedPhoto(p.url)}',
    'onClick={()=>setSelPhoto(p.url)}'
)

# Adicionar modais antes do ultimo </div></div>
result = result.replace(
    "    </div></div>\n  );",
    "      <PhotoModal url={selPhoto} onClose={()=>setSelPhoto(null)} />\n      {showUploader && <PhotoUploader token={token} onSuccess={(p)=>setPhotos(prev=>[p,...prev])} onClose={()=>setShowUploader(false)} />}\n    </div></div>\n  );"
)

open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(result)
print('OK!')
