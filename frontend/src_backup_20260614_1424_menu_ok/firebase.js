import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA2BCit2HeaB_j_xbz-NWqKXosSdvuVX9M",
  authDomain: "sigo-com-fe.firebaseapp.com",
  projectId: "sigo-com-fe",
  storageBucket: "sigo-com-fe.firebasestorage.app",
  messagingSenderId: "77579516493",
  appId: "1:77579516493:web:afad13f1ea23fd03c77a04",
  measurementId: "G-0KMESL9M5Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export let messaging = null;
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
}

export { onMessage };
export default app;
