jsx = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()

# Adicionar estados novos
jsx = jsx.replace(
    "  const [showInfo, setShowInfo] = useState(false);",
    "  const [showInfo, setShowInfo] = useState(false);\n  const [userPosts, setUserPosts] = useState([]);\n  const [activeTab, setActiveTab] = useState('all');\n  const [photos, setPhotos] = useState([]);\n  const [showUpload, setShowUpload] = useState(false);\n  const [uploading, setUploading] = useState(false);\n  const [photoCaption, setPhotoCaption] = useState('');\n  const [photoVisibility, setPhotoVisibility] = useState('public');\n  const photoInputRef = React.useRef(null);"
)

# Adicionar fetch posts e fotos
jsx = jsx.replace(
    "  const targetId = userId || currentUser?.id;",
    """  const targetId = userId || currentUser?.id;
  useEffect(() => {
    if (!targetId || !token) return;
    fetch((import.meta.env.VITE_API_URL || '') + '/api/feed', { headers: { Authorization: 'Bearer ' + token } })
    .then(r => r.json()).then(d => setUserPosts((d.posts||[]).filter(p=>p.user_id===targetId||p.author_id===targetId))).catch(()=>{});
    fetch((import.meta.env.VITE_API_URL || '') + '/api/photos/' + targetId, { headers: { Authorization: 'Bearer ' + token } })
    .then(r => r.ok ? r.json() : {photos:[]}).then(d => setPhotos(d.photos||[])).catch(()=>{});
  }, [targetId, token]);
  const uploadPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('upload_preset', 'sigo_com_fe');
      const res = await fetch('https://api.cloudinary.com/v1_1/degxiuf43/image/upload', {method:'POST',body:fd});
      const d = await res.json();
      await fetch((import.meta.env.VITE_API_URL||'')+'/api/photos', {method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({url:d.secure_url,caption:photoCaption,visibility:photoVisibility})});
      setPhotos(prev=>[{id:Date.now(),url:d.secure_url,caption:photoCaption,visibility:photoVisibility},...prev]);
      setShowUpload(false); setPhotoCaption('');
    } catch(e) { alert('Erro ao fazer upload'); }
    setUploading(false);
  };"""
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(jsx)
print('Passo 1 OK!')
