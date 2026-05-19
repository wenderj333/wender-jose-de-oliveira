f = open("frontend/src/pages/Chat.jsx", "rb")
c = f.read().decode("utf-8")
f.close()

old = "setMessages(data.messages || []);\r\n        setFriendStatus(data.friendshipStatus || " + chr(39) + "none" + chr(39) + ");"
new = "const prev = messages.length;\r\n        const newMsgs = data.messages || [];\r\n        if (prev > 0 && newMsgs.length > prev && newMsgs[newMsgs.length-1]?.sender_id !== user?.id) { playMessageSound(); }\r\n        setMessages(newMsgs);\r\n        setFriendStatus(data.friendshipStatus || " + chr(39) + "none" + chr(39) + ");"

if old in c:
    c = c.replace(old, new)
    print("Trigger OK")
else:
    print("NAO ENCONTRADO")
    idx = c.find("setMessages(data.messages")
    print(repr(c[idx:idx+100]))

open("frontend/src/pages/Chat.jsx", "wb").write(c.encode("utf-8"))
print("Feito!")
