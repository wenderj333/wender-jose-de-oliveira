import os

fixes = {
    'FÃ©': 'Fé', 'NotificaÃ§Ãµes': 'Notificações', 'OraÃ§Ãµes': 'Orações',
    'ReflexÃ£o': 'Reflexão', 'ConsagraÃ§Ã£o': 'Consagração', 'grÃ¡tis': 'grátis',
    'JÃ¡': 'Já', 'LiÃ§Ã£o': 'Lição', 'PrÃ¡tico': 'Prático', 'AnotaÃ§Ãµes': 'Anotações',
    'anotaÃ§Ãµes': 'anotações', 'PrÃ³xima': 'Próxima', 'AleatÃ³rio': 'Aleatório',
    'GraÃ§a': 'Graça', 'CristÃ£': 'Cristã', 'vÃ¡lido': 'válido', 'faÃ§a': 'faça',
    'Ã‰': 'É', 'obrigatÃ³rio': 'obrigatório', 'AnÃ³nimo': 'Anónimo',
    'Ã³': 'ó', 'Ã±': 'ñ', 'Ã¡': 'á', 'Ã©': 'é', 'Ã£': 'ã', 'Ã§': 'ç',
    'â€™': "'", 'â†'': '→', 'âœ¨': '✨', 'ðŸŽ¯': '🎯', 'ðŸ"': '📝',
}

fixed_files = []
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if 'backup' not in d]
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            new_content = content
            for bad, good in fixes.items():
                new_content = new_content.replace(bad, good)
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                fixed_files.append(path)

print(f'Corrigidos: {len(fixed_files)} ficheiros')
for f in fixed_files:
    print(f'  - {f}')
