import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(localStorage.getItem('guestMode') === 'true');

  // Helper: sync Firebase user with our backend (social login)
  const syncFirebaseUser = async (firebaseUser) => {
    console.log('🔵 syncFirebaseUser iniciado:', { uid: firebaseUser.uid, email: firebaseUser.email });
    try {
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
      console.log('🔵 Resposta do backend:', { ok: res.ok, status: res.status, data });
      if (!res.ok) throw new Error(data.error || 'Erro ao sincronizar com servidor');
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ syncFirebaseUser concluído');
      return data;
    } catch (err) {
      console.error('❌ Erro no syncFirebaseUser:', err);
      throw err;
    }
  };

  // Handle redirect result (mobile Google sign-in)
  useEffect(() => {
    console.log('🔵 Verificando redirect result...');
    getRedirectResult(auth).then(async (result) => {
      console.log('🔵 getRedirectResult resultado:', result);
      if (result?.user) {
        console.log('✅ User do Google recebido:', result.user.email);
        try {
          await syncFirebaseUser(result.user);
          console.log('✅ Sync completo, redirecionando...');
          // Redirect to home after successful Google login
          if (['/login','/cadastro','/register'].includes(window.location.pathname)) {
            window.location.href = '/';
          }
        } catch (e) {
          console.error('❌ Erro ao sincronizar com Google:', e);
          alert(`Erro ao fazer login com Google: ${e.message}\nPor favor, tenta novamente ou usa email/senha.`);
        }
      } else {
        console.log('ℹ️ Sem redirect result (normal se não veio do Google)');
      }
    }).catch((e) => {
      console.error('❌ Erro no getRedirectResult:', e);
      alert(`Erro no redirect do Google: ${e.message}`);
    });
  }, []);

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

  // Check for existing local auth (email/password) on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && !user) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    if (token && !user) {
      fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          const u = { ...data.user, photoURL: data.user.photoURL || data.user.avatar_url };
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        })
        .catch(() => {
          // Token invalid, keep any Firebase user if present
          if (!auth.currentUser) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

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
    console.log('🔵 loginWithGoogle iniciado');
    try {
      // Try popup first (works on desktop)
      console.log('🔵 Tentando popup...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Popup bem-sucedido');
      return await syncFirebaseUser(result.user);
    } catch (err) {
      console.log('⚠️ Popup falhou:', err.code, err.message);
      // If popup blocked/failed, fall back to redirect (works on mobile)
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log('🔵 Fallback para redirect...');
        await signInWithRedirect(auth, googleProvider);
        return; // Page will reload - redirect result handled in useEffect
      }
      throw err;
    }
  };

  const loginWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return await syncFirebaseUser(result.user);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, facebookProvider);
        return;
      }
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

  const register = async (email, password, full_name, role, avatar_url) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name, role, avatar_url }),
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
    localStorage.removeItem('guestMode');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const enableGuestMode = () => {
    localStorage.setItem('guestMode', 'true');
    setIsGuest(true);
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

    const updatedUser = { ...user, photoURL: data.user.photoURL };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isGuest, login, loginWithGoogle, loginWithFacebook, sendPhoneCode, verifyPhoneCode, register, logout, updateProfilePhoto, enableGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

