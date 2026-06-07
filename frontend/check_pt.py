import json
with open('src/i18n/pt.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('mural', {}).get('amen', 'NAO'))
print(data.get('common', {}).get('comment', 'NAO'))
