ph = chr(36)
with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\auth.js', 'r', encoding='utf-8') as f:
    content = f.read()

reset_route = """
// POST /api/auth/admin/reset-password - admin reset password
router.post('/admin/reset-password', async (req, res) => {
  try {
    const { email, newPassword, adminKey } = req.body;
    if (adminKey !== 'SigoComFe2024Admin') return res.status(403).json({ error: 'Nao autorizado' });
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(newPassword, 10);
    const result = await db.query('UPDATE users SET password_hash = """ + ph + """1 WHERE email = """ + ph + """2 RETURNING id, email, full_name', [hash, email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilizador nao encontrado' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
"""

content = content.replace('module.exports = router;', reset_route + '\nmodule.exports = router;')

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\backend\src\routes\auth.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Reset route: OK' if 'admin/reset-password' in content else 'FALHOU')
