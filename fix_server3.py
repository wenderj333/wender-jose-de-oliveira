with open("backend/src/server.js", "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace(
    "app.use('/api/photos', require('./routes/photos'));",
    "app.use('/api/photos', require('./routes/photos'));\napp.use('/api/photos', require('./routes/photo_comments'));"
)
with open("backend/src/server.js", "w", encoding="utf-8") as f:
    f.write(c)
print("Feito!")
