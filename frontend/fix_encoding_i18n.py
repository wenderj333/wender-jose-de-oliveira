import json, re

files = ["pt", "en", "es", "de", "fr", "ro", "ru"]

for lang in files:
    fname = f"src/i18n/{lang}.json"
    try:
        with open(fname, "r", encoding="utf-8") as f:
            raw = f.read()
        # Corrigir double-encoded UTF-8
        fixed = raw.encode("latin-1").decode("utf-8")
        # Validar JSON
        json.loads(fixed)
        with open(fname, "w", encoding="utf-8") as f:
            f.write(fixed)
        print(f"OK: {lang}")
    except Exception as e:
        print(f"ERRO {lang}: {e}")
