with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/routes/profile.js", "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace(
    "SELECT id, full_name, username, email, role, avatar_url, cover_url, bio, church_name, city, state, country, profession, work, birthdate, marital_status, favorite_verse, testimony, church_denomination, faith_years, church_role, ministry FROM users WHERE id = ",
    "SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, city, state, country, profession, work, birthdate, marital_status, favorite_verse, testimony, church_denomination, faith_years, church_role, ministry FROM users WHERE id = "
)

with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/routes/profile.js", "w", encoding="utf-8") as f:
    f.write(c)
print("Feito!")
