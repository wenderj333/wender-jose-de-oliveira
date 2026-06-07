with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

replacements = [
    ('BÃ­blico', 'Bíblico'),
    ('CristÃ£o', 'Cristão'),
    ('GrÃ¡tis', 'Grátis'),
    ('BÃ­blia', 'Bíblia'),
    ('FÃ©', 'Fé'),
    ('cristÃ£', 'cristã'),
    ('oraÃ§Ã£o', 'oração'),
    ('reflexÃ£o', 'reflexão'),
    ('consagraÃ§Ã£o', 'consagração'),
    ('cristÃ£os', 'cristãos'),
    ('communautÃ©', 'communauté'),
    ('chrÃ©tienne', 'chrétienne'),
    ('comunitÃ ', 'comunità'),
    ('traduÃ§Ã£o', 'tradução'),
    ('automÃ¡tica', 'automática'),
    ('CristÃ£', 'Cristã'),
    ('estÃ¡', 'está'),
    ('cristÃ£os', 'cristãos'),
    ('cresÃ§a', 'cresça'),
    ('fÃ©', 'fé'),
    ('â€"', '—'),
    ('ðŸ™', '🙏'),
    ('âœï¸', '✝️'),
]

for old, new in replacements:
    c = c.replace(old, new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
