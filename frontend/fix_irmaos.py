with open('src/i18n/pt.json', 'r', encoding='utf-8') as f:
    content = f.read()

fixes = [
    ('sua fe com milhares de irmaos', 'sua fé com milhares de irmãos'),
    ('"irmaos"', '"irmãos"'),
    ('So irmaos', 'Só irmãos'),
    ('Conhecer irmaos em Cristo', 'Conhecer irmãos em Cristo'),
]

for bad, good in fixes:
    content = content.replace(bad, good)

with open('src/i18n/pt.json', 'w', encoding='utf-8') as f:
    f.write(content)
print('OK')
