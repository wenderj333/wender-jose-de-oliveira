import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Search, MessageSquare, Heart, Calendar, Share2, ShieldCheck } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function Groups() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/groups`, { headers: { Authorization: "Bearer " + token } })
      .then(res => res.json())
      .then(data => {
        setGroups(data.groups || data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      
      {/* Header de Impacto */}
      <div style={{ 
        background: 'linear-gradient(135deg, #6e8efb, #a777e3)', 
        padding: '40px', borderRadius: '20px', color: '#fff', 
        marginBottom: '30px', textAlign: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' 
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>
          {t('groups.welcome', 'Comunidade e Fé')}
        </h1>
        <p style={{ fontSize: '18px', opacity: '0.9' }}>
          {t('groups.sub', 'Crie grupos de oração, estudos e comunhão. Juntos somos mais fortes!')}
        </p>
        <button 
          onClick={() => navigate('/grupos/novo')}
          style={{ 
            marginTop: '20px', padding: '12px 25px', borderRadius: '30px', border: 'none', 
            background: '#fff', color: '#6e8efb', fontWeight: '700', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Plus size={20} /> {t('groups.create', 'Criar Novo Grupo')}
        </button>
      </div>

      {/* Busca e Filtros */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '15px', top: '12px', color: '#8e8e8e' }} size={20} />
          <input 
            placeholder={t('groups.searchPlaceholder', 'Buscar grupos de oração...')}
            style={{ 
              width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', 
              border: '1px solid #dbdbdb', fontSize: '16px' 
            }}
          />
        </div>
      </div>

      {/* Grid de Grupos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {loading ? (
          <p>Carregando grupos...</p>
        ) : groups.length > 0 ? (
          groups.map(group => (
            <div key={group.id} style={{ 
              background: '#fff', borderRadius: '15px', border: '1px solid #dbdbdb', 
              overflow: 'hidden', transition: '0.3s', cursor: 'pointer'
            }}>
              <div style={{ height: '100px', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={40} color="#6e8efb" />
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{group.name}</h3>
                <p style={{ fontSize: '14px', color: '#8e8e8e', height: '40px', overflow: 'hidden' }}>{group.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#6e8efb' }}>
                    {group.members_count || 0} membros
                  </span>
                  <button 
                    onClick={() => navigate(`/grupos/${group.id}`)}
                    style={{ background: '#0095f6', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: '600' }}
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
             <Users size={60} color="#ccc" style={{ marginBottom: '15px' }} />
             <h3>Nenhum grupo encontrado</h3>
             <p>Seja o primeiro a criar uma comunidade aqui!</p>
          </div>
        )}
      </div>
    </div>
  );
}
