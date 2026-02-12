import React, { useEffect, useState } from 'react';
import { Church } from 'lucide-react';

const CHURCH_NAMES = [
  'Igreja Batista Central',
  'Assembleia de Deus',
  'Igreja Presbiteriana',
  'Comunidade da Graça',
  'Igreja Metodista',
  'Igreja do Evangelho Pleno',
  'Comunidade Cristã',
  'Igreja Adventista',
];

export default function PrayerBubbles({ sessions = [] }) {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    if (sessions.length === 0) return;

    const interval = setInterval(() => {
      const names = sessions.length > 0
        ? sessions.map(s => s.church_name || s.churchName)
        : CHURCH_NAMES;

      const name = names[Math.floor(Math.random() * names.length)];
      const id = Date.now() + Math.random();
      const left = 5 + Math.random() * 85;
      const duration = 8 + Math.random() * 7;
      const drift = -30 + Math.random() * 60;

      setBubbles(prev => [...prev.slice(-15), { id, name, left, duration, drift }]);
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [sessions]);

  if (sessions.length === 0) return null;

  return (
    <div className="bubbles-container">
      {bubbles.map(b => (
        <div
          key={b.id}
          className="prayer-bubble"
          style={{
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            '--drift': `${b.drift}px`,
          }}
        >
          <Church size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {b.name}
        </div>
      ))}
    </div>
  );
}
