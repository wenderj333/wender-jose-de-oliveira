with open('src/pages/Settings.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remover import duplicado
content = content.replace(
    'import { useTranslation } from "react-i18next";\nimport { useTranslation } from "react-i18next";',
    'import { useTranslation } from "react-i18next";'
)

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
