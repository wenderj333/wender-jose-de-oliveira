import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const API = `${import.meta.env.VITE_API_URL || ''}/api`;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = params.get('token');

  const submit = async (event) => {
    event.preventDefault();
    setError(''); setMessage('');
    if (!token) return setError('Este link não é válido. Peça uma nova recuperação de senha.');
    if (password !== confirmation) return setError('As duas senhas não são iguais.');
    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(data.message);
      setPassword(''); setConfirmation('');
    } catch (err) {
      setError(err.message || 'Não foi possível alterar a senha.');
    } finally { setLoading(false); }
  };

  return <main style={pageStyle}><section style={cardStyle}>
    <img src="/logo-new.png" alt="Sigo com Fé" style={{ height: 60, width: 60, borderRadius: 12, display: 'block', margin: '0 auto 14px' }} />
    <h1 style={titleStyle}>Criar nova senha</h1>
    <p style={textStyle}>Escolha uma senha nova com pelo menos 6 caracteres.</p>
    {message && <p style={successStyle}>{message} <Link to="/login" style={{ color: '#1f6a38', fontWeight: 800 }}>Entrar agora</Link></p>}
    {error && <p style={errorStyle}>{error}</p>}
    {!message && <form onSubmit={submit}>
      <label style={labelStyle}>Nova senha</label>
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="6" required style={inputStyle} />
      <label style={{ ...labelStyle, marginTop: 14 }}>Repita a nova senha</label>
      <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength="6" required style={inputStyle} />
      <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'A guardar…' : 'Alterar senha'}</button>
    </form>}
    <p style={{ textAlign: 'center', marginTop: 20 }}><Link to="/login" style={{ color: '#6C3FA0', fontWeight: 700 }}>Voltar para entrar</Link></p>
  </section></main>;
}

const pageStyle = { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: '#f8f9ff' };
const cardStyle = { width: 'min(420px, 100%)', boxSizing: 'border-box', padding: 36, borderRadius: 20, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,.12)' };
const titleStyle = { margin: '0 0 12px', color: '#6C3FA0', fontSize: 25, textAlign: 'center' };
const textStyle = { margin: '0 0 22px', color: '#5d6270', lineHeight: 1.55, textAlign: 'center' };
const labelStyle = { display: 'block', marginBottom: 7, color: '#414553', fontWeight: 700 };
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: 12, border: '1.5px solid #e0d0f0', borderRadius: 10, fontSize: 15 };
const buttonStyle = { width: '100%', marginTop: 18, padding: 13, border: 0, borderRadius: 10, background: '#6C3FA0', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 800 };
const successStyle = { padding: 11, borderRadius: 9, background: '#eaf8ee', color: '#1f6a38', lineHeight: 1.45 };
const errorStyle = { padding: 11, borderRadius: 9, background: '#fff0f0', color: '#b32727', lineHeight: 1.45 };
