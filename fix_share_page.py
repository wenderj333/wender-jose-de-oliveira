with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\music.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Melhorar a pagina de partilha com botao para entrar na app
old_body = """<body>
  <p>A redirecionar para <a href="${url}">Sigo com Fe</a>...</p>
</body>"""

new_body = """<body style="margin:0;font-family:sans-serif;background:#1a1a2e;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;padding:30px;max-width:400px;">
    <img src="${cover}" style="width:200px;height:200px;border-radius:16px;object-fit:cover;margin-bottom:20px;" />
    <h2 style="color:#fff;margin:0 0 6px;">${title}</h2>
    <p style="color:#aaa;margin:0 0 24px;">Sigo com Fe - Rede Social Crista</p>
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#4a80d4,#764ba2);color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;font-size:16px;">
      🎵 Ouvir Musica
    </a>
    <p style="color:#666;font-size:12px;margin-top:20px;">Junta-te a nos em sigo-com-fe.vercel.app</p>
  </div>
</body>"""

content = content.replace(old_body, new_body)

# Mudar redirect para ir para a musica
old_refresh = """<meta http-equiv="refresh" content="0;url=${url}" />"""
new_refresh = """<!-- sem redirect automatico - usuario escolhe -->"""
content = content.replace(old_refresh, new_refresh)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\music.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Pagina share melhorada: OK')
