with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Adicionar estado
c = c.replace(
    "  const [showInfo, setShowInfo] = useState(false);",
    "  const [showInfo, setShowInfo] = useState(false);\n  const [userPosts, setUserPosts] = useState([]);\n  const [activeTab, setActiveTab] = useState('all');"
)

# Adicionar fetch de posts
c = c.replace(
    "  const targetId = userId || currentUser?.id;",
    """  const targetId = userId || currentUser?.id;
  useEffect(() => {
    if (!targetId || !token) return;
    const url = (import.meta.env.VITE_API_URL || '') + '/api/feed';
    fetch(url, { headers: { Authorization: 'Bearer ' + token } })
    .then(r => r.json())
    .then(d => { const all = d.posts || []; setUserPosts(all.filter(p => p.user_id === targetId || p.author_id === targetId)); })
    .catch(() => {});
  }, [targetId, token]);"""
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Passo 1 OK!')
