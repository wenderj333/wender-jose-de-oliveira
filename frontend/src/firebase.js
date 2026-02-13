import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

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
export default app;
