f = open("frontend/src/pages/LiveCommunity.jsx", "rb")
c = f.read().decode("utf-8")
f.close()

old = "    const handleMessage = (data) => {\r\n      setChatMessages(prev => [...prev, data].slice(-100)); // \u00fastimas 100\r\n    };"

new = "    const handleMessage = (data) => {\r\n      setChatMessages(prev => {\r\n        const exists = prev.some(m => m.id && m.id === data.id);\r\n        if (exists) return prev;\r\n        return [...prev, data].slice(-100);\r\n      });\r\n    };"

if old in c:
    c = c.replace(old, new)
    print("OK!")
else:
    print("NAO ENCONTRADO")
    idx = c.find("handleMessage")
    print(repr(c[idx:idx+150]))

open("frontend/src/pages/LiveCommunity.jsx", "wb").write(c.encode("utf-8"))
print("Feito!")
