#!/usr/bin/env python3
import json

# Read de.json
with open('frontend/src/i18n/de.json', 'r', encoding='utf-8') as f:
    de = json.load(f)

# Add/ensure critical mural keys
if 'mural' not in de:
    de['mural'] = {}

critical_keys = {
    'title': 'Gemeinde-Pinnwand',
    'subtitle': 'Teile Zeugnisse, Lobpreis und Bibelverse mit der christlichen Gemeinschaft',
    'newPost': 'Neuer Beitrag',
    'cancel': 'Abbrechen',
    'messagePlaceholder': 'Schreibe dein Zeugnis, deine Reflexion oder einen Bibelvers...'
}

for key, val in critical_keys.items():
    if key not in de['mural']:
        de['mural'][key] = val
        pass

# Write back
with open('frontend/src/i18n/de.json', 'w', encoding='utf-8') as f:
    json.dump(de, f, ensure_ascii=False, indent=4)

print("Done - de.json fixed!")
