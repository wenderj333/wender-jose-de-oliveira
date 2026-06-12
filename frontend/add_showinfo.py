with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    '  const [amens, setAmens] = useState(0);',
    '  const [amens, setAmens] = useState(0);\n  const [showInfo, setShowInfo] = useState(false);'
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('OK: ' + str(c.count('showInfo')))
