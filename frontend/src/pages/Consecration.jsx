import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Flame, ChevronDown, ChevronUp } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

const BENEFITS = [
  {
    title: '🕊️ BENEFÍCIOS ESPIRITUAIS',
    items: [
      { icon: '🔥', text: 'Fortalece o espírito e submete a carne', verse: '"Mas esmurro o meu corpo e o reduzo à servidão." — 1 Coríntios 9:27' },
      { icon: '🧭', text: 'Direção e revelação de Deus', verse: '"Jejuamos, pois, e pedimos isso ao nosso Deus, e Ele nos ouviu." — Esdras 8:23' },
      { icon: '🛡️', text: 'Quebra de opressões espirituais', verse: '"Porventura não é este o jejum que escolhi?" — Isaías 58:6' },
      { icon: '🙏', text: 'Intimidade com Deus', verse: '"Quando jejuares… teu Pai, que vê em secreto, te recompensará." — Mateus 6:17–18' },
    ],
  },
  {
    title: '🧠 BENEFÍCIOS PARA A MENTE',
    items: [
      { icon: '🧘', text: 'Humilhação da alma e paz interior', verse: '"Humilhei a minha alma com o jejum." — Salmos 35:13' },
      { icon: '🎯', text: 'Domínio próprio', verse: '"Melhor é o que domina o seu espírito do que o que conquista uma cidade." — Provérbios 16:32' },
      { icon: '🧠', text: 'Renovação da mente', verse: '"Transformai-vos pela renovação do vosso entendimento." — Romanos 12:2' },
    ],
  },
  {
    title: '💪 BENEFÍCIOS PARA O CORPO',
    items: [
      { icon: '♻️', text: 'Purificação e renovação', verse: '"Purifiquemo-nos de toda impureza da carne e do espírito." — 2 Coríntios 7:1' },
      { icon: '🛡️', text: 'O corpo como templo', verse: '"Vosso corpo é templo do Espírito Santo." — 1 Coríntios 6:19' },
      { icon: '🔥', text: 'Disciplina física com propósito eterno', verse: '"O exercício físico é de pouco proveito, mas a piedade é proveitosa para tudo." — 1 Timóteo 4:8' },
    ],
  },
  {
    title: '🍞 QUEBRA DO JEJUM',
    items: [
      { icon: '🥣', text: 'Com simplicidade e gratidão', verse: '"E, tomando o pão, deu graças." — Lucas 22:19' },
      { icon: '📖', text: 'Tudo para a glória de Deus', verse: '"Quer comais, quer bebais, fazei tudo para a glória de Deus." — 1 Coríntios 10:31' },
    ],
  },
];

export default function Consecration() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totalConsecrations: 0, activeFasting: 0 });
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showBenefits, setShowBenefits] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

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

  // Generate fire bubbles based on active fasting count
  const bubbleCount = Math.min(Math.max(stats.activeFasting * 3, 6), 30);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem', minHeight: '80vh', position: 'relative', overflow: 'hidden' }}>

      {/* Animated fire bubbles background */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(bubbleCount)].map((_, i) => {
          const w = 10 + (i % 5) * 5;
          return (
            <span key={i} style={{
              position: 'absolute',
              bottom: '-20px',
              left: `${5 + (i * 97 / bubbleCount) % 90}%`,
              width: `${w}px`,
              height: `${w * 1.5}px`,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              background: i % 4 === 0 ? 'radial-gradient(ellipse at bottom, #fff700 0%, #ff9500 30%, #ff4500 60%, #cc000088 100%)' 
                : i % 4 === 1 ? 'radial-gradient(ellipse at bottom, #ffe066 0%, #ffaa00 30%, #ff6600 60%, #dd330088 100%)'
                : i % 4 === 2 ? 'radial-gradient(ellipse at bottom, #ffcc33 0%, #ff7700 30%, #ff3300 60%, #aa000088 100%)'
                : 'radial-gradient(ellipse at bottom, #ffdd44 0%, #ffbb00 30%, #ff5500 60%, #cc220088 100%)',
              opacity: 0.9,
              animation: `fireBubbleRise ${12 + (i % 4) * 1.5}s ease-in-out infinite`,
              animationDelay: `${(i * 0.8) % 12}s`,
              boxShadow: `0 0 ${8 + (i % 4) * 5}px ${i % 2 === 0 ? '#ffaa00' : '#ff6600'}, 0 0 ${12 + (i % 3) * 6}px ${i % 2 === 0 ? '#ff660066' : '#ffcc0066'}`,
              filter: 'brightness(1.3)',
            }} />
          );
        })}
      </div>

      <style>{`
        @keyframes fireBubbleRise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.7; }
          50% { opacity: 0.5; transform: translateY(-40vh) scale(0.8); }
          100% { transform: translateY(-90vh) scale(0.3); opacity: 0; }
        }
        @keyframes pulseBtn { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
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
            🔥 O Poder do Jejum
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
            O jejum é uma das armas espirituais mais poderosas que Deus nos deu. Não é apenas abster-se de comida 
            — é render-se inteiramente a Deus, buscando Sua presença e Sua vontade acima de tudo.
          </p>
          <p style={{ fontSize: '0.82rem', color: '#555', fontStyle: 'italic', margin: '0 0 0.4rem', textAlign: 'center' }}>
            📖 "Quando jejuares, unge a tua cabeça e lava o teu rosto, para não pareceres aos homens que jejuas... 
            e teu Pai, que vê em secreto, te recompensará." — Mateus 6:17-18
          </p>
          <p style={{ fontSize: '0.82rem', color: '#555', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
            📖 "Convertei-vos a mim de todo o vosso coração; e isso com jejuns, com choro e com pranto." — Joel 2:12
          </p>
        </div>

        {/* Toggle Button - smaller */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <button onClick={handleToggle} disabled={toggling} style={{
            width: 140, height: 140, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: isActive
              ? 'radial-gradient(circle, #ff3300, #ff6600, #ffcc00)'
              : 'radial-gradient(circle, #1a0a3e, #4a1a8e)',
            color: '#fff', fontSize: '0.85rem', fontWeight: 700,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: isActive
              ? '0 0 30px rgba(255, 102, 0, 0.6), 0 0 60px rgba(255, 51, 0, 0.3)'
              : '0 4px 15px rgba(26, 10, 62, 0.3)',
            transition: 'all 0.5s ease',
            animation: isActive ? 'pulseBtn 2s ease-in-out infinite' : 'none',
          }}>
            <Flame size={32} />
            {isActive ? '🔥 Consagrando' : 'Consagrar'}
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#888', marginBottom: '1.5rem' }}>
          {isActive ? 'Toque para desativar' : 'Toque para ativar sua consagração'}
        </p>

        {/* Stats - smaller, below text */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #ff6600, #ff3300)', borderRadius: 14, padding: '0.7rem 1rem', color: '#fff', textAlign: 'center', flex: 1, maxWidth: 120 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>🔥 {stats.totalConsecrations}</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>Total</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #daa520, #b8860b)', borderRadius: 14, padding: '0.7rem 1rem', color: '#fff', textAlign: 'center', flex: 1, maxWidth: 120 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>🙏 {stats.activeFasting}</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>Jejuando agora</div>
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
            📖 Benefícios do Jejum {showBenefits ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
                🔑 O jejum: Não é dieta. Não é sacrifício vazio. É obediência, alinhamento e dependência de Deus.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
