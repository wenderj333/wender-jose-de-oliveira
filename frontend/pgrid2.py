with open("src/pages/Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = "  useEffect(() => {\n    if (!targetId) return;\n    fetch(API + \"/profile/\" + targetId"
new = "  useEffect(() => {\n    if (!targetId || !token) return;\n    fetch(API2 + \"/feed?user_id=\" + targetId, { headers: { Authorization: \"Bearer \" + token } })\n    .then(r => r.json()).then(d => setUserPosts(d.posts || [])).catch(() => {});\n  }, [targetId, token]);\n\n  useEffect(() => {\n    if (!targetId) return;\n    fetch(API + \"/profile/\" + targetId"

if old in content:
    content = content.replace(old, new)
    print("Passo 2 OK!")
else:
    print("NAO encontrado")

with open("src/pages/Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)
