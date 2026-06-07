import re

files = ["pt", "en", "es", "de", "fr", "ro", "ru"]

# Mapa de substituicoes dos caracteres corrompidos mais comuns
replacements = [
    ("Ã©", "é"), ("Ã£", "ã"), ("Ã§", "ç"), ("Ã¢", "â"),
    ("Ã³", "ó"), ("Ã²", "ò"), ("Ã¡", "á"), ("Ã ", "à"),
    ("Ã­", "í"), ("Ã¬", "ì"), ("Ãº", "ú"), ("Ã¹", "ù"),
    ("Ã´", "ô"), ("Ãª", "ê"), ("Ã®", "î"), ("Ã»", "û"),
    ("Ã¤", "ä"), ("Ã¶", "ö"), ("Ã¼", "ü"), ("Ã±", "ñ"),
    ("Ã‡", "Ç"), ("Ã‰", "É"), ("Ã€", "À"), ("Ã"", "Ó"),
    ("Ã"", "Ô"), ("Ãš", "Ú"), ("Ã•", "Õ"), ("Ãµ", "õ"),
    ("â€™", "'"), ("â€œ", "\u201c"), ("â€", "\u201d"),
    ("â†'", "→"), ("ðŸ"´", "🔴"), ("ðŸ"¥", "🔥"),
    ("ðŸ™", "🙏"), ("ðŸŽ", "🎵"), ("â€¢", "•"),
]

for lang in files:
    fname = f"src/i18n/{lang}.json"
    try:
        with open(fname, "r", encoding="utf-8") as f:
            content = f.read()
        original = content
        for bad, good in replacements:
            content = content.replace(bad, good)
        changes = sum(1 for b, g in replacements if b in original)
        with open(fname, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"OK: {lang} ({changes} tipos corrigidos)")
    except Exception as e:
        print(f"ERRO {lang}: {e}")
