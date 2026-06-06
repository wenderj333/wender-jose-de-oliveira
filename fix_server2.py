with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/server.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "app.use('/api/feed', require('./routes/feed'));",
    "app.use('/api/feed', require('./routes/feed'));\napp.use('/api/photos', require('./routes/photos'));"
)

with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/server.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
