import os, json

folders = ['src/i18n', 'src/i18n_backup_20260602']
for folder in folders:
    if not os.path.exists(folder):
        continue
    for fname in os.listdir(folder):
        if not fname.endswith('.json'):
            continue
        fpath = folder + '/' + fname
        try:
            with open(fpath, 'rb') as f:
                raw = f.read()
            # Detectar se tem BOM ou encoding errado
            if raw.startswith(b'\xef\xbb\xbf'):
                raw = raw[3:]  # Remove BOM
            text = raw.decode('utf-8')
            data = json.loads(text)
            with open(fpath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print('OK: ' + fpath)
        except Exception as e:
            print('ERRO: ' + fpath + ' - ' + str(e))
