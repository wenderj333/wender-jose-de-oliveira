content = open("backend/src/routes/profile.js", "rb").read().decode("utf-8")
old = "SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name FROM users WHERE id = $1"
new = "SELECT id, full_name, email, role, avatar_url, cover_url, bio, church_name, city, country, profession, work, birthdate, marital_status, favorite_verse FROM users WHERE id = $1"
if old in content:
    content = content.replace(old, new)
    open("backend/src/routes/profile.js", "wb").write(content.encode("utf-8"))
    print("Feito!")
else:
    print("Nao encontrado")
