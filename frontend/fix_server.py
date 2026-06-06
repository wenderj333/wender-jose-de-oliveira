with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/server.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "const profileRouter = require('./routes/profile');",
    "const profileRouter = require('./routes/profile');\nconst photosRouter = require('./routes/photos');"
)

content = content.replace(
    "app.use('/api/profile', profileRouter);",
    "app.use('/api/profile', profileRouter);\napp.use('/api/photos', photosRouter);"
)

with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/server.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
