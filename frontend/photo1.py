with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Adicionar estados para galeria
c = c.replace(
    "  const [activeTab, setActiveTab] = useState('all');",
    """  const [activeTab, setActiveTab] = useState('all');
  const [photos, setPhotos] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoVisibility, setPhotoVisibility] = useState('public');
  const photoInputRef = React.useRef(null);"""
)

# Adicionar fetch de fotos e funcao de upload
c = c.replace(
    "  useEffect(() => {\n    if (!targetId || !token) return;\n    const url = (import.meta.env.VITE_API_URL || '') + '/api/feed';",
    """  useEffect(() => {
    if (!targetId) return;
    fetch((import.meta.env.VITE_API_URL || '') + '/api/photos/' + targetId, {
      headers: token ? { Authorization: 'Bearer ' + token } : {}
    })
    .then(r => r.json()).then(d => setPhotos(d.photos || [])).catch(() => {});
  }, [targetId, token]);

  const uploadPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'sigo_com_fe');
      const res = await fetch('https://api.cloudinary.com/v1_1/degxiuf43/image/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const url = data.secure_url;
      await fetch((import.meta.env.VITE_API_URL || '') + '/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ url, caption: photoCaption, visibility: photoVisibility })
      });
      setPhotos(prev => [{ url, caption: photoCaption, visibility: photoVisibility, id: Date.now() }, ...prev]);
      setShowUpload(false);
      setPhotoCaption('');
    } catch(e) { alert('Erro ao fazer upload'); }
    setUploading(false);
  };

  useEffect(() => {
    if (!targetId || !token) return;
    const url = (import.meta.env.VITE_API_URL || '') + '/api/feed';"""
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Passo 1 OK!')
