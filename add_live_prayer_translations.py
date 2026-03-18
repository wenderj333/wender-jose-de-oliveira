#!/usr/bin/env python3
import json
import os

# New translations for LivePrayer component
translations = {
    "pt": {
        "whatIsLivePrayer": "🙏 O que é a Oração ao Vivo?",
        "description": "Aqui você pode participar de momentos de oração em tempo real com pastores de diversas igrejas. Quando um pastor inicia uma sessão de oração, você pode acompanhar, orar junto e sentir a presença de Deus com irmãos de todo o mundo.",
        "verse": "Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles. - Mateus 18:20", # Changed '—' to '-'
        "statusLive": "🟢 Em Vivo"
    },
    "en": {
        "whatIsLivePrayer": "🙏 What is Live Prayer?",
        "description": "Here you can participate in real-time prayer moments with pastors from different churches. When a pastor starts a prayer session, you can follow along, pray together, and feel God's presence with brothers and sisters from around the world.",
        "verse": "For where two or three gather in my name, there am I with them. - Matthew 18:20", # Changed '—' to '-'
        "statusLive": "🟢 Live"
    },
    "es": {
        "whatIsLivePrayer": "🙏 ¿Qué es la Oración en Vivo?",
        "description": "Aquí puedes participar en momentos de oración en tiempo real con pastores de diversas iglesias. Cuando un pastor inicia una sesión de oración, puedes seguir, orar juntos y sentir la presencia de Dios con hermanos de todo el mundo.",
        "verse": "Porque donde están dos o tres congregados en mi nombre, allí estoy yo en medio de ellos. - Mateo 18:20", # Changed '—' to '-'
        "statusLive": "🟢 En Vivo"
    },
    "de": {
        "whatIsLivePrayer": "🙏 Was ist Live-Gebet?",
        "description": "Hier kannst du in Echtzeit an Gebetsmomenten mit Pastoren verschiedener Gemeinden teilnehmen. Wenn ein Pastor eine Gebetssitzung beginnt, kannst du mitbeten und die Gegenwart Gottes mit Geschwistern aus aller Welt spüren.",
        "verse": "Denn wo zwei oder drei in meinem Namen versammelt sind, da bin ich mitten unter ihnen. - Matthäus 18:20", # Changed '—' to '-'
        "statusLive": "🟢 Live"
    },
    "fr": {
        "whatIsLivePrayer": "🙏 Qu'est-ce que la Prière en Direct ?",
        "description": "Ici, vous pouvez participer à des moments de prière en temps réel avec des pasteurs de différentes églises. Lorsqu'un pasteur commence une séance de prière, vous pouvez suivre, prier ensemble et ressentir la présence de Dieu avec des frères et sœurs du monde entier.",
        "verse": "Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux. - Matthieu 18:20", # Changed '—' to '-'
        "statusLive": "🟢 En Direct"
    },
    "ro": {
        "whatIsLivePrayer": "🙏 Ce este Rugăciunea în Direct?",
        "description": "Aici poți participa la momente de rugăciune în timp real cu pastori din diverse biserici. Când un pastor începe o sesiune de rugăciune, poți urmări, te poți ruga împreună și simți prezența lui Dumnezeu cu frați din întreaga lume.",
        "verse": "Căci unde sunt doi sau trei adunați în Numele Meu, acolo sunt și Eu în mijlocul lor. - Matei 18:20", # Changed '—' to '-'
        "statusLive": "🟢 În Direct"
    },
    "ru": {
        "whatIsLivePrayer": "🙏 Что такое Молитва в Прямом Эфире?",
        "description": "Здесь вы можете участвовать в моментах молитвы в реальном времени с пасторами из разных церквей. Когда пастор начинает молитвенную сессию, вы можете присоединиться, молиться вместе и ощущать присутствие Бога с братьями и сёстрами со всего мира.",
        "verse": "Ибо, где двое или трое собраны во имя Мое, там Я посреди них. - Матфея 18:20", # Changed '—' to '-'
        "statusLive": "🟢 В прямом эфире"
    }
}

base_path = "frontend/src/i18n/"
lang_files = [f for f in os.listdir(base_path) if f.endswith(".json")]

print("Updating LivePrayer translations in all language files...")

for filename in lang_files:
    file_path = os.path.join(base_path, filename)
    print(f"Processing {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'livePrayer' not in data:
            data['livePrayer'] = {}
        
        # Add new keys to livePrayer section
        data['livePrayer'].update(translations[filename[:2]])
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        print(f"[OK] {filename} updated successfully")
    
    except Exception as e:
        print(f"[ERROR] Unknown error with {filename}: {e}")

print("\nAll language files processed!")
