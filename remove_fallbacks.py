#!/usr/bin/env python3
import re

file_path = 'frontend/src/pages/MuralGrid.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all fallback Portuguese strings from t() calls
# Pattern: t('key.name', 'portuguese text') -> t('key.name')
pattern = r"t\('([^']+)',\s*'[^']*'\)"
replacement = r"t('\1')"

content = re.sub(pattern, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed all Portuguese fallbacks from MuralGrid.jsx!")
