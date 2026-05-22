f = open("frontend/src/pages/LiveCommunity.jsx", "rb")
c = f.read().decode("utf-8")
f.close()

# Corrigir render da mensagem
old1 = "<span>{msg.message}</span>"
new1 = "<span>{msg.text || msg.message}</span>"
if old1 in c:
    c = c.replace(old1, new1)
    print("Render OK!")
else:
    print("Render NAO ENCONTRADO")

# Corrigir envio - message para text
old2 = "      message: messageInput,"
new2 = "      text: messageInput,"
if old2 in c:
    c = c.replace(old2, new2)
    print("Send OK!")
else:
    print("Send NAO ENCONTRADO")

open("frontend/src/pages/LiveCommunity.jsx", "wb").write(c.encode("utf-8"))
print("Feito!")
