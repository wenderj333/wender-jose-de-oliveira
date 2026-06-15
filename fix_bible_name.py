with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Mudar nome no menu
content = content.replace("t('nav.bible_ai', 'IA Biblica')", "t('nav.bible_study', 'Biblia')")
content = content.replace('t("nav.bible_ai", "IA Biblica")', 't("nav.bible_study", "Biblia")')
content = content.replace("'IA Biblica'", "'Biblia'")
content = content.replace('"IA Biblica"', '"Biblia"')
content = content.replace("'IA Bíblica'", "'Bíblia'")
content = content.replace('"IA Bíblica"', '"Bíblia"')

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Nome mudado: OK')
