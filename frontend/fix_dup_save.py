with open('src/pages/Settings.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Encontrar e remover o segundo handleSave
first = c.find('const handleSave')
second = c.find('const handleSave', first + 1)
if second != -1:
    end = c.find('};', second) + 2
    c = c[:second] + c[end:]
    print('Removido duplicado!')
else:
    print('Nao encontrado duplicado')

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
