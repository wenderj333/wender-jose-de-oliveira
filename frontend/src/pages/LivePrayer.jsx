import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import PrayerBubbles from '../components/PrayerBubbles';
import PastorPrayingOverlay from '../components/PastorPrayingOverlay';
import { Radio, HandHeart, Church, Eye, EyeOff } from 'lucide-react';

const DEMO_SESSIONS = [
  {
    id: 'demo-1',
    church_name: 'Igreja Batista Central',
    pastor_name: 'Roberto Almeida',
    prayer_focus: 'Orando pelas famílias da comunidade',
  },
  {
    id: 'demo-2',
    church_name: 'Assembleia de Deus - Madureira',
    pastor_name: 'Carlos Eduardo',
    prayer_focus: 'Orando pelos enfermos',
  },
  {
    id: 'demo-3',
    church_name: 'Comunidade da Graça',
    pastor_name: 'André Mendes',
    prayer_focus: 'Intercessão pela nação',
  },
];

export default function LivePrayer() {
  const { user } = useAuth();
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
    send({
      type: 'pastor_start_praying',
      pastorId: user.id,
      churchId: user.churchId,
      churchName: 'Minha Igreja',
      pastorName: user.full_name,
      prayerFocus,
    });
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
        <Radio size={24} style={{ color: 'var(--primary)' }} /> Oração ao Vivo
      </h2>

      <div className="live-counter" style={{ color: 'var(--primary-dark)', WebkitTextFillColor: 'var(--primary-dark)', background: 'none' }}>
        <span style={{ color: 'var(--primary-dark)', WebkitTextFillColor: 'var(--primary-dark)' }}>{churchCount}</span>
        <br />
        {churchCount === 1 ? 'igreja orando' : 'igrejas orando'} neste momento
      </div>

      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <button className="btn btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => setShowOverlay(!showOverlay)}>
          {showOverlay ? <><EyeOff size={16} /> Fechar Overlay</> : <><Eye size={16} /> Ver Oração Imersiva</>}
        </button>
      </div>

      {isPastor && (
        <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <h3 style={{ color: 'var(--green-dark)', marginBottom: '1rem' }}>Painel do Pastor</h3>
          {!isPraying ? (
            <>
              <div className="form-group">
                <label>Foco da oração (opcional)</label>
                <input
                  value={prayerFocus}
                  onChange={(e) => setPrayerFocus(e.target.value)}
                  placeholder="Ex: Orando pelas famílias"
                />
              </div>
              <button className="btn btn-green btn-lg" style={{ width: '100%' }} onClick={startPraying}>
                <HandHeart size={20} /> Iniciar Oração ao Vivo
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className="praying-pulse-icon">
                <HandHeart size={48} style={{ color: 'var(--green)' }} />
              </div>
              <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: '1.2rem', margin: '1rem 0' }}>
                Você está orando ao vivo...
              </p>
              <button className="btn btn-primary" onClick={stopPraying}>
                Encerrar Oração
              </button>
            </div>
          )}
        </div>
      )}

      {liveSessions.length > 0 && (
        <>
          <h3 style={{ color: 'var(--primary-dark)', margin: '2rem 0 1rem' }}>Pastores orando agora:</h3>
          <div className="live-sessions">
            {liveSessions.map((session) => (
              <div key={session.id} className="live-session-card" onClick={() => setShowOverlay(true)}>
                <h3>{session.church_name || session.churchName}</h3>
                <p>Pastor {session.pastor_name || session.pastorName}</p>
                {(session.prayer_focus || session.prayerFocus) && (
                  <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>"{session.prayer_focus || session.prayerFocus}"</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {liveSessions.length === 0 && (
        <div className="card" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
          <Church size={48} style={{ color: 'var(--gray-200)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--gray-500)', marginTop: '1rem' }}>
            Nenhum pastor orando ao vivo neste momento.<br />
            Volte em breve!
          </p>
        </div>
      )}

      <PrayerBubbles sessions={liveSessions} />

      {showOverlay && (
        <PastorPrayingOverlay
          sessions={liveSessions}
          totalCount={churchCount}
          onClose={() => setShowOverlay(false)}
        />
      )}
    </div>
  );
}
