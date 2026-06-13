with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\music.js', 'r', encoding='utf-8') as f:
    content = f.read()

ph = chr(36)

share_route = """
// GET /api/music/share/:id - pagina de partilha com meta tags para redes sociais
router.get('/share/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM music WHERE id = """ + ph + """1', [id]);
    const song = result.rows[0];
    if (!song) return res.status(404).send('Musica nao encontrada');
    const title = song.title + (song.artist ? ' - ' + song.artist : '');
    const cover = song.cover_url || 'https://sigo-com-fe.vercel.app/logo-new.png';
    const url = 'https://sigo-com-fe.vercel.app/musica';
    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} | Sigo com Fe</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="Ouvi esta musica na Sigo com Fe!" />
  <meta property="og:image" content="${cover}" />
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="music.song" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:image" content="${cover}" />
  <meta http-equiv="refresh" content="0;url=${url}" />
</head>
<body>
  <p>A redirecionar para <a href="${url}">Sigo com Fe</a>...</p>
</body>
</html>`);
  } catch (err) {
    res.status(500).send('Erro');
  }
});

"""

# Inserir antes do module.exports
content = content.replace('module.exports = router;', share_route + 'module.exports = router;')

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\music.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Rota share: ' + ('OK' if '/share/:id' in content else 'FALHOU'))
