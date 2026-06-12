with open("backend/src/routes/profile.js", "r", encoding="utf-8") as f:
    c = f.read()
for i, line in enumerate(c.split('\n')):
    if 'UPDATE' in line or 'full_name' in line:
        print(str(i) + ': ' + line[:200])
