with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/routes/profile.js", "r", encoding="utf-8") as f:
    c = f.read()
# Encontrar linha com SELECT
for i, line in enumerate(c.split('\n')):
    if 'SELECT' in line:
        print(str(i) + ': ' + line[:150])
