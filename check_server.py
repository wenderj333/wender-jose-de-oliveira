with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/server.js", "r", encoding="utf-8") as f:
    content = f.read()

# Ver as primeiras linhas de require
for line in content.split("\n")[:30]:
    if "require" in line and "routes" in line:
        print(repr(line))
