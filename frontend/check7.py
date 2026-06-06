with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

for line in content.split('\n'):
    if 'amenDado' in line and 'button' in line:
        print(repr(line.strip()))
