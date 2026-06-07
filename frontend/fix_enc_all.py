import os, json

# Corrigir ficheiros i18n
for lang in ['pt','en','es','de','fr','ro','ru']:
    fname = f'src/i18n/{lang}.json'
    try:
        with open(fname, 'rb') as f:
            raw = f.read()
        # Tentar diferentes encodings
        for enc in ['utf-8-sig', 'utf-8', 'latin-1']:
            try:
                content = raw.decode(enc)
                data = json.loads(content)
                with open(fname, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f'OK: {lang} ({enc})')
                break
            except:
                continue
    except Exception as e:
        print(f'ERRO: {lang} - {e}')
