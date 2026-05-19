f = open("frontend/src/App.jsx", "rb")
c = f.read().decode("utf-8")
f.close()

old = "top:-4, right:-4, background:" + chr(39) + "#e11d48" + chr(39) + ", color:" + chr(39) + "white" + chr(39) + ", borderRadius:" + chr(39) + "50%" + chr(39) + ", width:16, height:16, fontSize:10, fontWeight:700, display:" + chr(39) + "flex" + chr(39) + ", alignItems:" + chr(39) + "center" + chr(39) + ", justifyContent:" + chr(39) + "center" + chr(39)
new = "top:-6, right:-6, background:" + chr(39) + "#e11d48" + chr(39) + ", color:" + chr(39) + "white" + chr(39) + ", borderRadius:" + chr(39) + "50%" + chr(39) + ", minWidth:16, height:16, fontSize:9, fontWeight:700, display:" + chr(39) + "flex" + chr(39) + ", alignItems:" + chr(39) + "center" + chr(39) + ", justifyContent:" + chr(39) + "center" + chr(39) + ", padding:" + chr(39) + "0 3px" + chr(39) + ", boxShadow:" + chr(39) + "0 0 0 2px white" + chr(39)

if old in c:
    c = c.replace(old, new)
    print("OK!")
else:
    print("NAO ENCONTRADO")
    idx = c.find("top:-4")
    print(repr(c[idx:idx+100]))

open("frontend/src/App.jsx", "wb").write(c.encode("utf-8"))
print("Feito!")
