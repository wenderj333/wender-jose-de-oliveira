f = open("backend/src/routes/notifications.js", "rb")
content = f.read().decode("utf-8")
f.close()

old = """  } catch (err) {
    console.error(""" + chr(39) + """Error creating notification:""" + chr(39) + """, err);
  }
}"""

new = """    // FCM push
    try {
      const userRes = await db.query(""" + chr(39) + """SELECT fcm_token FROM users WHERE id = $1""" + chr(39) + """, [userId]);
      const fcmToken = userRes.rows[0]?.fcm_token;
      if (fcmToken) {
        const { GoogleAuth } = require(""" + chr(39) + """google-auth-library""" + chr(39) + """);
        const creds = require(""" + chr(39) + """../firebase-adminsdk.json""" + chr(39) + """);
        const auth = new GoogleAuth({ credentials: creds, scopes: [""" + chr(39) + """https://www.googleapis.com/auth/firebase.messaging""" + chr(39) + """] });
        const token = await auth.getAccessToken();
        await fetch(""" + chr(39) + """https://fcm.googleapis.com/v1/projects/""" + chr(39) + """ + creds.project_id + """ + chr(39) + """/messages:send""" + chr(39) + """, {
          method: """ + chr(39) + """POST""" + chr(39) + """,
          headers: { """ + chr(39) + """Authorization""" + chr(39) + """: """ + chr(39) + """Bearer """ + chr(39) + """ + token, """ + chr(39) + """Content-Type""" + chr(39) + """: """ + chr(39) + """application/json""" + chr(39) + """ },
          body: JSON.stringify({ message: { token: fcmToken, notification: { title, body: body || title } } })
        });
      }
    } catch(fcmErr) { console.error(""" + chr(39) + """FCM error:""" + chr(39) + """, fcmErr.message); }
  } catch (err) {
    console.error(""" + chr(39) + """Error creating notification:""" + chr(39) + """, err);
  }
}"""

if old in content:
    content = content.replace(old, new)
    print("OK!")
else:
    print("NAO ENCONTRADO")

open("backend/src/routes/notifications.js", "wb").write(content.encode("utf-8"))
print("Feito!")
