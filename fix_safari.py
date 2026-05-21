content = open("frontend/src/firebase.js", "rb").read().decode("utf-8")

old = """export const messaging = getMessaging(app);

export async function requestNotificationPermission() {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BJJLw29P-fq2YB2PkgAvOePJN-YBgBBIfJTU6bA-gBqPqQT91gOym4Q859eFTieaup6U-JUg402zTRKevISLnpI"
    });
    if (token) return token;
  } catch (error) {
    console.error("Erro ao obter token FCM:", error);
  }
}"""

new = """export let messaging = null;
try {
  if (typeof window !== "undefined" && "serviceWorker" in navigator && !navigator.userAgent.includes("Safari") || navigator.userAgent.includes("Chrome")) {
    messaging = getMessaging(app);
  }
} catch(e) { console.log("FCM not supported"); }

export async function requestNotificationPermission() {
  try {
    if (!messaging) return null;
    const token = await getToken(messaging, {
      vapidKey: "BJJLw29P-fq2YB2PkgAvOePJN-YBgBBIfJTU6bA-gBqPqQT91gOym4Q859eFTieaup6U-JUg402zTRKevISLnpI"
    });
    if (token) return token;
  } catch (error) {
    console.error("Erro ao obter token FCM:", error);
  }
}"""

content = content.replace(old, new)
open("frontend/src/firebase.js", "wb").write(content.encode("utf-8"))
print("Feito!" if old in open("frontend/src/firebase.js", "rb").read().decode("utf-8") == False else "Substituido!")
