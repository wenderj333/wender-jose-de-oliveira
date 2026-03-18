import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return null;
  if (role && user.role !== role && user.role !== 'admin') {
    return <div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Acesso restrito.</div>;
  }
  return children;
}
