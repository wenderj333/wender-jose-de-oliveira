code = open(r'..\backend\src\routes\auth.js', encoding='utf-8', errors='ignore').read()
code = code.replace("""    if (!avatar_url) {
      return res.status(400).json({ error: 'Foto de perfil é obrigatória para se registrar' });
    }""", "")
open(r'..\backend\src\routes\auth.js', 'w', encoding='utf-8').write(code)
print('Feito!')
