f = open("backend/src/routes/notifications.js", "rb")
content = f.read().decode("utf-8")
f.close()

old = "    console.error(" + chr(39) + "Error creating notification:" + chr(39) + ", err);\r\n  }\r\n}"
new = "    console.error(" + chr(39) + "Error creating notification:" + chr(39) + ", err);\r\n  }\r\n  // FCM push\r\n  try {\r\n    const userRes = await db.query(" + chr(39) + "SELECT fcm_token FROM users WHERE id = $1" + chr(39) + ", [userId]);\r\n    const fcmToken = userRes.rows[0]?.fcm_token;\r\n    if (fcmToken) {\r\n      const { GoogleAuth } = require(" + chr(39) + "google-auth-library" + chr(39) + ");\r\n      const creds = require(" + chr(39) + "../firebase-adminsdk.json" + chr(39) + ");\r\n      const auth = new GoogleAuth({ credentials: creds, scopes: [" + chr(39) + "https://www.googleapis.com/auth/firebase.messaging" + chr(39) + "] });\r\n      const token = await auth.getAccessToken();\r\n      await fetch(" + chr(39) + "https://fcm.googleapis.com/v1/projects/" + chr(39) + " + creds.project_id + " + chr(39) + "/messages:send" + chr(39) + ", {\r\n        method: " + chr(39) + "POST" + chr(39) + ",\r\n        headers: { " + chr(39) + "Authorization" + chr(39) + ": " + chr(39) + "Bearer " + chr(39) + " + token, " + chr(39) + "Content-Type" + chr(39) + ": " + chr(39) + "application/json" + chr(39) + " },\r\n        body: JSON.stringify({ message: { token: fcmToken, notification: { title, body: body || title } } })\r\n      });\r\n    }\r\n  } catch(fcmErr) { console.error(" + chr(39) + "FCM error:" + chr(39) + ", fcmErr.message); }\r\n}"

if old in content:
    content = content.replace(old, new)
    print("OK!")
else:
    print("NAO ENCONTRADO")

open("backend/src/routes/notifications.js", "wb").write(content.encode("utf-8"))
print("Feito!")
