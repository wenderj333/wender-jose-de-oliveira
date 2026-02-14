import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import PrayerBubbles from '../components/PrayerBubbles';
import PastorPrayingOverlay from '../components/PastorPrayingOverlay';
import { Radio, HandHeart, Church, Eye, EyeOff } from 'lucide-react';

const DEMO_SESSIONS = [
  { id: 'demo-1', church_name: 'Igreja Batista Central', pastor_name: 'Roberto Almeida', prayer_focus: 'Orando pelas famílias da comunidade' },
  { id: 'demo-2', church_name: 'Assembleia de Deus - Madureira', pastor_name: 'Carlos Eduardo', prayer_focus: 'Orando pelos enfermos' },
  { id: 'demo-3', church_name: 'Comunidade da Graça', pastor_name: 'André Mendes', prayer_focus: 'Intercessão pela nação' },
];

export default function LivePrayer() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { liveSessions: wsSessions, totalChurchesPraying, send } = useWebSocket();
  const [isPraying, setIsPraying] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [prayerFocus, setPrayerFocus] = useState('');
  const [demoMode, setDemoMode] = useState(true);

  const isPastor = user?.role === 'pastor' || user?.role === 'admin';
  const liveSessions = demoMode && wsSessions.length === 0 ? DEMO_SESSIONS : wsSessions;
  const churchCount = demoMode && totalChurchesPraying === 0 ? DEMO_SESSIONS.length : totalChurchesPraying;

  const startPraying = () => {
    send({ type: 'pastor_start_praying', pastorId: user.id, churchId: user.churchId, churchName: 'Minha Igreja', pastorName: user.full_name, prayerFocus });
    setIsPraying(true);
  };

  const stopPraying = () => {
    send({ type: 'pastor_stop_praying', sessionId });
    setIsPraying(false);
    setSessionId(null);
  };

  return (
    <div className="live-prayer-page">
      <h2 className="live-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary-dark)' }}>
        <Radio size={24} style={{ color: 'var(--primary)' }} /> {t('livePrayer.title')}
      </h2>

      <div className="live-counter" style={{ color: 'var(--primary-dark)', WebkitTextFillColor: 'var(--primary-dark)', background: 'none' }}>
        <span style={{ color: 'var(--primary-dark)', WebkitTextFillColor: 'var(--primary-dark)' }}>{churchCount}</span>
        <br />
        {t('livePrayer.churchPraying', { count: churchCount })} {t('livePrayer.rightNow')}
      </div>

      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <button className="btn btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => setShowOverlay(!showOverlay)}>
          {showOverlay ? <><EyeOff size={16} /> {t('livePrayer.closeOverlay')}</> : <><Eye size={16} /> {t('livePrayer.immersiveView')}</>}
        </button>
      </div>

      {isPastor && (
        <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <h3 style={{ color: 'var(--green-dark)', marginBottom: '1rem' }}>{t('livePrayer.pastorPanel')}</h3>
          {!isPraying ? (
            <>
              <div className="form-group">
                <label>{t('livePrayer.focusOptional')}</label>
                <input value={prayerFocus} onChange={(e) => setPrayerFocus(e.target.value)} placeholder={t('livePrayer.focusPlaceholder')} />
              </div>
              <button className="btn btn-green btn-lg" style={{ width: '100%' }} onClick={startPraying}>
                <HandHeart size={20} /> {t('livePrayer.startLive')}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className="praying-pulse-icon"><HandHeart size={48} style={{ color: 'var(--green)' }} /></div>
              <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: '1.2rem', margin: '1rem 0' }}>{t('livePrayer.prayingLive')}</p>
              <button className="btn btn-primary" onClick={stopPraying}>{t('livePrayer.endPrayer')}</button>
            </div>
          )}
        </div>
      )}

      {liveSessions.length > 0 && (
        <>
          <h3 style={{ color: 'var(--primary-dark)', margin: '2rem 0 1rem' }}>{t('livePrayer.pastorsPraying')}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {liveSessions.map((session) => (
              <div key={session.id} onClick={() => setShowOverlay(true)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                cursor: 'pointer', padding: '1rem', minWidth: 120,
              }}>
                {/* Green pulsing ball */}
                <div style={{
                  position: 'relative', width: 70, height: 70, borderRadius: '50%',
                  background: 'radial-gradient(circle, #4caf50, #2e7d32)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(76,175,80,0.6)',
                  animation: 'greenPulse 2s ease-in-out infinite',
                }}>
                  <HandHeart size={28} color="#fff" />
                  {/* Online dot */}
                  <div style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#00e676', border: '2.5px solid #fff',
                    boxShadow: '0 0 8px rgba(0,230,118,0.8)',
                  }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e' }}>
                    {session.pastor_name || session.pastorName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#4caf50', fontWeight: 600 }}>
                    🟢 En Vivo
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#666', marginTop: 2 }}>
                    {session.church_name || session.churchName}
                  </div>
                  {(session.prayer_focus || session.prayerFocus) && (
                    <div style={{ fontSize: '0.7rem', color: '#999', fontStyle: 'italic', marginTop: 2 }}>
                      "{session.prayer_focus || session.prayerFocus}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {liveSessions.length === 0 && (
        <div className="card" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
          <Church size={48} style={{ color: 'var(--gray-200)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--gray-500)', marginTop: '1rem' }}>
            {t('livePrayer.noPastors')}<br />{t('livePrayer.comeBack')}
          </p>
        </div>
      )}

      <PrayerBubbles sessions={liveSessions} />

      {showOverlay && (
        <PastorPrayingOverlay sessions={liveSessions} totalCount={churchCount} onClose={() => setShowOverlay(false)} />
      )}
    </div>
  );
}
