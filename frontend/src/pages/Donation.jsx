import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Heart, CreditCard, Euro, Gift, Check, AlertCircle, Loader } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function Donation() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPastor, setSelectedPastor] = useState(null);
  const [pastors, setPastors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stripeConfig, setStripeConfig] = useState(null);
  
  // Handle success/cancel from URL params
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  const suggestedAmounts = [5, 10, 20, 50];

  useEffect(() => {
    fetchPastors();
    fetchStripeConfig();
    
    // Check URL params for success/cancel
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
    }
    if (searchParams.get('cancelled') === 'true') {
      setShowCancelled(true);
    }
  }, [searchParams]);

  async function fetchPastors() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/members/pastors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPastors(data.pastors || []);
      if (data.pastors?.length > 0) {
        setSelectedPastor(data.pastors[0].id);
      }
    } catch (err) {
      console.error('Error fetching pastors:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStripeConfig() {
    try {
      const res = await fetch(`${API}/stripe/config`);
      const data = await res.json();
      setStripeConfig(data);
    } catch (err) {
      console.error('Error fetching Stripe config:', err);
    }
  }

  async function handleDonation() {
    if (!user) {
      alert('Por favor, faça login para fazer uma doação');
      return;
    }

    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount < 1) {
      alert('Por favor, insira um valor válido (mínimo €1)');
      return;
    }

    if (!selectedPastor) {
      alert('Por favor, selecione um pastor');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`${API}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          description: description || 'Doação/Oferta',
          pastor_id: selectedPastor
        })
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error creating donation:', err);
      alert('Erro ao processar doação. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <Heart size={48} style={{ color: '#daa520', marginBottom: '1rem' }} />
        <h2 style={{ color: '#1a0a3e' }}>Doações</h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Por favor, faça login para fazer uma doação
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: 600, 
      margin: '0 auto', 
      padding: '1rem 0.5rem',
      background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.1), rgba(138, 43, 226, 0.1))',
      minHeight: '100vh'
    }}>
      {/* Success Message */}
      {showSuccess && (
        <div style={{
          background: 'linear-gradient(135deg, #4caf50, #45a049)',
          color: '#fff',
          padding: '1rem',
          borderRadius: 16,
          marginBottom: '1rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)'
        }}>
          <Check size={32} style={{ marginBottom: '0.5rem' }} />
          <h3>🙏 Doação Realizada com Sucesso!</h3>
          <p style={{ margin: '0.5rem 0 0' }}>
            Obrigado por sua generosidade. Que Deus abençoe abundantemente sua vida!
          </p>
        </div>
      )}

      {/* Cancelled Message */}
      {showCancelled && (
        <div style={{
          background: 'linear-gradient(135deg, #ff9800, #f57c00)',
          color: '#fff',
          padding: '1rem',
          borderRadius: 16,
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          <AlertCircle size={32} style={{ marginBottom: '0.5rem' }} />
          <h3>Doação Cancelada</h3>
          <p style={{ margin: '0.5rem 0 0' }}>
            A doação foi cancelada. Você pode tentar novamente quando desejar.
          </p>
        </div>
      )}

      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, #daa520, #b8860b)',
        borderRadius: 20,
        color: '#fff',
        boxShadow: '0 8px 32px rgba(218, 165, 32, 0.3)'
      }}>
        <Heart size={48} style={{ marginBottom: '1rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
        <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem', fontWeight: 700 }}>
          🙏 Doação com Cartão
        </h1>
        <p style={{ fontSize: '1rem', opacity: 0.95, margin: 0 }}>
          "Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria."
        </p>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: '0.5rem 0 0', fontStyle: 'italic' }}>
          2 Coríntios 9:7
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, padding: '2rem 1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        {/* Pastor Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: '#1a0a3e', 
            marginBottom: '0.5rem' 
          }}>
            ⛪ Escolha o Pastor/Igreja
          </label>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <Loader size={24} className="spinner" />
            </div>
          ) : (
            <select 
              value={selectedPastor || ''} 
              onChange={(e) => setSelectedPastor(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: 12, 
                border: '2px solid #e0e0e0', 
                fontSize: '1rem',
                background: '#fafafa',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Selecione um pastor...</option>
              {pastors.map(pastor => (
                <option key={pastor.id} value={pastor.id}>
                  {pastor.full_name} - {pastor.church_name || 'Igreja'}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Amount Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: '#1a0a3e', 
            marginBottom: '0.75rem' 
          }}>
            💰 Valor da Doação
          </label>
          
          {/* Suggested Amounts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
            {suggestedAmounts.map(amount => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: 12,
                  border: selectedAmount === amount ? '2px solid #daa520' : '2px solid #e0e0e0',
                  background: selectedAmount === amount ? 'linear-gradient(135deg, #daa520, #b8860b)' : '#fafafa',
                  color: selectedAmount === amount ? '#fff' : '#333',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Euro size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                {amount}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div>
            <label style={{ fontSize: '0.9rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>
              Ou insira um valor personalizado:
            </label>
            <div style={{ position: 'relative' }}>
              <Euro size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                type="number"
                min="1"
                step="0.01"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  borderRadius: 12,
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem',
                  background: '#fafafa',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Message/Description */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: '#1a0a3e', 
            marginBottom: '0.5rem' 
          }}>
            💬 Mensagem (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escreva uma mensagem de coração ou o motivo da sua oferta..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 12,
              border: '2px solid #e0e0e0',
              fontSize: '0.95rem',
              background: '#fafafa',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Donation Button */}
        <button
          onClick={handleDonation}
          disabled={processing || (!selectedAmount && !customAmount) || !selectedPastor}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 16,
            border: 'none',
            background: processing || (!selectedAmount && !customAmount) || !selectedPastor
              ? '#ccc' 
              : 'linear-gradient(135deg, #8e44ad, #9b59b6)',
            color: '#fff',
            fontSize: '1.1rem',
            fontWeight: 700,
            cursor: processing || (!selectedAmount && !customAmount) || !selectedPastor ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: processing || (!selectedAmount && !customAmount) || !selectedPastor
              ? 'none'
              : '0 4px 20px rgba(142, 68, 173, 0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          {processing ? (
            <>
              <Loader size={20} className="spinner" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard size={20} />
              Doar €{selectedAmount || customAmount || 0} com Cartão
            </>
          )}
        </button>

        {/* Info Box */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.1), rgba(138, 43, 226, 0.1))',
          borderRadius: 12,
          border: '1px solid rgba(218, 165, 32, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <Gift size={18} style={{ color: '#daa520' }} />
            <span style={{ fontWeight: 600, color: '#1a0a3e' }}>Informações sobre a doação:</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#666' }}>
            <li>🔒 Pagamento 100% seguro via Stripe</li>
            <li>💳 Aceita cartões de crédito e débito</li>
            <li>📧 Você receberá um recibo por email</li>
            <li>🙏 Sua doação será direcionada para o pastor selecionado</li>
          </ul>
        </div>
      </div>
    </div>
  );
}