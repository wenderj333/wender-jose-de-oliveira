f = open('frontend/src/App.jsx', 'rb')
content = f.read().decode('utf-8')
f.close()
content = content.replace('saA\xbade', 'sau\u0301de')
content = content.replace('saA\xbade', 'sa\xfade')
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'Ana Costa' in line and 'pede' in line:
        lines[i] = line.replace('saAude', 'saude').replace('saude', 'saude')
        print('Linha', i, ':', lines[i][:80])
result = '\n'.join(lines)
open('frontend/src/App.jsx', 'wb').write(result.encode('utf-8'))
print('Feito!')
