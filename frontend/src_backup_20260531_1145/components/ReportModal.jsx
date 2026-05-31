import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

const REASONS = [
  { value: 'inappropriate', icon: '🚫' },
  { value: 'disrespectful', icon: '😡' },
  { value: 'spam', icon: '📢' },
  { value: 'harassment', icon: '😰' },
  { value: 'other', icon: '❓' },
];

export default function ReportModal({ type, targetId, targetName, onClose }) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    setError('');
    try {
      const body = { reason, description };
      if (type === 'user') body.reported_user_id = targetId;
      if (type === 'post') body.reported_post_id = targetId;

      const res = await fetch(`${API}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 3000, padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--card, #fff)', borderRadius: 20, padding: 24,
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        border: '1px solid var(--border, #e2e8f0)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: 'var(--text, #1a1a2e)', fontWeight: 700 }}>
            🚩 {t('report.title')} {targetName ? `— ${targetName}` : ''}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#888' }}>
          {t('report.subtitle')} ✝️
        </p>

        {sent ? (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ fontWeight: 700, color: '#2e7d32', fontSize: 15, margin: '0 0 20px' }}>
              {t('report.sent')}
            </p>
            <button onClick={onClose} style={{
              padding: '10px 24px', borderRadius: 12, border: 'none',
              background: 'var(--fb, #4a80d4)', color: '#fff', fontWeight: 700, cursor: 'pointer',
            }}>
              {t('report.cancel')}
            </button>
          </div>
        ) : (
          <>
            {/* Reason radios */}
            <div style={{ marginBottom: 16 }}>
              {REASONS.map(r => (
                <label key={r.value} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                  background: reason === r.value ? 'rgba(74,128,212,0.08)' : 'transparent',
                  border: reason === r.value ? '1.5px solid var(--fb, #4a80d4)' : '1.5px solid transparent',
                  marginBottom: 6, transition: 'all 0.15s',
                }}>
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    style={{ accentColor: 'var(--fb, #4a80d4)' }}
                  />
                  <span style={{ fontSize: 18 }}>{r.icon}</span>
                  <span style={{ fontSize: 14, color: 'var(--text, #333)', fontWeight: reason === r.value ? 600 : 400 }}>
                    {t(`report.${r.value}`)}
                  </span>
                </label>
              ))}
            </div>

            {/* Description */}
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('report.descPlaceholder')}
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                border: '1px solid var(--border, #e2e8f0)', fontSize: 14,
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                background: 'var(--bg, #f8f9fa)', color: 'var(--text, #333)',
                fontFamily: 'inherit', marginBottom: 16,
              }}
            />

            {error && (
              <p style={{ color: '#e11d48', fontSize: 13, marginBottom: 12 }}>{error}</p>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: 12, borderRadius: 12,
                border: '1px solid var(--border, #e2e8f0)',
                background: 'var(--bg, #f8f9fa)', color: 'var(--text, #555)',
                fontWeight: 600, cursor: 'pointer', fontSize: 14,
              }}>
                {t('report.cancel')}
              </button>
              <button onClick={handleSubmit} disabled={!reason || submitting} style={{
                flex: 2, padding: 12, borderRadius: 12, border: 'none',
                background: reason && !submitting ? 'var(--fb, #4a80d4)' : '#ccc',
                color: '#fff', fontWeight: 700, cursor: reason && !submitting ? 'pointer' : 'not-allowed',
                fontSize: 14,
              }}>
                {submitting ? '...' : t('report.send')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
