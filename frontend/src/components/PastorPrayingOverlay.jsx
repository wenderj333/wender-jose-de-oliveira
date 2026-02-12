import React from 'react';
import { useTranslation } from 'react-i18next';
import PrayerBubbles from './PrayerBubbles';
import { HandHeart, BookOpen, X } from 'lucide-react';

export default function PastorPrayingOverlay({ sessions, totalCount, onClose }) {
  const { t } = useTranslation();

  return (
    <div className="pastor-overlay">
      <button className="pastor-overlay__close" onClick={onClose}>
        <X size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t('pastorOverlay.close')}
      </button>

      <div className="pastor-overlay__glow">
        <HandHeart size={64} style={{ color: 'var(--gold-light)' }} />
      </div>

      <h2>{t('pastorOverlay.title')}</h2>
      <p style={{ fontSize: '1.2rem', marginBottom: '1rem', opacity: 0.9 }}>
        {t('pastorOverlay.churchesInPrayer', { count: totalCount })}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
        {sessions.map((s) => (
          <div key={s.id} style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            border: '1px solid rgba(218,165,32,0.3)',
          }}>
            <strong style={{ color: 'var(--gold-light)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <BookOpen size={16} /> {s.church_name || s.churchName}
            </strong>
            <span style={{ marginLeft: '0.75rem', opacity: 0.8 }}>
              Pastor {s.pastor_name || s.pastorName}
            </span>
          </div>
        ))}
      </div>

      <PrayerBubbles sessions={sessions} />
    </div>
  );
}
