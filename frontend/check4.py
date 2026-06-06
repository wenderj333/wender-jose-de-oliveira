with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

for line in content.split('\n'):
    if 'sidebar.verse' in line:
        idx = line.find('>') 
        snippet = line[idx+1:idx+20]
        print(repr(snippet))
        for ch in snippet:
            print(hex(ord(ch)), ch)
