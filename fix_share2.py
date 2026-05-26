content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
old = "onClick={() => { const url = window.location.origin + \"/mural?post=\" + post.id; if (navigator.share) { navigator.share({ title: \"Sigo com Fe\", text: post.content, url }); } else { navigator.clipboard.writeText(url); alert(\"Link copiado!\"); } }}"
new_code = "onClick={() => { setShowShareModal(true); loadShareMembers(); }}"
if old in content:
    content = content.replace(old, new_code)
    print("Botao OK")
else:
    print("Botao nao encontrado - procurando...")
    idx = content.find("navigator.share")
    if idx >= 0:
        print("Encontrado em:", idx)
open("frontend/src/pages/MuralGrid.jsx", "wb").write(content.encode("utf-8"))
print("Feito!")