import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API = `${import.meta.env.VITE_API_URL || ''}/api`;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true); setMessage(''); setError('');
    try {
      const response = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(data.message);
    } catch (err) {
      setError(err.message || 'Não foi possível enviar o link. Tente novamente.');
    } finally { setLoading(false); }
  };

  return <main style={pageStyle}><section style={cardStyle}>
    <img src="/logo-new.png" alt="Sigo com Fé" style={{ height: 60, width: 60, borderRadius: 12, display: 'block', margin: '0 auto 14px' }} />
    <h1 style={titleStyle}>Recuperar senha</h1>
    <p style={textStyle}>Escreva o e-mail da sua conta. Enviaremos um link seguro para criar uma nova senha.</p>
    {message && <p style={successStyle}>{message}</p>}
    {error && <p style={errorStyle}>{error}</p>}
    <form onSubmit={submit}>
      <label style={labelStyle}>E-mail</label>
      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="seuemail@exemplo.com" style={inputStyle} />
      <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'A enviar…' : 'Enviar link de recuperação'}</button>
    </form>
    <p style={{ textAlign: 'center', marginTop: 20 }}><Link to="/login" style={{ color: '#6C3FA0', fontWeight: 700 }}>Voltar para entrar</Link></p>
  </section></main>;
}

const pageStyle = { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: '#f8f9ff' };
const cardStyle = { width: 'min(420px, 100%)', boxSizing: 'border-box', padding: 36, borderRadius: 20, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,.12)' };
const titleStyle = { margin: '0 0 12px', color: '#6C3FA0', fontSize: 25, textAlign: 'center' };
const textStyle = { margin: '0 0 22px', color: '#5d6270', lineHeight: 1.55, textAlign: 'center' };
const labelStyle = { display: 'block', marginBottom: 7, color: '#414553', fontWeight: 700 };
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: 12, border: '1.5px solid #e0d0f0', borderRadius: 10, fontSize: 15 };
const buttonStyle = { width: '100%', marginTop: 16, padding: 13, border: 0, borderRadius: 10, background: '#6C3FA0', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 800 };
const successStyle = { padding: 11, borderRadius: 9, background: '#eaf8ee', color: '#1f6a38', lineHeight: 1.45 };
const errorStyle = { padding: 11, borderRadius: 9, background: '#fff0f0', color: '#b32727', lineHeight: 1.45 };
