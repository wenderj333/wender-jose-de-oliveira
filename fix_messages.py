content = open("backend/src/routes/messages.js", "rb").read().decode("utf-8")
if "if (status !== 'accepted')" in content:
    content = content.replace("if (status !== 'accepted')", "if (false)")
    open("backend/src/routes/messages.js", "wb").write(content.encode("utf-8"))
    print("Feito!")
else:
    print("Nao encontrado")
