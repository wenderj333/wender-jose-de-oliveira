content = open("frontend/src/pages/Chat.jsx", "rb").read().decode("utf-8")
old = "friendStatus !== 'loading' && friendStatus !== 'accepted'"
new = "false"
if old in content:
    content = content.replace(old, new)
    open("frontend/src/pages/Chat.jsx", "wb").write(content.encode("utf-8"))
    print("Feito!")
else:
    print("Nao encontrado - procurando...")
    idx = content.find("friendStatus !== ")
    if idx >= 0:
        print("Contexto:", repr(content[idx:idx+80]))
