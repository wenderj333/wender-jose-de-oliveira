f = open("backend/src/routes/messages.js", "rb")
content = f.read().decode("utf-8")
f.close()

old = """    // Notifica\u00e7\u00e3o
    try {
      const sender = await db.query(""" + chr(39) + """SELECT full_name FROM users WHERE id = $1""" + chr(39) + """, [me]);
      const name = sender.rows[0]?.full_name || """ + chr(39) + """Algu\u00e9m""" + chr(39) + """;
      const preview = content.trim().length > 50 ? content.trim().substring(0, 50) + """ + chr(39) + """...""" + chr(39) + """ : content.trim();
      await db.query(`
        INSERT INTO notifications (user_id, type, title, body)
        VALUES ($1, """ + chr(39) + """message""" + chr(39) + """, $2, $3)
      `, [targetId, `\ud83d\udcac Nova mensagem de ${name}`, preview]);
    } catch (_) {}"""

new = """    // Notificacao + push FCM
    try {
      const sender = await db.query(""" + chr(39) + """SELECT full_name FROM users WHERE id = $1""" + chr(39) + """, [me]);
      const name = sender.rows[0]?.full_name || """ + chr(39) + """Alguem""" + chr(39) + """;
      const preview = content.trim().length > 50 ? content.trim().substring(0, 50) + """ + chr(39) + """...""" + chr(39) + """ : content.trim();
      await createNotification(targetId, """ + chr(39) + """message""" + chr(39) + """, """ + chr(39) + """\ud83d\udcac """ + chr(39) + """ + name, preview, { senderId: me });
    } catch (_) {}"""

if old in content:
    content = content.replace(old, new)
    print("OK!")
else:
    print("NAO ENCONTRADO")

open("backend/src/routes/messages.js", "wb").write(content.encode("utf-8"))
print("Feito!")
