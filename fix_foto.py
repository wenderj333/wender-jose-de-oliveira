content = open("frontend/src/App.jsx", "rb").read().decode("utf-8")
content = content.replace("href={/perfil/}", "href={`/perfil/${user.id}`}")
open("frontend/src/App.jsx", "wb").write(content.encode("utf-8"))
print("Feito!")
