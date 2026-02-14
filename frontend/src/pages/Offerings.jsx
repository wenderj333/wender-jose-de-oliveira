import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, DollarSign, CreditCard, Save, Copy, Check, Gift, TrendingUp, Calendar } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function Offerings() {
  const { user, token } = useAuth();
  const isPastor = user?.role === 'pastor' || user?.role === 'admin';
  const [tab, setTab] = useState(isPastor ? 'config' : 'contribute');
  const [config, setConfig] = useState({ pix_key: '', pix_name: '', paypal_email: '', bank_name: '', bank_agency: '', bank_account: '', bank_holder: '', custom_message: '' });
  const [records, setRecords] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPastor) {
      fetchConfig();
      fetchRecords();
    }
  }, []);

  async function fetchConfig() {
    try {
      const res = await fetch(`${API}/offerings/config`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.config) setConfig(data.config);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchRecords() {
    try {
      const res = await fetch(`${API}/offerings/records`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setRecords(data.records || []);
    } catch (err) { console.error(err); }
  }

  async function saveConfig(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/offerings/config`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.config) { setConfig(data.config); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  const totalAmount = records.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const thisMonth = records.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth());
  const monthTotal = thisMonth.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  if (!isPastor) {
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <Heart size={48} color="#e74c3c" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: '#1a0a3e' }}>Ofertas e Dízimos</h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Para contribuir, entre em contato com o pastor da sua igreja ou acesse a página da igreja.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', color: '#1a0a3e', marginBottom: '1rem' }}>
        <Heart size={24} color="#e74c3c" /> Ofertas e Dízimos
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {['config', 'records'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.5rem 1.2rem', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: tab === t ? '#1a0a3e' : '#f0f0f0', color: tab === t ? '#fff' : '#666',
            fontWeight: tab === t ? 700 : 400, fontSize: '0.85rem',
          }}>
            {t === 'config' ? '⚙️ Configurar' : '📊 Registros'}
          </button>
        ))}
      </div>

      {/* Config Tab */}
      {tab === 'config' && (
        <form onSubmit={saveConfig}>
          {/* PIX */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '1rem', marginBottom: '1rem', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1rem', color: '#4caf50', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={18} /> PIX
            </h3>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#666' }}>Chave PIX (CPF, Email, Telefone ou Aleatória)</label>
              <input value={config.pix_key || ''} onChange={e => setConfig({...config, pix_key: e.target.value})}
                placeholder="Sua chave PIX"
                style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#666' }}>Nome do Titular</label>
              <input value={config.pix_name || ''} onChange={e => setConfig({...config, pix_name: e.target.value})}
                placeholder="Nome que aparece no PIX"
                style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* PayPal */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '1rem', marginBottom: '1rem', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1rem', color: '#003087', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <DollarSign size={18} /> PayPal
            </h3>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#666' }}>Email do PayPal</label>
              <input value={config.paypal_email || ''} onChange={e => setConfig({...config, paypal_email: e.target.value})}
                placeholder="seu@email.com"
                style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Bank Transfer */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '1rem', marginBottom: '1rem', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1rem', color: '#1a0a3e', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              🏦 Transferência Bancária
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#666' }}>Banco</label>
                <input value={config.bank_name || ''} onChange={e => setConfig({...config, bank_name: e.target.value})}
                  placeholder="Ex: Banco do Brasil"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#666' }}>Agência</label>
                <input value={config.bank_agency || ''} onChange={e => setConfig({...config, bank_agency: e.target.value})}
                  placeholder="0001"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#666' }}>Conta</label>
                <input value={config.bank_account || ''} onChange={e => setConfig({...config, bank_account: e.target.value})}
                  placeholder="12345-6"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#666' }}>Titular</label>
                <input value={config.bank_holder || ''} onChange={e => setConfig({...config, bank_holder: e.target.value})}
                  placeholder="Nome do titular"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {/* Custom Message */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '1rem', marginBottom: '1rem', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1rem', color: '#daa520', marginBottom: '0.75rem' }}>💬 Mensagem para os Membros</h3>
            <textarea value={config.custom_message || ''} onChange={e => setConfig({...config, custom_message: e.target.value})}
              placeholder="Ex: Deus abençoe a sua oferta! Cada contribuição ajuda nossa igreja a crescer..."
              rows={3}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" disabled={saving} style={{
            width: '100%', padding: '0.75rem', borderRadius: 12, border: 'none',
            background: saved ? '#4caf50' : '#daa520', color: '#fff', fontWeight: 700,
            fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {saved ? <><Check size={18} /> Salvo!</> : <><Save size={18} /> {saving ? 'Salvando...' : 'Salvar Configurações'}</>}
          </button>
        </form>
      )}

      {/* Records Tab */}
      {tab === 'records' && (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140, padding: '1rem', borderRadius: 12, background: '#e8f5e9', textAlign: 'center' }}>
              <TrendingUp size={20} color="#2e7d32" />
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#2e7d32' }}>R$ {monthTotal.toFixed(2)}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Este mês</div>
            </div>
            <div style={{ flex: 1, minWidth: 140, padding: '1rem', borderRadius: 12, background: '#fff3e0', textAlign: 'center' }}>
              <Gift size={20} color="#e65100" />
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e65100' }}>R$ {totalAmount.toFixed(2)}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Total geral</div>
            </div>
            <div style={{ flex: 1, minWidth: 140, padding: '1rem', borderRadius: 12, background: '#e3f2fd', textAlign: 'center' }}>
              <Calendar size={20} color="#1565c0" />
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1565c0' }}>{records.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Contribuições</div>
            </div>
          </div>

          {records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              <Gift size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>Nenhuma contribuição registrada ainda</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {records.map(r => (
                <div key={r.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem', background: '#fff', borderRadius: 12, border: '1px solid #eee',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a0a3e' }}>{r.donor_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>
                      {r.type === 'dizimo' ? '💰 Dízimo' : '🎁 Oferta'} • {r.method?.toUpperCase()} • {new Date(r.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    {r.note && <div style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>"{r.note}"</div>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#4caf50' }}>R$ {parseFloat(r.amount).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
