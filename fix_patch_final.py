with open("backend/src/routes/profile.js", "r", encoding="utf-8") as f:
    c = f.read()

old_update = "UPDATE users SET full_name=, username=, bio=, city=, state=, country=, profession=, marital_status=, church_name=, church_denomination=, faith_years=, church_role=, f"
# Vamos encontrar e substituir a linha completa do router.patch
import re
patch_old = r"router\.patch\('/', authenticate.*?}\);"
patch_new = """router.patch('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, city, country, profession, marital_status, church_name, denomination, christian_years, favorite_verse, testimony, avatar_url, cover_url } = req.body;
    await db.query(
      UPDATE users SET full_name=, bio=, city=, country=, profession=, marital_status=, church_name=, church_denomination=, faith_years=, favorite_verse=, testimony=, avatar_url=, cover_url=, updated_at=NOW() WHERE id=,
      [full_name, bio, city, country, profession, marital_status, church_name, denomination, christian_years, favorite_verse, testimony, avatar_url, cover_url, userId]
    );
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});"""

c = re.sub(patch_old, patch_new, c, flags=re.DOTALL)

with open("backend/src/routes/profile.js", "w", encoding="utf-8") as f:
    f.write(c)
print("OK: " + str(c.count("router.patch")))
