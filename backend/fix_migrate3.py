code = open(r'src\db\migrate.js', encoding='utf-8', errors='ignore').read()

# Remove as duas queries quebradas do quiz_resultados
old1 = """  await pool.query(CREATE TABLE IF NOT EXISTS quiz_resultados (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, pontos INTEGER DEFAULT 0, perguntas_corretas INTEGER DEFAULT 5, perguntas_total INTEGER DEFAULT 5, livro VARCHAR(50) DEFAULT 'Todos', tempo_medio FLOAT DEFAULT 0, criado_em TIMESTAMP DEFAULT NOW())\\));
  console.log('✅ Migração PostgreSQL concluída com sucesso! (20+ tabelas criadas)');
  await pool.query(    CREATE TABLE IF NOT EXISTS quiz_resultados (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      pontos INTEGER DEFAULT 0,
      perguntas_corretas INTEGER DEFAULT 5,
      perguntas_total INTEGER DEFAULT 5,
      livro VARCHAR(50) DEFAULT 'Todos',
      tempo_medio FLOAT DEFAULT 0,
      criado_em TIMESTAMP DEFAULT NOW()
    )
  \\);
  console.log('quiz_resultados OK');"""

new1 = """  await pool.query(\CREATE TABLE IF NOT EXISTS quiz_resultados (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      pontos INTEGER DEFAULT 0,
      perguntas_corretas INTEGER DEFAULT 5,
      perguntas_total INTEGER DEFAULT 5,
      livro VARCHAR(50) DEFAULT 'Todos',
      tempo_medio FLOAT DEFAULT 0,
      criado_em TIMESTAMP DEFAULT NOW()
    )\);
  console.log('quiz_resultados OK');
  console.log('✅ Migração PostgreSQL concluída com sucesso! (20+ tabelas criadas)');"""

if old1 in code:
    code = code.replace(old1, new1)
    open(r'src\db\migrate.js', 'w', encoding='utf-8').write(code)
    print('Feito!')
else:
    print('Nao encontrou - verificar manualmente')
