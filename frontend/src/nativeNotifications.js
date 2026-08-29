import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

const API = (import.meta.env.VITE_API_URL || "https://sigo-com-fe-api.onrender.com") + "/api";
let activeSetup = null;

export async function setupNativeNotifications(authToken) {
  if (!Capacitor.isNativePlatform() || !authToken) return () => {};
  if (activeSetup) return activeSetup.cleanup;
  const handles = [];
  const cleanup = async () => {
    await Promise.all(handles.splice(0).map(handle => handle?.remove?.().catch?.(() => {})));
    activeSetup = null;
  };
  activeSetup = { cleanup };
  try {
    let permission = await PushNotifications.checkPermissions();
    if (permission.receive !== "granted") permission = await PushNotifications.requestPermissions();
    if (permission.receive !== "granted") { await cleanup(); return () => {}; }
    await PushNotifications.createChannel({ id: "sigo-com-fe", name: "Sigo com Fé", description: "Mensagens, pedidos de oração e novidades", importance: 5, sound: "default", vibration: true }).catch(() => {});
    handles.push(await PushNotifications.addListener("registration", async ({ value }) => {
      if (!value || value.length < 20) return;
      try { await fetch(`${API}/notifications/fcm-token`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ token: value, platform: Capacitor.getPlatform() }) }); } catch (_) {}
    }));
    handles.push(await PushNotifications.addListener("registrationError", error => console.warn("FCM registration failed", error?.error || "unknown error")));
    handles.push(await PushNotifications.addListener("pushNotificationReceived", notification => window.dispatchEvent(new CustomEvent("sigo-native-notification", { detail: notification }))));
    await PushNotifications.register();
    return cleanup;
  } catch (_) { await cleanup(); return () => {}; }
}
