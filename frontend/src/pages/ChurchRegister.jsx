import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Church, MapPin, Phone, User, BookOpen, CheckCircle } from 'lucide-react';

export default function ChurchRegister() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', denomination: '', address: '', city: '', country: 'Brasil', phone: '', pastor_name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Nome da igreja é obrigatório');

    if (!user || !token) {
      setError('Você precisa estar logado para cadastrar uma igreja.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/churches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar');
      setSuccess(true);
      setTimeout(() => navigate('/igrejas'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="form-page" style={{ maxWidth: '540px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <CheckCircle size={64} style={{ color: 'var(--green)', marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--green-dark)' }}>Igreja Cadastrada!</h2>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>Redirecionando para o mapa de igrejas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page" style={{ maxWidth: '540px' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Church size={40} style={{ color: 'var(--gold)' }} />
          <h2 style={{ color: 'var(--primary)', marginTop: '0.5rem' }}>Cadastrar Igreja</h2>
          <p style={{ color: 'var(--gray-500)' }}>Registre sua igreja na plataforma Sigo com Fé</p>
        </div>

        {error && <p className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Nome da Igreja *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Ex: Igreja Batista Central" required />
          </div>
          <div className="form-group">
            <label><Church size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Denominação</label>
            <input name="denomination" value={form.denomination} onChange={handleChange} placeholder="Ex: Batista, Assembleia de Deus, etc." />
          </div>
          <div className="form-group">
            <label><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Endereço</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Rua, número, bairro" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Cidade</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="Sua cidade" />
            </div>
            <div className="form-group">
              <label>País</label>
              <input name="country" value={form.country} onChange={handleChange} placeholder="País" />
            </div>
          </div>
          <div className="form-group">
            <label><Phone size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Telefone</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+55 11 99999-9999" />
          </div>
          <div className="form-group">
            <label><User size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Nome do Pastor</label>
            <input name="pastor_name" value={form.pastor_name} onChange={handleChange} placeholder="Nome do pastor responsável" />
          </div>
          <button type="submit" className="btn btn-green btn-lg" style={{ width: '100%' }} disabled={loading}>
            <Church size={18} /> {loading ? 'Cadastrando...' : 'Cadastrar Igreja'}
          </button>
        </form>
      </div>
    </div>
  );
}
