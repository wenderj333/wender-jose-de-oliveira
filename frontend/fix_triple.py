with open('src/i18n/pt.json', 'r', encoding='utf-8') as f:
    content = f.read()

fixes = [
    ('ÃƒÂ©', 'é'), ('ÃƒÂ£', 'ã'), ('ÃƒÂ§', 'ç'), ('ÃƒÂ¢', 'â'),
    ('ÃƒÂ³', 'ó'), ('ÃƒÂ¡', 'á'), ('ÃƒÂ ', 'à'), ('ÃƒÂ­', 'í'),
    ('ÃƒÂº', 'ú'), ('ÃƒÂ´', 'ô'), ('ÃƒÂª', 'ê'), ('ÃƒÂ®', 'î'),
    ('ÃƒÂ»', 'û'), ('ÃƒÂ¤', 'ä'), ('ÃƒÂ¶', 'ö'), ('ÃƒÂ¼', 'ü'),
    ('ÃƒÂ±', 'ñ'), ('ÃƒÂµ', 'õ'), ('Ãƒo', 'ão'),
]

for bad, good in fixes:
    content = content.replace(bad, good)

with open('src/i18n/pt.json', 'w', encoding='utf-8') as f:
    f.write(content)
print('OK')
