#!/usr/bin/env python3
import json

with open('frontend/src/i18n/de.json', 'r', encoding='utf-8') as f:
    de = json.load(f)

# Ensure mural exists
if 'mural' not in de:
    de['mural'] = {}

# Add critical missing sections
de['mural']['categories'] = {
    'testemunho': 'Zeugnis',
    'louvor': 'Lobpreis / Video',
    'reflexao': 'Biblische Reflexion',
    'versiculo': 'Bibelvers',
    'foto': 'Foto'
}

de['mural']['filters'] = {
    'all': 'Alle',
    'myChurch': 'Meine Kirche',
    'testimonies': 'Zeugnisse',
    'worship': 'Lobpreis',
    'verses': 'Bibelverse'
}

# Add category labels at top level (for buttons)
if 'categoryLabels' not in de:
    de['categoryLabels'] = {
        'photo': 'Foto',
        'video': 'Video',
        'music': 'Musik'
    }

with open('frontend/src/i18n/de.json', 'w', encoding='utf-8') as f:
    json.dump(de, f, ensure_ascii=False, indent=4)

print("Added missing mural sections to de.json")
