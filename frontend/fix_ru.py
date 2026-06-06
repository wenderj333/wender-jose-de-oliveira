with open('src/components/LanguageSwitcher.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('Ð ÑƒÑÑÐºÐ¸Ð¹', 'Русский')

with open('src/components/LanguageSwitcher.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
