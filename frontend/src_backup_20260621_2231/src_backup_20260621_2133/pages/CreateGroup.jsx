import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Users, Save, Layout, MessageSquare, Heart, BookOpen } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function CreateGroup() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Oração'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/groups`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        navigate('/grupos');
      } else {
        alert('Erro ao criar grupo. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#8e8e8e', marginBottom: '20px', fontWeight: '600' }}>
        <ArrowLeft size={20} /> {t('common.back', 'Voltar')}
      </button>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #dbdbdb', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: '#e7f3ff', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
            <Users size={30} color="#0095f6" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Criar Nova Comunidade</h1>
          <p style={{ color: '#8e8e8e', marginTop: '5px' }}>Inicie um grupo de fé e comunhão</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', fontSize: '14px' }}>Nome do Grupo</label>
            <input 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Grupo de Intercessão Sigo com Fé"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #dbdbdb', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', fontSize: '14px' }}>Categoria</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #dbdbdb', background: '#fff' }}
            >
              <option>Oração</option>
              <option>Estudo Bíblico</option>
              <option>Jovens</option>
              <option>Casais</option>
              <option>Louvor</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', fontSize: '14px' }}>Sobre o Grupo</label>
            <textarea 
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Descreva o propósito do grupo para as pessoas encontrarem..."
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #dbdbdb', minHeight: '100px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            style={{ 
              width: '100%', padding: '15px', borderRadius: '12px', border: 'none', 
              background: '#0095f6', color: '#fff', fontWeight: '700', fontSize: '16px', 
              cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
            }}
          >
            {loading ? 'Criando...' : <><Save size={20} /> Criar Grupo Agora</>}
          </button>
        </form>
      </div>
    </div>
  );
}
