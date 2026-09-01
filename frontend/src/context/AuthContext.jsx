import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { signInWithPopup, onAuthStateChanged, signOut, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

const GOOGLE_LOGIN_HELP = {
  pt: 'O Google não conseguiu abrir neste navegador. Abra o link no Chrome ou Safari, ou entre com e-mail e senha abaixo.',
  es: 'Google no pudo abrirse en este navegador. Abra el enlace en Chrome o Safari, o entre con su correo y contraseña abajo.',
  en: 'Google could not open in this browser. Open the link in Chrome or Safari, or sign in with your email and password below.',
  de: 'Google konnte in diesem Browser nicht geöffnet werden. Öffne den Link in Chrome oder Safari oder melde dich unten mit E-Mail und Passwort an.',
  fr: 'Google n’a pas pu s’ouvrir dans ce navigateur. Ouvrez le lien dans Chrome ou Safari, ou connectez-vous avec votre e-mail et votre mot de passe ci-dessous.',
  ro: 'Google nu s-a putut deschide în acest browser. Deschide linkul în Chrome sau Safari ori conectează-te mai jos cu e-mailul și parola.',
  ru: 'Не удалось открыть Google в этом браузере. Откройте ссылку в Chrome или Safari либо войдите ниже с помощью электронной почты и пароля.',
};

function createGoogleBrowserError() {
  const language = typeof navigator === 'undefined' ? 'pt' : (navigator.language || 'pt').slice(0, 2).toLowerCase();
  const error = new Error(GOOGLE_LOGIN_HELP[language] || GOOGLE_LOGIN_HELP.pt);
  error.code = 'auth/browser-session-unavailable';
  return error;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; } catch(e) { return null; } });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Helper: sync Firebase user with our backend (social login)
  const syncFirebaseUser = async (firebaseUser) => {
    const res = await fetch(`${API}/auth/social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        full_name: firebaseUser.displayName || firebaseUser.email,
        photo: firebaseUser.photoURL,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao sincronizar com servidor');
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  // Listen for Firebase auth state changes (for page reload with active Google session)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !localStorage.getItem('token')) {
        try {
          await syncFirebaseUser(firebaseUser);
        } catch (e) {
          // Backend offline, ignore
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Check the saved session on every start. This prevents an expired token from
  // looking like a logged-in account and makes a valid session stay available.
  useEffect(() => {
    let active = true;
    if (token) {
      fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          if (!active) return;
          const u = { ...data.user, photoURL: data.user.photoURL || data.user.avatar_url };
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        })
        .catch(() => {
          if (!active) return;
          // Keep a Firebase session when there is one; otherwise remove only an
          // invalid local session so the person can sign in once again.
          if (!auth.currentUser) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => { if (active) setLoading(false); });
    } else {
      setLoading(false);
    }
    return () => { active = false; };
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return await syncFirebaseUser(result.user);
    } catch (err) {
      // Redirect authentication fails in browsers that partition or erase
      // session storage (common in social-app browsers). Keep the person on
      // this page and offer the reliable email/password route instead.
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') throw createGoogleBrowserError();
      throw err;
    }
  };

  const loginWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return await syncFirebaseUser(result.user);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') throw createGoogleBrowserError();
      throw err;
    }
  };

  const sendPhoneCode = async (phoneNumber, recaptchaContainerId) => {
    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: 'invisible' });
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  };

  const verifyPhoneCode = async (confirmationResult, code) => {
    const result = await confirmationResult.confirm(code);
    // Sync with backend via phone endpoint
    const firebaseUser = result.user;
    const res = await fetch(`${API}/auth/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        phone: firebaseUser.phoneNumber,
        full_name: firebaseUser.displayName || firebaseUser.phoneNumber,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao sincronizar com servidor');
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  const register = async (email, password, full_name, role, avatar_url, email_updates_opt_in = false) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name, role, avatar_url, email_updates_opt_in }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore firebase signout errors
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfilePhoto = async (photoURL) => {
    if (!user || !token) throw new Error('User not authenticated.');
    const res = await fetch(`${API}/profile/photo`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ photoURL }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar foto de perfil');

    // O perfil devolve a foto no nível principal, enquanto alguns fluxos de
    // autenticação devolvem dentro de `user`. Aceitamos ambos para a imagem
    // ficar realmente guardada após o registo.
    const avatarUrl = data?.user?.avatar_url || data?.user?.photoURL || data?.avatar_url || data?.photoURL;
    if (!avatarUrl) throw new Error('Não foi possível guardar a foto de perfil.');
    const updatedUser = { ...user, avatar_url: avatarUrl, photoURL: avatarUrl };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, loginWithFacebook, sendPhoneCode, verifyPhoneCode, register, logout, updateProfilePhoto, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);




