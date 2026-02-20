import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle, Award, Compass, Star, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPrice, getPriceForBackend } from '../utils/regionPricing';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

const THEOLOGY_LESSONS = [
  { id: 1, title: 'Introdu\u00e7\u00e3o \u00e0 Teologia', desc: 'O que \u00e9 teologia e por que todo crist\u00e3o deveria estud\u00e1-la.', icon: '\ud83d\udcda' },
  { id: 2, title: 'A Revela\u00e7\u00e3o de Deus', desc: 'Revela\u00e7\u00e3o geral e especial: como Deus se revela ao homem.', icon: '\ud83c\udf1f' },
  { id: 3, title: 'Bibliologia', desc: 'A doutrina das Escrituras: inspira\u00e7\u00e3o, inerr\u00e2ncia e c\u00e2non.', icon: '\ud83d\udcd6' },
  { id: 4, title: 'Teologia Pr\u00f3pria', desc: 'Os atributos de Deus: onisci\u00eancia, onipot\u00eancia, onipresenca.', icon: '\ud83d\udc51' },
  { id: 5, title: 'A Trindade', desc: 'Pai, Filho e Esp\u00edrito Santo: um s\u00f3 Deus em tr\u00eas pessoas.', icon: '\u2721\ufe0f' },
  { id: 6, title: 'Cristologia I', desc: 'A pessoa de Cristo: natureza divina e humana.', icon: '\u2720\ufe0f' },
  { id: 7, title: 'Cristologia II', desc: 'A obra de Cristo: vida, morte, ressurrei\u00e7\u00e3o e ascens\u00e3o.', icon: '\u271d\ufe0f' },
  { id: 8, title: 'Pneumatologia', desc: 'A doutrina do Esp\u00edrito Santo: pessoa, obra e dons.', icon: '\ud83d\udd4a\ufe0f' },
  { id: 9, title: 'Antropologia B\u00edblica', desc: 'A doutrina do homem: cria\u00e7\u00e3o, queda e imagem de Deus.', icon: '\ud83e\uddd1' },
  { id: 10, title: 'Hamartiologia', desc: 'A doutrina do pecado: origem, natureza e consequ\u00eancias.', icon: '\u26a0\ufe0f' },
  { id: 11, title: 'Soteriologia', desc: 'A doutrina da salva\u00e7\u00e3o: gra\u00e7a, f\u00e9, justifica\u00e7\u00e3o e santifica\u00e7\u00e3o.', icon: '\ud83d\udca1' },
  { id: 12, title: 'Eclesiologia', desc: 'A doutrina da Igreja: natureza, miss\u00e3o e governo.', icon: '\u26ea' },
  { id: 13, title: 'Sacramentos', desc: 'Batismo e Santa Ceia: significado e pr\u00e1tica.', icon: '\ud83c\udf77' },
  { id: 14, title: 'Angelologia', desc: 'Anjos, dem\u00f4nios e a guerra espiritual.', icon: '\ud83d\ude07' },
  { id: 15, title: 'Escatologia I', desc: 'Os \u00faltimos tempos: sinais, tribula\u00e7\u00e3o e arrebatamento.', icon: '\ud83c\udf05' },
  { id: 16, title: 'Escatologia II', desc: 'Mil\u00eanio, ju\u00edzo final e novos c\u00e9us e nova terra.', icon: '\ud83c\udf0d' },
  { id: 17, title: 'Hermen\u00eautica', desc: 'Como interpretar a B\u00edblia corretamente: m\u00e9todos e princ\u00edpios.', icon: '\ud83d\udd0d' },
  { id: 18, title: 'Hist\u00f3ria da Igreja', desc: 'De Atos aos dias de hoje: reformas, avivamentos e movimentos.', icon: '\ud83c\udfdb\ufe0f' },
  { id: 19, title: 'Apologética', desc: 'Defender a f\u00e9 com raz\u00e3o: respostas para as grandes perguntas.', icon: '\ud83d\udee1\ufe0f' },
  { id: 20, title: 'Teologia Pr\u00e1tica', desc: 'Aplicando a teologia no dia a dia, minist\u00e9rio e miss\u00f5es.', icon: '\ud83c\udf0d' },
];

export default function TheologyCourse() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [buying, setBuying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);
  const price = getPrice('theology');

  useEffect(() => {
    if (searchParams.get('paid') === 'success') {
      setPaid(true);
      localStorage.setItem('theology_paid', 'true');
    }
    if (localStorage.getItem('theology_paid') === 'true') setPaid(true);
  }, [searchParams]);

  const handleBuy = async () => {
    setBuying(true);
    try {
      const email = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : prompt('Seu email para receber o curso:');
      if (!email) { setBuying(false); return; }
      const { amount, currency } = getPriceForBackend('theology');
      const res = await fetch(`${API}/course/create-checkout-theology`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amount, currency }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Erro ao iniciar pagamento. Tente novamente.');
    } catch (e) { console.error(e); alert('Erro de conex\u00e3o.'); }
    finally { setBuying(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080c18' }}>
      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1b3e 0%, #1a2a5e 30%, #2a3a7e 60%, #d4af37 100%)',
        padding: '3rem 1.5rem', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 70% 30%, rgba(212,175,55,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{'\ud83c\udf93\ud83d\udcda\u2720\ufe0f'}</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, margin: '0 0 0.5rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Teologia Crist\u00e3
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', opacity: 0.9, maxWidth: 600, margin: '0 auto 1.5rem' }}>
            Aprofunde seu conhecimento teol\u00f3gico e fortale\u00e7a sua f\u00e9 com fundamento
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {['20 Li\u00e7\u00f5es', 'Certificado', 'Acesso Vitalício'].map((label, i) => (
              <span key={i} style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: 20, padding: '6px 16px', fontSize: '0.9rem' }}>
                {['\ud83d\udcda', '\ud83c\udfc6', '\u267e\ufe0f'][i]} {label}
              </span>
            ))}
          </div>
          {!paid && (
            <div>
              <div style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 900, color: '#d4af37', marginBottom: '0.5rem' }}>
                {price.display}
              </div>
              <button onClick={handleBuy} disabled={buying} style={{
                background: 'linear-gradient(135deg, #d4af37, #b8941f)', color: '#0d1b3e', border: 'none',
                padding: '16px 48px', borderRadius: 12, fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(212,175,55,0.4)', transition: 'all 0.3s',
              }}>
                {buying ? 'Abrindo pagamento...' : `Comprar por ${price.display}`}
              </button>
              <p style={{ marginTop: 10, fontSize: '0.85rem', opacity: 0.7 }}>Pagamento seguro via Stripe {'\u2022'} Acesso imediato</p>
            </div>
          )}
          {paid && (
            <div style={{ background: 'rgba(0,255,0,0.1)', border: '1px solid rgba(0,255,0,0.3)', borderRadius: 12, padding: '1rem', maxWidth: 400, margin: '0 auto' }}>
              <CheckCircle size={32} color="#4ade80" />
              <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0.5rem 0 0' }}>{'\u2705'} Curso Desbloqueado!</p>
            </div>
          )}
        </div>
      </div>

      {/* LESSONS GRID */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          {'\ud83d\udccb'} Conte\u00fado do Curso
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {THEOLOGY_LESSONS.map((lesson, i) => (
            <div key={lesson.id} onClick={() => paid && setCurrentLesson(i)}
              style={{
                background: paid ? 'linear-gradient(135deg, #0d1b3e, #1a2a5e)' : 'rgba(255,255,255,0.05)',
                borderRadius: 12, padding: '1rem', cursor: paid ? 'pointer' : 'default',
                border: currentLesson === i && paid ? '2px solid #d4af37' : '1px solid rgba(100,130,200,0.15)',
                transition: 'all 0.3s', opacity: paid ? 1 : 0.7,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.5rem' }}>{lesson.icon}</span>
                <div>
                  <div style={{ color: '#8b9dc3', fontWeight: 700, fontSize: '0.95rem' }}>Li\u00e7\u00e3o {lesson.id}</div>
                  <div style={{ color: '#e0e0e0', fontWeight: 600 }}>{lesson.title}</div>
                </div>
                {!paid && <Lock size={16} color="#666" style={{ marginLeft: 'auto' }} />}
              </div>
              <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>{lesson.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA bottom */}
      {!paid && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem 3rem' }}>
          <button onClick={handleBuy} disabled={buying} style={{
            background: 'linear-gradient(135deg, #d4af37, #b8941f)', color: '#0d1b3e', border: 'none',
            padding: '16px 48px', borderRadius: 12, fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer',
          }}>
            {buying ? 'Abrindo pagamento...' : `{'\ud83c\udf93'} Comprar por ${price.display}`}
          </button>
        </div>
      )}

      {/* Footer links */}
      <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid rgba(100,130,200,0.1)' }}>
        <Link to="/curso-financas" style={{ color: '#d4af37', textDecoration: 'none', marginRight: 20 }}>{'\u2190'} Finan\u00e7as B\u00edblicas</Link>
        <Link to="/curso-biblico" style={{ color: '#8b5cf6', textDecoration: 'none' }}>Curso B\u00edblico {'\u2192'}</Link>
      </div>
    </div>
  );
}
