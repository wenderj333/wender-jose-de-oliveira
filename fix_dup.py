with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remover duplicados
old = """    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS audio_url TEXT`);
    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS cover_url TEXT`);
    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS music_title TEXT`);
    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS cover_url TEXT`);
    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS music_title TEXT`);"""

new = """    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS audio_url TEXT`);
    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS cover_url TEXT`);
    await mp.query(`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS music_title TEXT`);"""

content = content.replace(old, new)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK: ' + ('duplicados removidos' if content.count('cover_url TEXT') == 1 else 'ainda duplicado'))
