import React from 'react';
import Sidebar from '../components/Sidebar'; // Garante que o menu lateral seja importado

const Profile = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
      <Sidebar /> 
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Meu Mural</h2>
        {/* Aqui o sistema carrega suas postagens automaticamente */}
        <div style={{ width: '100%', maxWidth: '600px' }}>
            <p style={{ textAlign: 'center', color: '#999' }}>Carregando suas memórias...</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
