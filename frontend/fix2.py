import re

with open('src/App.jsx', 'rb') as f:
    raw = f.read()

# Decodifica como latin-1 para ver os bytes reais
text = raw.decode('utf-8', errors='replace')

replacements = [
    ('Ã°Å¸â€Â´', '📺'),
    ('Ã°Å¸â€¢ÅÃ¯Â¸Â', '✝️'),
    ('Ã°Å¸â€¢Å Ã¯Â¸Â', '✝️'),
    ('VOCÃƒÅ\u00a0', 'VOCÊ'),
    ('VOCÃƒÅ ', 'VOCÊ'),
    ('Ã°Å¸â€œâ€"', '📖'),
    ('ðŸ"¸', '📸'),
    ('Ã‚Â·', '·'),
    ('Ã¢â‚¬â€', '-'),
]

for old, new in replacements:
    if old in text:
        print(f'Encontrado e corrigido: {old[:10]}...')
        text = text.replace(old, new)
    else:
        print(f'NAO encontrado: {old[:10]}...')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Concluido!')
