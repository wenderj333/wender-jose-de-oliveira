with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

for line in content.split('\n'):
    if 'amen' in line.lower() or 'ðŸ' in line or '\xf0' in line:
        print(repr(line.strip()[:100]))
