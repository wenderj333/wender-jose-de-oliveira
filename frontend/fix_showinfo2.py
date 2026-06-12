with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remover linha 25 (index 24) que e o duplicado
new_lines = []
showinfo_count = 0
for line in lines:
    if 'const [showInfo, setShowInfo]' in line:
        showinfo_count += 1
        if showinfo_count > 1:
            continue
    new_lines.append(line)

c = ''.join(new_lines)

# Corrigir onClick duplicado no botao Ver Perfil
c = c.replace(
    '}} onClick={() => setShowInfo(!showInfo)}>Ver Perfil</button>',
    '}}>Ver Perfil</button>'
)

with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('OK!')
