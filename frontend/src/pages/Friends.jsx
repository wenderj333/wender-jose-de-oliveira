import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Users, UserMinus, MessageCircle, Search, UserCheck, Clock } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function Friends() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'requests', 'search'

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
        <Users size={28} color="#0095f6" />
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{t('friends.title', 'Amigos')}</h1>
      </div>

      {/* Navegação por Abas Estilo Pílula */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '5px' }}>
        {[
          { id: 'my', label: t('friends.myFriends', 'Meus Amigos'), icon: <UserCheck size={16} /> },
          { id: 'requests', label: t('friends.requests', 'Solicitações'), icon: <Users size={16} /> },
          { id: 'search', label: t('friends.search', 'Descobrir'), icon: <Search size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '25px',
              border: 'none', cursor: 'pointer', fontWeight: '600', transition: '0.3s',
              background: activeTab === tab.id ? '#0095f6' : '#efefef',
              color: activeTab === tab.id ? '#fff' : '#262626'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Lista de Amigos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Exemplo de Card (Você deve mapear seus amigos aqui) */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '15px', background: '#fff', borderRadius: '15px',
            border: '1px solid #dbdbdb', transition: 'transform 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => navigate('/perfil/1')}>
              <div style={{ width: '55px', height: '55px', borderRadius: '50%', overflow: 'hidden', background: '#eee', border: '2px solid #0095f6' }}>
                <img src={`https://i.pravatar.cc/150?u=${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#262626' }}>Nome do Amigo {i}</div>
                <div style={{ fontSize: '12px', color: '#8e8e8e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> Visto há {i}d
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ 
                padding: '8px 15px', borderRadius: '8px', border: 'none', 
                background: '#efefef', color: '#262626', fontWeight: '600', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' 
              }}>
                <MessageCircle size={16} /> {t('friends.chat', 'Chat')}
              </button>
              <button style={{ 
                padding: '8px', borderRadius: '8px', border: '1px solid #ffcccc', 
                background: '#fff', color: '#ed4956', cursor: 'pointer' 
              }}>
                <UserMinus size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
