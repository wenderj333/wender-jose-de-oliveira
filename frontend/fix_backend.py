with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/routes/profile.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, city, country, profession, work, birthdate, marital_status, favorite_verse FROM users WHERE id = $1",
    "SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, city, country, profession, work, birthdate, marital_status, favorite_verse, testimony, church_denomination, faith_years FROM users WHERE id = $1"
)

with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/routes/profile.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
