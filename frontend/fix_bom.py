with open('src/pages/Settings.jsx', 'r', encoding='utf-8-sig') as f:
    content = f.read()

# Remover BOM e reorganizar imports
content = content.replace('\ufeff', '')
content = content.replace(
    'import { useTranslation } from "react-i18next";\nimport React',
    'import React'
)
content = content.replace(
    'import React, { useState, useEffect } from "react";',
    'import React, { useState, useEffect } from "react";\nimport { useTranslation } from "react-i18next";'
)

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Feito!')
