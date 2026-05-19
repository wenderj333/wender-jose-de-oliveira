f = open("frontend/src/pages/Chat.jsx", "rb")
c = f.read().decode("utf-8")
f.close()

sound = "\r\nfunction playMessageSound() {\r\n  try {\r\n    const ctx = new (window.AudioContext || window.webkitAudioContext)();\r\n    const o = ctx.createOscillator(); const g = ctx.createGain();\r\n    o.connect(g); g.connect(ctx.destination);\r\n    o.frequency.setValueAtTime(880, ctx.currentTime);\r\n    o.frequency.setValueAtTime(660, ctx.currentTime + 0.1);\r\n    g.gain.setValueAtTime(0.3, ctx.currentTime);\r\n    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);\r\n    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);\r\n  } catch(e) {}\r\n}"

old1 = "const API = import.meta.env.VITE_API_URL || " + chr(39) + chr(39) + ";"
if old1 in c:
    c = c.replace(old1, old1 + sound)
    print("Sound fn OK")
else:
    print("NAO ENCONTRADO 1")

open("frontend/src/pages/Chat.jsx", "wb").write(c.encode("utf-8"))
print("Feito!")
