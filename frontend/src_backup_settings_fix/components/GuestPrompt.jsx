import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock } from 'lucide-react';

export default function GuestPrompt({ show, onClose, feature = 'esta funcionalidade' }) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px 24px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#999',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '16px' }}>
          <Lock size={48} style={{ color: 'var(--blue)' }} />
        </div>

        <h2 style={{ margin: '0 0 12px', fontSize: '1.4rem', color: '#333' }}>
          Regista-te para continuar
        </h2>

        <p style={{ margin: '0 0 24px', fontSize: '0.95rem', color: '#666', lineHeight: 1.5 }}>
          Para usar {feature}, precisas de criar uma conta gratuita.
        </p>

        <button
          onClick={() => {
            localStorage.removeItem('guestMode');
            navigate('/cadastro');
          }}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '8px',
          }}
        >
          ✨ Criar conta grátis
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('guestMode');
            navigate('/login');
          }}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: 'var(--blue)',
            border: '1px solid var(--blue)',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Já tenho conta
        </button>
      </div>
    </div>
  );
}
