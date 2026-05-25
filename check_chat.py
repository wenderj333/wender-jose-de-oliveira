content = open("frontend/src/pages/Chat.jsx", "rb").read().decode("utf-8")
print("Tamanho:", len(content))
# Procurar o texto
idx = content.find("friendStatus")
if idx >= 0:
    print("Encontrado friendStatus na posicao:", idx)
    print("Contexto:", content[idx:idx+100])
else:
    print("Nao encontrado")
