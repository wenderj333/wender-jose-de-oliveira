with open('src/components/LanguageSwitcher.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('ðŸ‡§ðŸ‡·', '🇧🇷')
content = content.replace('PortuguÃªs', 'Português')
content = content.replace('ðŸ‡ªðŸ‡¸', '🇪🇸')
content = content.replace('EspaÃ±ol', 'Español')
content = content.replace('ðŸ‡ºðŸ‡¸', '🇺🇸')
content = content.replace('ðŸ‡©ðŸ‡ª', '🇩🇪')
content = content.replace('ðŸ‡«ðŸ‡·', '🇫🇷')
content = content.replace('FranÃ§ais', 'Français')
content = content.replace('ðŸ‡·ðŸ‡´', '🇷🇴')
content = content.replace('RomÃ¢nÄƒ', 'Română')
content = content.replace('ðŸ‡·ðŸ‡º', '🇷🇺')
content = content.replace('botÃ£o', 'botão')
content = content.replace('padrÃ£o', 'padrão')

with open('src/components/LanguageSwitcher.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
