#!/usr/bin/env python3
import json
import os

# New translations for PastorChat intro view
new_translations = {
    "pt": {
        "introTitle": "🕊️ Um Pastor Está Pronto Para Ouvir Você",
        "introDesc": "Às vezes a vida nos traz fardos pesados demais para carregar sozinhos. Aqui você pode conversar de forma confidencial com um pastor que vai te ouvir, aconselhar com sabedoria bíblica e orar por você.",
        "introVerse1": "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei. — Mateus 11:28",
        "introFeatures": "💜 Conversa confidencial e segura<br />🌍 Tradução automática em 15 idiomas<br />🙏 Pastores voluntários de todo o mundo",
        "introVerse2": "Onde não há conselho, os projetos saem vãos; mas com a multidão de conselheiros se confirmarão. — Provérbios 15:22",
        "startBtn": "Iniciar Conversa"
    },
    "en": {
        "introTitle": "🕊️ A Pastor Is Ready to Listen to You",
        "introDesc": "Sometimes life brings burdens too heavy to carry alone. Here you can have a confidential conversation with a pastor who will listen to you, advise you with biblical wisdom, and pray for you.",
        "introVerse1": "Come to me, all you who are weary and burdened, and I will give you rest. — Matthew 11:28",
        "introFeatures": "💜 Confidential and secure conversation<br />🌍 Automatic translation in 15 languages<br />🙏 Volunteer pastors from around the world",
        "introVerse2": "Plans fail for lack of counsel, but with many advisers they succeed. — Proverbs 15:22",
        "startBtn": "Start Conversation"
    },
    "es": {
        "introTitle": "🕊️ Un Pastor Está Listo Para Escucharte",
        "introDesc": "A veces la vida nos trae cargas demasiado pesadas para llevar solos. Aquí puedes conversar de forma confidencial con un pastor que te escuchará, te aconsejaré con sabiduría bíblica y oraré por ti.",
        "introVerse1": "Vengan a mí, todos ustedes que están cansados y agobiados, y yo les daré descanso. — Mateo 11:28",
        "introFeatures": "💜 Conversación confidencial y segura<br />🌍 Traducción automática en 15 idiomas<br />🙏 Pastores voluntarios de todo el mundo",
        "introVerse2": "Sin consejo fracasan los planes; con muchos consejeros tienen éxito. — Proverbios 15:22",
        "startBtn": "Iniciar Conversación"
    },
    "de": {
        "introTitle": "🕊️ Ein Pastor ist bereit, dir zuzuhören",
        "introDesc": "Manchmal bringt das Leben Lasten mit sich, die zu schwer sind, um sie allein zu tragen. Hier kannst du dich vertraulich mit einem Pastor unterhalten, der dir zuhört, dich mit biblischer Weisheit berät und für dich betet.",
        "introVerse1": "Kommt zu mir, alle, die ihr mühselig und beladen seid; ich will euch Ruhe geben. — Matthäus 11:28",
        "introFeatures": "💜 Vertrauliche und sichere Gespräche<br />🌍 Automatische Übersetzung in 15 Sprachen<br />🙏 Freiwillige Pastoren aus aller Welt",
        "introVerse2": "Wo kein Plan ist, scheitert das Vorhaben; wo aber viele Ratgeber sind, gelingt es. — Sprüche 15:22",
        "startBtn": "Gespräch beginnen"
    },
    "fr": {
        "introTitle": "🕊️ Un Pasteur Est Prêt à Vous Écouter",
        "introDesc": "Parfois, la vie nous apporte des fardeaux trop lourds à porter seuls. Ici, vous pouvez converser en toute confidentialité avec un pasteur qui vous écoutera, vous conseillera avec la sagesse biblique et priera pour vous.",
        "introVerse1": "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos. — Matthieu 11:28",
        "introFeatures": "💜 Conversation confidentielle et sécurisée<br />🌍 Traduction automatique en 15 langues<br />🙏 Pasteurs bénévoles du monde entier",
        "introVerse2": "Faute de conseil, les projets échouent; mais avec le concours de nombreux conseillers, ils réussissent. — Proverbes 15:22",
        "startBtn": "Commencer la conversation"
    },
    "ro": {
        "introTitle": "🕊️ Un Preot Este Gata Să Te Asculte",
        "introDesc": "Uneori viața ne aduce poveri prea grele de purtat singuri. Aici poți conversa confidențial cu un preot care te va asculta, te va sfătui cu înțelepciune biblică și va ruga pentru tine.",
        "introVerse1": "Veniți la mine, toți cei obosiți și înmărmuritori, și vă voi odihni. — Matei 11:28",
        "introFeatures": "💜 Conversație confidențială și sigură<br />🌍 Traducere automată în 15 limbi<br />🙏 Preoți voluntari din toată lumea",
        "introVerse2": "Lipsit de sfat, planul eșuează; cu mulți sfetnici, reușește. — Proverbe 15:22",
        "startBtn": "Începeți conversația"
    },
    "ru": {
        "introTitle": "🕊️ Пастор Готов Вас Выслушать",
        "introDesc": "Иногда жизнь приносит бремена, которые слишком тяжелы, чтобы нести их в одиночку. Здесь вы можете поговорить конфиденциально с пастором, который вас выслушает, даст вам совет с библейской мудростью и помолится за вас.",
        "introVerse1": "Придите ко Мне, все утруждённые и обременённые, и Я успокою вас. — Матфея 11:28",
        "introFeatures": "💜 Конфиденциальный и безопасный разговор<br />🌍 Автоматический перевод на 15 языков<br />🙏 Волонтёры-пасторы со всего мира",
        "introVerse2": "Без совета предприятия терпят крах, а при множестве советников они удаются. — Притчи 15:22",
        "startBtn": "Начать разговор"
    }
}

# Old keys to remove
old_keys_to_remove = [
    "introHeading", "introParagraph", "introVerse1", "introFeature1", 
    "introFeature2", "introFeature3", "introVerse2"
]

# Process each language file
for lang, keys_to_add in new_translations.items():
    file_path = f"frontend/src/i18n/{lang}.json"
    
    print(f"Processing {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Remove old keys from pastorChat section
        if 'pastorChat' in data:
            for old_key in old_keys_to_remove:
                data['pastorChat'].pop(old_key, None) # Remove if exists
        else:
            data['pastorChat'] = {}
        
        # Add new keys to pastorChat section
        data['pastorChat'].update(keys_to_add)
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        print(f"[OK] {lang}.json updated successfully")
    
    except Exception as e:
        print(f"[ERROR] {lang}.json: {e}")

print("\nAll files processed!")
