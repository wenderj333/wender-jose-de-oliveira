import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Flame, ChevronDown, ChevronUp } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

// BENEFITS is built inside the component now to use t() for i18n
// This allows translation of benefit titles and descriptions

export default function Consecration() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totalConsecrations: 0, activeFasting: 0 });
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showBenefits, setShowBenefits] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  // Build BENEFITS array using i18n keys
  const BENEFITS = [
    {
      title: '🕊️ ' + t('consecration.spiritualBenefits'),
      items: [
        { icon: '🔥', text: t('consecration.spiritualStrength'), verse: '"Mas esmurro o meu corpo e o reduzo à servidão." — 1 Coríntios 9:27' },
        { icon: '🧭', text: t('consecration.godDirection'), verse: '"Jejuamos, pois, e pedimos isso ao nosso Deus, e Ele nos ouviu." — Esdras 8:23' },
        { icon: '🛡️', text: t('consecration.breakOppression'), verse: '"Porventura não é este o jejum que escolhi?" — Isaías 58:6' },
        { icon: '🙏', text: t('consecration.intimacy'), verse: '"Quando jejuares… teu Pai, que vê em secreto, te recompensará." — Mateus 6:17–18' },
      ],
    },
    {
      title: '🧠 ' + t('consecration.mentalBenefits'),
      items: [
        { icon: '🧘', text: t('consecration.mentalHumility'), verse: '"Humilhei a minha alma com o jejum." — Salmos 35:13' },
        { icon: '🎯', text: t('consecration.selfControl'), verse: '"Melhor é o que domina o seu espírito do que o que conquista uma cidade." — Provérbios 16:32' },
        { icon: '🧠', text: t('consecration.mindRenewal'), verse: '"Transformai-vos pela renovação do vosso entendimento." — Romanos 12:2' },
      ],
    },
    {
      title: '💪 ' + t('consecration.physicalBenefits'),
      items: [
        { icon: '♻️', text: t('consecration.purification'), verse: '"Purifiquemo-nos de toda impureza da carne e do espírito." — 2 Coríntios 7:1' },
        { icon: '🛡️', text: t('consecration.templeBody'), verse: '"Vosso corpo é templo do Espírito Santo." — 1 Coríntios 6:19' },
        { icon: '🔥', text: t('consecration.disciplineFaith'), verse: '"O exercício físico é de pouco proveito, mas a piedade é proveitosa para tudo." — 1 Timóteo 4:8' },
      ],
    },
    {
      title: '🍞 ' + t('consecration.breakFasting'),
      items: [
        { icon: '🥣', text: t('consecration.breakSimplicity'), verse: '"E, tomando o pão, deu graças." — Lucas 22:19' },
        { icon: '📖', text: t('consecration.breakGlory'), verse: '"Quer comais, quer bebais, fazei tudo para a glória de Deus." — 1 Coríntios 10:31' },
      ],
    },
  ];

  useEffect(() => {
    fetchStats();
    if (token) fetchStatus();
  }, [token]);

  async function fetchStats() {
    try {
      const res = await fetch(`${API}/consecration/stats`);
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) setStats(data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchStatus() {
    try {
      const res = await fetch(`${API}/consecration/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsActive(data.active);
      }
    } catch (err) { console.error(err); }
  }

  async function handleToggle() {
    if (!user) { alert(t('consecration.loginRequired')); return; }
    if (toggling) return;
    setToggling(true);
    try {
      const res = await fetch(`${API}/consecration/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setIsActive(data.active);
        fetchStats();
      }
    } catch (err) { console.error(err); }
    finally { setTimeout(() => setToggling(false), 500); }
  }

  // Each person consecrating = 1 flame! More people = more fire!
  const bubbleCount = Math.min(Math.max(stats.activeFasting * 5, 8), 60);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem', minHeight: '80vh', position: 'relative', overflow: 'hidden' }}>

      {/* Animated fire bubbles background */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(bubbleCount)].map((_, i) => {
          const w = 12 + (i % 6) * 6;
          const speed = 8 + (i % 5) * 1.5; // faster flames
          const colors = [
            'radial-gradient(ellipse at bottom, #fff700 0%, #ff9500 25%, #ff4500 55%, #cc0000aa 100%)',
            'radial-gradient(ellipse at bottom, #ffe066 0%, #ffaa00 25%, #ff6600 55%, #dd3300aa 100%)',
            'radial-gradient(ellipse at bottom, #ffcc33 0%, #ff7700 25%, #ff3300 55%, #aa0000aa 100%)',
            'radial-gradient(ellipse at bottom, #ffdd44 0%, #ffbb00 25%, #ff5500 55%, #cc2200aa 100%)',
            'radial-gradient(ellipse at bottom, #ffffff 0%, #ffee00 20%, #ff8800 50%, #ff3300aa 100%)',
          ];
          return (
            <span key={i} style={{
              position: 'absolute',
              bottom: '-20px',
              left: `${3 + (i * 94 / bubbleCount) % 94}%`,
              width: `${w}px`,
              height: `${w * 1.6}px`,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              background: colors[i % colors.length],
              opacity: 0.95,
              animation: `fireBubbleRise ${speed}s ease-in-out infinite, flicker ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
              animationDelay: `${(i * 0.5) % speed}s`,
              boxShadow: `0 0 ${10 + (i % 5) * 6}px ${i % 2 === 0 ? '#ffaa00' : '#ff6600'}, 0 0 ${15 + (i % 4) * 8}px ${i % 2 === 0 ? '#ff660088' : '#ffcc0088'}`,
              filter: 'brightness(1.4)',
            }} />
          );
        })}
      </div>

      <style>{`
        @keyframes fireBubbleRise {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
          5% { opacity: 0.9; }
          25% { opacity: 0.8; transform: translateY(-20vh) scale(0.95) rotate(5deg); }
          50% { opacity: 0.6; transform: translateY(-45vh) scale(0.7) rotate(-3deg); }
          75% { opacity: 0.3; transform: translateY(-70vh) scale(0.5) rotate(4deg); }
          100% { transform: translateY(-95vh) scale(0.2) rotate(0deg); opacity: 0; }
        }
        @keyframes pulseBtn { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes flicker { 0%,100% { opacity: 0.85; } 50% { opacity: 1; } }
        @keyframes innerFlame {
          0% { transform: translateX(-50%) scaleX(1) scaleY(1); opacity: 0.4; }
          30% { transform: translateX(-48%) scaleX(1.1) scaleY(1.05); opacity: 0.6; }
          60% { transform: translateX(-52%) scaleX(0.9) scaleY(1.1); opacity: 0.5; }
          100% { transform: translateX(-50%) scaleX(1.05) scaleY(0.95); opacity: 0.55; }
        }
      `}</style>

      {/* Content (above bubbles) */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.4rem', color: '#1a0a3e', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Flame size={24} color="#ff6600" /> {t('consecration.title')}
          </h1>
          <p style={{ color: '#666', fontSize: '0.8rem', margin: '0.4rem 0 0' }}>
            {t('consecration.subtitle')}
          </p>
        </div>

        {/* Texto explicativo sobre o jejum */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(26,10,62,0.04), rgba(218,165,32,0.08))',
          borderRadius: 16, padding: '1.2rem', marginBottom: '1.5rem',
          border: '1px solid rgba(218,165,32,0.2)',
        }}>
          <h3 style={{ fontSize: '1rem', color: '#1a0a3e', margin: '0 0 0.5rem', textAlign: 'center' }}>
            🔥 {t('consecration.powerOfFasting')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
            {t('consecration.powerDesc')}
          </p>
          <p style={{ fontSize: '0.82rem', color: '#555', fontStyle: 'italic', margin: '0 0 0.4rem', textAlign: 'center' }}>
            📖 "Quando jejuares, unge a tua cabeça e lava o teu rosto, para não pareceres aos homens que jejuas... 
            e teu Pai, que vê em secreto, te recompensará." — Mateus 6:17-18
          </p>
          <p style={{ fontSize: '0.82rem', color: '#555', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
            📖 "Convertei-vos a mim de todo o vosso coração; e isso com jejuns, com choro e com pranto." — Joel 2:12
          </p>
        </div>

        {/* ===== COMO FUNCIONA — Explicação clara ===== */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1rem', marginBottom: '1.25rem',
          border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ fontSize: '0.95rem', color: '#1a0a3e', margin: '0 0 0.6rem', textAlign: 'center' }}>
            📋 {t('consecration.howWorks')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', background: '#4caf50', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
              }}>1</span>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#444', lineHeight: 1.5 }}>
                <strong>{t('consecration.beginFasting')}:</strong> {t('consecration.beginFastingDesc')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', background: '#ff6600', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
              }}>2</span>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#444', lineHeight: 1.5 }}>
                <strong>{t('consecration.flameRises')}:</strong> {t('consecration.flameRisesDesc')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', background: '#e74c3c', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
              }}>3</span>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#444', lineHeight: 1.5 }}>
                <strong>{t('consecration.endFasting')}:</strong> {t('consecration.endFastingDesc')}
              </p>
            </div>
          </div>
          <div style={{
            marginTop: '0.8rem', padding: '0.6rem', borderRadius: 10,
            background: 'rgba(255,102,0,0.08)', border: '1px solid rgba(255,102,0,0.2)', textAlign: 'center',
          }}>
            <span style={{ fontSize: '0.78rem', color: '#cc5500' }}>
              🔥 {t('consecration.morePeople')}
            </span>
          </div>
        </div>

        {/* ===== TOGGLE BUTTON — com chama de fogo interna ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button onClick={handleToggle} disabled={toggling} style={{
            width: 170, height: 170, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: isActive
              ? 'radial-gradient(circle at 50% 70%, #fff700 0%, #ff9500 20%, #ff4500 45%, #cc0000 70%, #880000 100%)'
              : 'radial-gradient(circle, #1a0a3e, #4a1a8e)',
            color: '#fff', fontSize: '0.9rem', fontWeight: 700,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            boxShadow: isActive
              ? '0 0 50px rgba(255, 102, 0, 0.8), 0 0 100px rgba(255, 51, 0, 0.5), inset 0 0 40px rgba(255,200,0,0.3)'
              : '0 4px 20px rgba(26, 10, 62, 0.3)',
            transition: 'all 0.5s ease',
            animation: isActive ? 'pulseBtn 2s ease-in-out infinite' : 'none',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Inner flame effect */}
            {isActive && (
              <>
                <span style={{
                  position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
                  width: 60, height: 90,
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  background: 'radial-gradient(ellipse at bottom, #fff700 0%, #ffaa00 30%, #ff4500 60%, transparent 100%)',
                  animation: 'innerFlame 1.5s ease-in-out infinite alternate',
                  opacity: 0.6, filter: 'blur(3px)',
                }} />
                <span style={{
                  position: 'absolute', bottom: '15%', left: '45%', transform: 'translateX(-50%)',
                  width: 35, height: 55,
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  background: 'radial-gradient(ellipse at bottom, #ffffff 0%, #ffe066 30%, #ff6600 70%, transparent 100%)',
                  animation: 'innerFlame 1.2s ease-in-out infinite alternate-reverse',
                  opacity: 0.5, filter: 'blur(2px)',
                }} />
                <span style={{
                  position: 'absolute', bottom: '12%', left: '55%', transform: 'translateX(-50%)',
                  width: 28, height: 45,
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  background: 'radial-gradient(ellipse at bottom, #fff 0%, #ffcc00 40%, #ff3300 80%, transparent 100%)',
                  animation: 'innerFlame 1s ease-in-out infinite alternate',
                  opacity: 0.4, filter: 'blur(2px)',
                }} />
              </>
            )}
            <span style={{ position: 'relative', zIndex: 2, textShadow: isActive ? '0 0 10px rgba(255,200,0,0.8)' : 'none' }}>
              <Flame size={44} />
            </span>
            <span style={{ position: 'relative', zIndex: 2, textShadow: isActive ? '0 0 10px rgba(255,200,0,0.8)' : 'none', fontSize: '0.95rem' }}>
              {isActive ? t('consecration.consecrating') : t('consecration.startButton')}
            </span>
          </button>
          <div style={{
            marginTop: 10, padding: '0.5rem 1rem', borderRadius: 20,
            background: isActive ? 'rgba(255,102,0,0.1)' : 'rgba(26,10,62,0.05)',
            border: isActive ? '1px solid rgba(255,102,0,0.3)' : '1px solid rgba(26,10,62,0.1)',
          }}>
            <p style={{ margin: 0, textAlign: 'center', fontSize: '0.82rem', fontWeight: 600, color: isActive ? '#cc5500' : '#666' }}>
              {isActive
                ? '✅ ' + t('consecration.currentlyConsecrating')
                : '👆 ' + t('consecration.touchButton')}
            </p>
          </div>
        </div>

        {/* ===== STATS — explicativos ===== */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6600, #ff3300)', borderRadius: 14,
            padding: '0.8rem 1rem', color: '#fff', textAlign: 'center', flex: 1, maxWidth: 160,
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>🔥 {stats.totalConsecrations}</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.95, fontWeight: 600 }}>{t('consecration.totalCount')}</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 2 }}>{t('consecration.totalCountDesc')}</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #daa520, #b8860b)', borderRadius: 14,
            padding: '0.8rem 1rem', color: '#fff', textAlign: 'center', flex: 1, maxWidth: 160,
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>🙏 {stats.activeFasting}</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.95, fontWeight: 600 }}>{t('consecration.activeFasting')}</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 2 }}>{t('consecration.activeFastingDesc')}</div>
          </div>
        </div>

        {/* Benefits button */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <button onClick={() => setShowBenefits(!showBenefits)} style={{
            padding: '0.6rem 1.2rem', borderRadius: 25, border: '2px solid #daa520',
            background: showBenefits ? '#daa520' : 'transparent',
            color: showBenefits ? '#fff' : '#daa520',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            📖 {t('consecration.benefitsTitle')} {showBenefits ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Benefits accordion */}
        {showBenefits && (
          <div style={{ marginBottom: '1.5rem' }}>
            {BENEFITS.map((section, si) => (
              <div key={si} style={{ marginBottom: 6 }}>
                <button onClick={() => setExpandedSection(expandedSection === si ? null : si)} style={{
                  width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid #eee',
                  background: expandedSection === si ? '#1a0a3e' : '#fff',
                  color: expandedSection === si ? '#fff' : '#1a0a3e',
                  fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  {section.title}
                  {expandedSection === si ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expandedSection === si && (
                  <div style={{ padding: '0.4rem 0.85rem', background: '#fafafa', borderRadius: '0 0 10px 10px' }}>
                    {section.items.map((item, ii) => (
                      <div key={ii} style={{ padding: '0.5rem 0', borderBottom: ii < section.items.length - 1 ? '1px solid #eee' : 'none' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 3 }}>
                          {item.icon} {item.text}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
                          📖 {item.verse}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Conclusão */}
            <div style={{ background: 'linear-gradient(135deg, #1a0a3e, #4a1a8e)', borderRadius: 14, padding: '1rem', color: '#fff', marginTop: 10, textAlign: 'center' }}>
              <p style={{ fontStyle: 'italic', fontSize: '0.85rem', margin: '0 0 6px' }}>
                "Nem só de pão viverá o homem, mas de toda Palavra que sai da boca de Deus." — Mateus 4:4
              </p>
              <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0 }}>
                🔑 {t('consecration.conclusion')}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
