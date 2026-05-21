code = open(r'src\db\migrate.js', encoding='utf-8', errors='ignore').read()
old = 'await pool.query(CREATE TABLE IF NOT EXISTS quiz_resultados'
new = 'await pool.query(CREATE TABLE IF NOT EXISTS quiz_resultados'
code = code.replace(old, new)
old2 = "criado_em TIMESTAMP DEFAULT NOW()));"
new2 = "criado_em TIMESTAMP DEFAULT NOW())\));"
code = code.replace(old2, new2)
open(r'src\db\migrate.js', 'w', encoding='utf-8').write(code)
print('Feito!')
