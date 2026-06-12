with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/routes/profile.js", "r", encoding="utf-8") as f:
    c = f.read()

# Mover o patch para antes do module.exports
patch = """
router.patch('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, username, bio, city, state, country, profession, marital_status, church_name, denomination, pastor_name, christian_years, church_role, ministry, favorite_verse, testimony, prayer_request, final_message, avatar_url, cover_url } = req.body;
    await db.query(
      `UPDATE users SET full_name=$1, username=$2, bio=$3, city=$4, state=$5, country=$6, profession=$7, marital_status=$8, church_name=$9, church_denomination=$10, faith_years=$11, church_role=$12, favorite_verse=$13, testimony=$14, avatar_url=$15, cover_url=$16, updated_at=NOW() WHERE id=$17`,
      [full_name, username, bio, city, state, country, profession, marital_status, church_name, denomination, christian_years, church_role, favorite_verse, testimony, avatar_url, cover_url, userId]
    );
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
"""

# Remover o patch depois do module.exports
c = c.replace("module.exports = router;\n" + patch, "module.exports = router;")
# Adicionar antes do module.exports
c = c.replace("module.exports = router;", patch + "\nmodule.exports = router;")

with open("C:/Users/wender/Desktop/SIGO COM FE LOCAL/sigo-com-fe/backend/src/routes/profile.js", "w", encoding="utf-8") as f:
    f.write(c)
print("Feito!")
