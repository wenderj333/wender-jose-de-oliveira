content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
idx = content.find("authorInitials}\r\n        </div>")
if idx >= 0:
    print("Encontrado na posicao:", idx)
    print(repr(content[idx-300:idx+50]))
else:
    idx2 = content.find("{authorInitials}")
    print("authorInitials na posicao:", idx2)
    print(repr(content[idx2-150:idx2+30]))
