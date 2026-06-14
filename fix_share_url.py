with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Corrigir share - remover post.content do texto
old_share = """if (navigator.share) navigator.share({ title: 'Sigo com Fe', text: post.content, url }); else navigator.clipboard.writeText(url);"""
new_share = """if (navigator.share) navigator.share({ title: 'Sigo com Fe - Rede Social Crista', url }); else navigator.clipboard.writeText(url);"""

content = content.replace(old_share, new_share)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

count = content.count("Sigo com Fe - Rede Social Crista")
print('Share corrigido: ' + ('OK' if count > 0 else 'FALHOU') + f' ({count} ocorrencias)')
