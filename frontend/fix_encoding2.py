import json, os
langs = ['pt','en','es','de','fr','ro','ru']
for lang in langs:
    fname = f'src/i18n/{lang}.json'
    with open(fname, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK: {lang}')
