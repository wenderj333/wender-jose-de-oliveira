with open('src/pages/Settings.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar import
content = content.replace(
    'import { useNavigate } from "react-router-dom";',
    'import { useNavigate } from "react-router-dom";\nimport { useTranslation } from "react-i18next";'
)

# Adicionar const { t }
content = content.replace(
    'const navigate = useNavigate();',
    'const navigate = useNavigate();\n  const { t } = useTranslation();'
)

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
