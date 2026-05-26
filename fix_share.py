content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
old = "  const [isMusicPlaying, setIsMusicPlaying] = useState(false);"
new_code = "  const [isMusicPlaying, setIsMusicPlaying] = useState(false);\n  const [showShareModal, setShowShareModal] = useState(false);\n  const [shareMembers, setShareMembers] = useState([]);\n  const loadShareMembers = async () => {\n    try {\n      const res = await fetch(API + \"/members\", { headers: token ? { Authorization: \"Bearer \" + token } : {} });\n      const data = await res.json();\n      setShareMembers(Array.isArray(data) ? data : (data.members || []));\n    } catch(e) {}\n  };\n  const sendPostToMember = async (memberId) => {\n    const url = window.location.origin + \"/mural?post=\" + post.id;\n    const msg = \"Post: \" + (post.content || \"\") + \" \" + url;\n    try {\n      await fetch(API + \"/api/messages\", { method: \"POST\", headers: { Authorization: \"Bearer \" + token, \"Content-Type\": \"application/json\" }, body: JSON.stringify({ receiverId: memberId, content: msg }) });\n      setShowShareModal(false);\n      alert(\"Post enviado!\");\n    } catch(e) { alert(\"Erro\"); }\n  };"
if old in content:
    content = content.replace(old, new_code)
    print("OK")
else:
    print("Nao encontrado")
open("frontend/src/pages/MuralGrid.jsx", "wb").write(content.encode("utf-8"))
print("Feito!")
