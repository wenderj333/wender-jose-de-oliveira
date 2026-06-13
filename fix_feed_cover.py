with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\feed.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Adicionar cover_url e music_title nas variaveis
old_vars = """    let audioUrl = req.body.audio_url || null;"""
new_vars = """    let audioUrl = req.body.audio_url || null;
    let coverUrl = req.body.cover_url || null;
    let musicTitle = req.body.music_title || null;"""
content = content.replace(old_vars, new_vars)

# 2. Adicionar ao INSERT principal
old_insert = """      result = await db.prepare(
        `INSERT INTO feed_posts (author_id, content, category, media_url, media_type, verse_reference, visibility, audio_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      ).get(req.user.id, content, cat, mediaUrl, mediaType, verse_reference || null, vis, audioUrl || null);"""

new_insert = """      result = await db.prepare(
        `INSERT INTO feed_posts (author_id, content, category, media_url, media_type, verse_reference, visibility, audio_url, cover_url, music_title)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
      ).get(req.user.id, content, cat, mediaUrl, mediaType, verse_reference || null, vis, audioUrl || null, coverUrl || null, musicTitle || null);"""
content = content.replace(old_insert, new_insert)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\feed.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('cover_url INSERT: ' + ('OK' if 'cover_url, music_title' in content else 'FALHOU'))
