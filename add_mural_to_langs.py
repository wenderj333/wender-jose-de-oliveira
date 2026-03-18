#!/usr/bin/env python3
import json
import os

os.chdir('frontend/src/i18n')

mural_translations = {
    "en": {
        "title": "Community Wall",
        "subtitle": "Share testimonies, praise and Bible verses with the Christian community",
        "newPost": "New Post",
        "cancel": "Cancel",
        "messagePlaceholder": "Write your testimony, reflection or Bible verse..."
    },
    "es": {
        "title": "Muro Comunitario",
        "subtitle": "Comparte testimonios, alabanzas y versículos bíblicos con la comunidad cristiana",
        "newPost": "Nueva Publicación",
        "cancel": "Cancelar",
        "messagePlaceholder": "Escribe tu testimonio, reflexión o versículo bíblico..."
    },
    "fr": {
        "title": "Mur Communautaire",
        "subtitle": "Partagez des témoignages, des louanges et des versets bibliques avec la communauté chrétienne",
        "newPost": "Nouveau Message",
        "cancel": "Annuler",
        "messagePlaceholder": "Écrivez votre témoignage, votre réflexion ou un verset biblique..."
    },
    "ro": {
        "title": "Peretele Comunității",
        "subtitle": "Distribuie mărturii, laudă și versete biblice cu comunitatea creștină",
        "newPost": "Nou Mesaj",
        "cancel": "Anulare",
        "messagePlaceholder": "Scrie-ți mărturia, reflecția sau versatul biblic..."
    },
    "ru": {
        "title": "Стена сообщества",
        "subtitle": "Поделитесь свидетельствами, хвалой и библейскими стихами с христианской общиной",
        "newPost": "Новое сообщение",
        "cancel": "Отмена",
        "messagePlaceholder": "Напишите свое свидетельство, размышление или библейский стих..."
    }
}

for lang, trans in mural_translations.items():
    fname = f"{lang}.json"
    with open(fname, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Ensure mural key exists
    if 'mural' not in data:
        data['mural'] = {}
    
    # Add/update keys (don't overwrite existing)
    for key, val in trans.items():
        if key not in data['mural']:
            data['mural'][key] = val
    
    # Write back
    with open(fname, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print(f'Updated {fname}')

print("Done!")
