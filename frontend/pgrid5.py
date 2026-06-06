import re
with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "  const [showInfo, setShowInfo] = useState(false);",
    "  const [showInfo, setShowInfo] = useState(false);\n  const [userPosts, setUserPosts] = useState([]);\n  const [activeTab, setActiveTab] = useState('all');"
)

c = c.replace(
    "  const targetId = userId || currentUser?.id;",
    "  const targetId = userId || currentUser?.id;\n  useEffect(() => {\n    if (!targetId || !token) return;\n    fetch((import.meta.env.VITE_API_URL || '') + '/api/feed', { headers: { Authorization: 'Bearer ' + token } })\n    .then(r => r.json()).then(d => setUserPosts((d.posts || []).filter(p => p.user_id === targetId))).catch(() => {});\n  }, [targetId, token]);"
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('OK!')
