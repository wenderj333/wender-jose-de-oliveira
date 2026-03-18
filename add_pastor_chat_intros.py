#!/usr/bin/env python3
import json
import os

# Translations for PastorChat intro view
translations = {
    "pt": {
        "introHeading": "🕊️ Um Pastor Está Pronto Para Ouvir Você",
        "introParagraph": "Às vezes a vida nos traz fardos pesados demais para carregar sozinhos. Aqui você pode conversar de forma confidencial com um pastor que vai te ouvir, aconselhar com sabedoria bíblica e orar por você.",
        "introVerse1": "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei. — Mateus 11:28",
        "introFeature1": "💜 Conversa confidencial e segura",
        "introFeature2": "🌍 Tradução automática em 15 idiomas",
        "introFeature3": "🙏 Pastores voluntários de todo o mundo",
        "introVerse2": "Onde não há conselho, os projetos saem vãos; mas com a multidão de conselheiros se confirmarão. — Provérbios 15:22"
    },
    "en": {
        "introHeading": "🕊️ A Pastor Is Ready to Listen to You",
        "introParagraph": "Sometimes life brings burdens too heavy to carry alone. Here you can have a confidential conversation with a pastor who will listen to you, advise you with biblical wisdom, and pray for you.",
        "introVerse1": "Come to me, all you who are weary and burdened, and I will give you rest. — Matthew 11:28",
        "introFeature1": "💜 Confidential and secure conversation",
        "introFeature2": "🌍 Automatic translation in 15 languages",
        "introFeature3": "🙏 Volunteer pastors from around the world",
        "introVerse2": "Plans fail for lack of counsel, but with many advisers they succeed. — Proverbs 15:22"
    },
    "es": {
        "introHeading": "🕊️ Un Pastor Está Listo Para Escucharte",
        "introParagraph": "A veces la vida nos trae cargas demasiado pesadas para llevar solos. Aquí puedes conversar de forma confidencial con un pastor que te escuchará, te aconsejaré con sabiduría bíblica y oraré por ti.",
        "introVerse1": "Vengan a mí, todos ustedes que están cansados y agobiados, y yo les daré descanso. — Mateo 11:28",
        "introFeature1": "💜 Conversación confidencial y segura",
        "introFeature2": "🌍 Traducción automática en 15 idiomas",
        "introFeature3": "🙏 Pastores voluntarios de todo el mundo",
        "introVerse2": "Sin consejo fracasan los planes; con muchos consejeros tienen éxito. — Proverbios 15:22"
    },
    "de": {
        "introHeading": "🕊️ Ein Pastor ist bereit, dir zuzuhören",
        "introParagraph": "Manchmal bringt das Leben Lasten mit sich, die zu schwer sind, um sie allein zu tragen. Hier kannst du dich vertraulich mit einem Pastor unterhalten, der dir zuhört, dich mit biblischer Weisheit berät und für dich betet.",
        "introVerse1": "Kommt zu mir, alle, die ihr mühselig und beladen seid; ich will euch Ruhe geben. — Matthäus 11:28",
        "introFeature1": "💜 Vertrauliche und sichere Gespräche",
        "introFeature2": "🌍 Automatische Übersetzung in 15 Sprachen",
        "introFeature3": "🙏 Freiwillige Pastoren aus aller Welt",
        "introVerse2": "Wo kein Plan ist, scheitert das Vorhaben; wo aber viele Ratgeber sind, gelingt es. — Sprüche 15:22"
    },
    "fr": {
        "introHeading": "🕊️ Un Pasteur Est Prêt à Vous Écouter",
        "introParagraph": "Parfois, la vie nous apporte des fardeaux trop lourds à porter seuls. Ici, vous pouvez converser en toute confidentialité avec un pasteur qui vous écoutera, vous conseillera avec la sagesse biblique et priera pour vous.",
        "introVerse1": "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos. — Matthieu 11:28",
        "introFeature1": "💜 Conversation confidentielle et sécurisée",
        "introFeature2": "🌍 Traduction automatique en 15 langues",
        "introFeature3": "🙏 Pasteurs bénévoles du monde entier",
        "introVerse2": "Faute de conseil, les projets échouent; mais avec le concours de nombreux conseillers, ils réussissent. — Proverbes 15:22"
    },
    "ro": {
        "introHeading": "🕊️ Un Preot Este Gata Să Te Asculte",
        "introParagraph": "Uneori viața ne aduce poveri prea grele de purtat singuri. Aici poți conversa confidențial cu un preot care te va asculta, te va sfătui cu înțelepciune biblică și va ruga pentru tine.",
        "introVerse1": "Veniți la mine, toți cei obosiți și înmărmuritori, și vă voi odihni. — Matei 11:28",
        "introFeature1": "💜 Conversație confidențială și sigură",
        "introFeature2": "🌍 Traducere automată în 15 limbi",
        "introFeature3": "🙏 Preoți voluntari din toată lumea",
        "introVerse2": "Lipsit de sfat, planul eșuează; cu mulți sfetnici, reușește. — Proverbe 15:22"
    },
    "ru": {
        "introHeading": "🕊️ Пастор Готов Вас Выслушать",
        "introParagraph": "Иногда жизнь приносит бремена, которые слишком тяжелы, чтобы нести их в одиночку. Здесь вы можете поговорить конфиденциально с пастором, который вас выслушает, даст вам совет с библейской мудростью и помолится за вас.",
        "introVerse1": "Придите ко Мне, все утруждённые и обременённые, и Я успокою вас. — Матфея 11:28",
        "introFeature1": "💜 Конфиденциальный и безопасный разговор",
        "introFeature2": "🌍 Автоматический перевод на 15 языков",
        "introFeature3": "🙏 Волонтёры-пасторы со всего мира",
        "introVerse2": "Без совета предприятия терпят крах, а при множестве советников они удаются. — Притчи 15:22"
    }
}

# Process each language file
for lang, new_keys in translations.items():
    file_path = f"frontend/src/i18n/{lang}.json"
    
    print(f"Processing {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Add new keys to pastorChat section
        if 'pastorChat' not in data:
            data['pastorChat'] = {}
        
        data['pastorChat'].update(new_keys)
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        print(f"[OK] {lang}.json updated successfully")
    
    except Exception as e:
        print(f"[ERROR] {lang}.json: {e}")

print("\nAll files processed!")
