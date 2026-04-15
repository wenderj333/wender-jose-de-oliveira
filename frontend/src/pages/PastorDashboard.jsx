import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function PastorDashboard() {
  const { user } = useAuth();
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Sala do Pastor</h1>
      <p>Bem-vindo, {user?.full_name}</p>
    </div>
  );
}