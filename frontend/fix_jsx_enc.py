import os, re

def fix_file(fpath):
    try:
        with open(fpath, 'rb') as f:
            raw = f.read()
        # Tentar decodificar como latin-1 e depois como utf-8
        try:
            text = raw.decode('utf-8')
            # Verificar se tem double-encoding
            if 'Ã' in text or 'â€' in text:
                fixed = raw.decode('latin-1').encode('raw_unicode_escape').decode('utf-8', errors='replace')
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(fixed)
                print('FIXED: ' + fpath)
            else:
                pass  # Already correct
        except:
            pass
    except Exception as e:
        print('ERRO: ' + fpath + ' - ' + str(e))

for root, dirs, files in os.walk('src'):
    for fname in files:
        if fname.endswith('.jsx') or fname.endswith('.js'):
            fix_file(os.path.join(root, fname))
print('Concluido!')
