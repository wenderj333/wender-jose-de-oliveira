content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
old = 'const loadShareMembers = async () => { try { const res = await fetch(API + "/members"); const data = await res.json(); setShareMembers(Array.isArray(data) ? data : (data.members || [])); } catch(e) {} };'
new_code = 'const loadShareMembers = async () => { try { const res = await fetch(API + "/members", { headers: token ? { Authorization: "Bearer " + token } : {} }); const data = await res.json(); setShareMembers(Array.isArray(data) ? data : (data.members || [])); } catch(e) {} };'
if old in content:
    content = content.replace(old, new_code)
    print("OK")
else:
    print("Nao encontrado")
open("frontend/src/pages/MuralGrid.jsx", "wb").write(content.encode("utf-8"))
print("Feito!")