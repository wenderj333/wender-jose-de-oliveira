# Adicionar rota bible ao server.js
with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\server.js', 'r', encoding='utf-8') as f:
    content = f.read()

old = """const musicRoutes = require('./routes/music');"""
new = """const musicRoutes = require('./routes/music');
const bibleRoutes = require('./routes/bible');"""
content = content.replace(old, new)

old2 = """app.use('/api/music', musicRoutes);"""
new2 = """app.use('/api/music', musicRoutes);
app.use('/api/bible', bibleRoutes);"""
content = content.replace(old2, new2)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Bible route: ' + ('OK' if 'bibleRoutes' in content else 'FALHOU'))
