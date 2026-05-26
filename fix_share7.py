content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
old = "if (navigator.share) navigator.share({ title: 'Sigo com Fe', text: post.content, url }); else navigator.clipboard.writeText(url);"
new_code = "setShowShareModal(true); loadShareMembers();"
count = content.count(old)
print("Encontrado:", count, "vezes")
content = content.replace(old, new_code)
open("frontend/src/pages/MuralGrid.jsx", "wb").write(content.encode("utf-8"))
print("Feito!")