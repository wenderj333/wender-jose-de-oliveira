with open("backend/src/routes/profile.js", "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace(", church_role, ministry FROM users WHERE id", ", ministry FROM users WHERE id")
c = c.replace(", church_role=, favorite_verse=, testimony=, avatar_url=, cover_url=, updated_at=NOW() WHERE id=",
              ", favorite_verse=, testimony=, avatar_url=, cover_url=, updated_at=NOW() WHERE id=")
c = c.replace("[full_name, bio, city, country, profession, marital_status, church_name, denomination, christian_years, church_role, favorite_verse, testimony, avatar_url, cover_url, userId]",
              "[full_name, bio, city, country, profession, marital_status, church_name, denomination, christian_years, favorite_verse, testimony, avatar_url, cover_url, userId]")

with open("backend/src/routes/profile.js", "w", encoding="utf-8") as f:
    f.write(c)
print("OK!")
