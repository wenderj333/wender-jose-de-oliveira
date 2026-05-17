code = open(r'src\db\migrate.js', encoding='utf-8', errors='ignore').read()
idx = code.find('await pool.query(CREATE TABLE IF NOT EXISTS quiz_resultados')
print('Encontrado:', idx)
