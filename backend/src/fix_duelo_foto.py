with open(r"C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\server.js", "r", encoding="utf-8") as f:
    c = f.read()

old = "socket.emit('inicioJogo', {salaId:sid, oponente:op.nome, pergunta:p1[0]});\n      op.socket.emit('inicioJogo', {salaId:sid, oponente:nome, pergunta:p2[0]});"
new = "socket.emit('inicioJogo', {salaId:sid, oponente:op.nome, fotoOponente:op.foto||null, pergunta:p1[0]});\n      op.socket.emit('inicioJogo', {salaId:sid, oponente:nome, fotoOponente:foto||null, pergunta:p2[0]});"

if old in c:
    c = c.replace(old, new)
    print("OK: foto do oponente adicionada ao inicioJogo")
else:
    print("ERRO: texto nao encontrado")

with open(r"C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\server.js", "w", encoding="utf-8") as f:
    f.write(c)