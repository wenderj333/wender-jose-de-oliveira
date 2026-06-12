with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Remover duplicado
c = c.replace(
    '  const [showInfo, setShowInfo] = useState(false);\n  const [friendStatus, setFriendStatus] = useState(null);\n  const [showInfo, setShowInfo] = useState(false);',
    '  const [showInfo, setShowInfo] = useState(false);\n  const [friendStatus, setFriendStatus] = useState(null);'
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('OK!')
