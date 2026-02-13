import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Helper: sync Firebase user with our backend
  const syncFirebaseUser = async (firebaseUser) => {
    const res = await fetch(`${API}/auth/google`, {
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

  // Handle redirect result (mobile Google sign-in)
  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        try {
          await syncFirebaseUser(result.user);
          // Redirect to home after successful Google login on mobile
          if (window.location.pathname === '/login' || window.location.pathname === '/cadastro') {
            window.location.href = '/';
          }
        } catch (e) {
          // Backend offline, ignore
        }
      }
    }).catch(() => {});
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
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
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
    try {
      // Try popup first (works on desktop and some mobile browsers)
      const result = await signInWithPopup(auth, googleProvider);
      return await syncFirebaseUser(result.user);
    } catch (err) {
      // If popup blocked/failed on mobile, fall back to redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, googleProvider);
        return; // Page will reload — redirect result handled in useEffect
      }
      throw err;
    }
  };

  const register = async (email, password, full_name, role) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name, role }),
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
