import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Flame, ChevronDown, ChevronUp, User } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

// Fire particle animation
function FireParticles({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Spawn 30 fire particles
    for (let i = 0; i < 30; i++) {
      particlesRef.current.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 4 + 2),
        size: Math.random() * 8 + 4,
        life: 1,
        decay: Math.random() * 0.015 + 0.005,
        color: Math.random() > 0.5 ? '#ff6600' : Math.random() > 0.5 ? '#ffcc00' : '#ff3300',
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.size *= 0.99;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(animate);
      }
    }
    animate();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} />;
}

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

function timeAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function Consecration() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totalConsecrations: 0, todayFasting: 0, recent: [] });
  const [loading, setLoading] = useState(true);
  const [showFire, setShowFire] = useState(false);
  const [showBenefits, setShowBenefits] = useState(true); // Começa aberto
  const [consecrating, setConsecrating] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => { fetchStats(); }, []);

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

  async function handleConsecrate() {
    if (!user) { alert(t('consecration.loginRequired')); return; }
    if (consecrating) return;
    setConsecrating(true);
    setShowFire(true);
    try {
      await fetch(`${API}/consecration`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'Consagração e jejum' }),
      });
      fetchStats();
    } catch (err) { console.error(err); }
    finally {
      setTimeout(() => { setConsecrating(false); setShowFire(false); }, 3000);
    }
  }

  const getAvatar = (url) => url ? (url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || ''}${url}`) : null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#1a0a3e', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Flame size={28} color="#ff6600" /> {t('consecration.title')}
        </h1>
        <p style={{ color: '#666', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
          {t('consecration.subtitle')}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #ff6600, #ff3300)', borderRadius: 16, padding: '1rem 1.5rem', color: '#fff', textAlign: 'center', flex: 1, maxWidth: 160 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>🔥 {stats.totalConsecrations}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{t('consecration.totalConsecrations')}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #daa520, #b8860b)', borderRadius: 16, padding: '1rem 1.5rem', color: '#fff', textAlign: 'center', flex: 1, maxWidth: 160 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>🙏 {stats.todayFasting}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{t('consecration.fastingToday')}</div>
        </div>
      </div>

      {/* Big Consecrate Button */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <FireParticles active={showFire} />
        <button onClick={handleConsecrate} disabled={consecrating} style={{
          width: 180, height: 180, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: consecrating
            ? 'radial-gradient(circle, #ff3300, #ff6600, #ffcc00)'
            : 'radial-gradient(circle, #1a0a3e, #4a1a8e)',
          color: '#fff', fontSize: '1rem', fontWeight: 700,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: consecrating
            ? '0 0 40px rgba(255, 102, 0, 0.6), 0 0 80px rgba(255, 51, 0, 0.3)'
            : '0 4px 20px rgba(26, 10, 62, 0.3)',
          transition: 'all 0.5s ease',
          animation: consecrating ? 'pulse 0.5s ease-in-out infinite' : 'none',
          zIndex: 5,
        }}>
          <Flame size={40} />
          {consecrating ? `🔥 ${t('consecration.consecrating')}` : t('consecration.imConsecrating')}
        </button>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>

      {/* Benefits button */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <button onClick={() => setShowBenefits(!showBenefits)} style={{
          padding: '0.7rem 1.5rem', borderRadius: 25, border: '2px solid #daa520',
          background: showBenefits ? '#daa520' : 'transparent',
          color: showBenefits ? '#fff' : '#daa520',
          fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          📖 Benefícios do Jejum {showBenefits ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Benefits accordion */}
      {showBenefits && (
        <div style={{ marginBottom: '2rem' }}>
          {BENEFITS.map((section, si) => (
            <div key={si} style={{ marginBottom: 8 }}>
              <button onClick={() => setExpandedSection(expandedSection === si ? null : si)} style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #eee',
                background: expandedSection === si ? '#1a0a3e' : '#fff',
                color: expandedSection === si ? '#fff' : '#1a0a3e',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                {section.title}
                {expandedSection === si ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSection === si && (
                <div style={{ padding: '0.5rem 1rem', background: '#fafafa', borderRadius: '0 0 12px 12px' }}>
                  {section.items.map((item, ii) => (
                    <div key={ii} style={{ padding: '0.6rem 0', borderBottom: ii < section.items.length - 1 ? '1px solid #eee' : 'none' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                        {item.icon} {item.text}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                        📖 {item.verse}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Conclusão */}
          <div style={{ background: 'linear-gradient(135deg, #1a0a3e, #4a1a8e)', borderRadius: 16, padding: '1.2rem', color: '#fff', marginTop: 12, textAlign: 'center' }}>
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', margin: '0 0 8px' }}>
              "Nem só de pão viverá o homem, mas de toda Palavra que sai da boca de Deus." — Mateus 4:4
            </p>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>
              🔑 O jejum: Não é dieta. Não é sacrifício vazio. É obediência, alinhamento e dependência de Deus.
            </p>
          </div>
        </div>
      )}

      {/* Recent consecrations — fire balls */}
      <h3 style={{ color: '#1a0a3e', fontSize: '1rem', marginBottom: '0.75rem' }}>
        🔥 Consagrando agora
      </h3>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>Carregando...</div>
      ) : stats.recent?.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
          {t('consecration.noOneYet')} 🔥
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {stats.recent.map((c, i) => (
            <div key={c.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', overflow: 'hidden',
                background: 'radial-gradient(circle, #ff6600, #ff3300)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 15px rgba(255, 102, 0, 0.5)',
                animation: 'firePulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}>
                {c.avatar_url ? (
                  <img src={getAvatar(c.avatar_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={24} color="#fff" />
                )}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#666', textAlign: 'center', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.full_name?.split(' ')[0]}
              </span>
              <span style={{ fontSize: '0.55rem', color: '#999' }}>{timeAgo(c.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes firePulse {
          0%, 100% { box-shadow: 0 0 10px rgba(255,102,0,0.4); transform: scale(1); }
          50% { box-shadow: 0 0 25px rgba(255,51,0,0.7), 0 0 50px rgba(255,204,0,0.3); transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
