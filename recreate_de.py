#!/usr/bin/env python3
import json
import copy

# Read en.json as template
with open('frontend/src/i18n/en.json', 'r', encoding='utf-8') as f:
    de = copy.deepcopy(json.load(f))

# Translate key sections to German
de['brand'] = 'Sigo com Fe'
de['nav']['mural'] = 'Pinnwand'
de['nav']['prayers'] = 'Gebete'
de['nav']['live'] = 'Live'
de['nav']['bibleAI'] = 'Bibel-KI'
de['home']['title'] = 'Sigo com Fe'

# Mural translations
de['mural'] = {
    'title': 'Gemeinde-Pinnwand',
    'subtitle': 'Teile Zeugnisse, Lobpreis und Bibelverse mit der christlichen Gemeinschaft',
    'newPost': 'Neuer Beitrag',
    'cancel': 'Abbrechen',
    'messagePlaceholder': 'Schreibe dein Zeugnis, deine Reflexion oder einen Bibelvers...',
    'categories': {
        'testemunho': 'Zeugnis',
        'louvor': 'Lobpreis / Video',
        'reflexao': 'Biblische Reflexion',
        'versiculo': 'Bibelvers',
        'foto': 'Foto'
    }
}

# Write new de.json
with open('frontend/src/i18n/de.json', 'w', encoding='utf-8') as f:
    json.dump(de, f, ensure_ascii=False, indent=4)

print("Created new de.json")
