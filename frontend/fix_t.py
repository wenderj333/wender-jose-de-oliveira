with open('src/pages/Settings.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar import no topo
content = 'import { useTranslation } from "react-i18next";\n' + content

# Adicionar const { t } depois do export default function Settings() {
content = content.replace(
    'export default function Settings() {\n  const [form',
    'export default function Settings() {\n  const { t } = useTranslation();\n  const [form'
)

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
