with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Adicionar estado showInfo
c = c.replace(
    '  const [friendStatus, setFriendStatus] = useState(null);',
    '  const [friendStatus, setFriendStatus] = useState(null);\n  const [showInfo, setShowInfo] = useState(false);'
)

# Corrigir botao Ver Perfil
c = c.replace(
    '"Ver Perfil"',
    'showInfo ? "Fechar Info" : "Ver Perfil"'
)
c = c.replace(
    'style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: "4px", padding: "5px 9px", fontSize: "13px", cursor: "pointer" }}>',
    'style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: "4px", padding: "5px 9px", fontSize: "13px", cursor: "pointer" }} onClick={() => setShowInfo(!showInfo)}>'
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('OK: ' + str(c.count('showInfo')))
