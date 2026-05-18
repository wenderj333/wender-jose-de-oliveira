content = open('frontend/src/App.jsx', 'rb').read()
text = content.decode('utf-8')
replacements = [
    ('Ã°Å¸â€œâ€"', '📖'),
    ('Ã°Å¸â„¢Â', '🙏'),
    ('Ã°Å¸â€¢Å\x00Ã¯Â¸Â', '🙏'),
    ('Ã°Å¸â€œÂ²', '📲'),
    ('pede saÃƒÂºde', 'pede saúde'),
    ('10:00h Ã‚Â·', '10:00h ·'),
]
for old, new in replacements:
    text = text.replace(old, new)
open('frontend/src/App.jsx', 'wb').write(text.encode('utf-8'))
print('Feito!')
