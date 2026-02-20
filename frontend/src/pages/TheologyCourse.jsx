import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle, Award, Compass, Star, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPrice, getPriceForBackend } from '../utils/regionPricing';
import LessonReader from '../components/LessonReader';
import THEOLOGY_CONTENT from '../data/theologyContent';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

const THEOLOGY_LESSONS = [
  { id: 1, title: 'Introdução à Teologia', desc: 'O que é teologia e por que todo cristão deveria estudá-la.', icon: '📚' },
  { id: 2, title: 'A Revelação de Deus', desc: 'Revelação geral e especial: como Deus se revela ao homem.', icon: '🌟' },
  { id: 3, title: 'Bibliologia', desc: 'A doutrina das Escrituras: inspiração, inerrância e cânon.', icon: '📖' },
  { id: 4, title: 'Teologia Própria', desc: 'Os atributos de Deus: onisciência, onipotência, onipresenca.', icon: '👑' },
  { id: 5, title: 'A Trindade', desc: 'Pai, Filho e Espírito Santo: um só Deus em três pessoas.', icon: '✡️' },
  { id: 6, title: 'Cristologia I', desc: 'A pessoa de Cristo: natureza divina e humana.', icon: '✠' },
  { id: 7, title: 'Cristologia II', desc: 'A obra de Cristo: vida, morte, ressurreição e ascensão.', icon: '✝️' },
  { id: 8, title: 'Pneumatologia', desc: 'A doutrina do Espírito Santo: pessoa, obra e dons.', icon: '🕊️' },
  { id: 9, title: 'Antropologia Bíblica', desc: 'A doutrina do homem: criação, queda e imagem de Deus.', icon: '🧑' },
  { id: 10, title: 'Hamartiologia', desc: 'A doutrina do pecado: origem, natureza e consequências.', icon: '⚠️' },
  { id: 11, title: 'Soteriologia', desc: 'A doutrina da salvação: graça, fé, justificação e santificação.', icon: '💡' },
  { id: 12, title: 'Eclesiologia', desc: 'A doutrina da Igreja: natureza, missão e governo.', icon: '⛪' },
  { id: 13, title: 'Sacramentos', desc: 'Batismo e Santa Ceia: significado e prática.', icon: '🍷' },
  { id: 14, title: 'Angelologia', desc: 'Anjos, demônios e a guerra espiritual.', icon: '😇' },
  { id: 15, title: 'Escatologia I', desc: 'Os últimos tempos: sinais, tribulação e arrebatamento.', icon: '🌅' },
  { id: 16, title: 'Escatologia II', desc: 'Milênio, juízo final e novos céus e nova terra.', icon: '🌍' },
  { id: 17, title: 'Hermenêutica', desc: 'Como interpretar a Bíblia corretamente: métodos e princípios.', icon: '🔍' },
  { id: 18, title: 'História da Igreja', desc: 'De Atos aos dias de hoje: reformas, avivamentos e movimentos.', icon: '🏛️' },
  { id: 19, title: 'Apologética', desc: 'Defender a fé com razão: respostas para as grandes perguntas.', icon: '🛡️' },
  { id: 20, title: 'Teologia Prática', desc: 'Aplicando a teologia no dia a dia, ministério e miss\u00f5es.', icon: '🌍' },
];

export default function TheologyCourse() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [buying, setBuying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [readingLesson, setReadingLesson] = useState(null);
  const price = getPrice('theology');

  useEffect(() => {
    if (searchParams.get('paid') === 'success') {
      setPaid(true);
      localStorage.setItem('theology_paid', 'true');
    }
    if (localStorage.getItem('theology_paid') === 'true') setPaid(true);
    // Admin auto-unlock
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.id === 'c7c930da-5fe8-4b4e-887d-ba547804b7e1' || u.role === 'admin') setPaid(true);
    } catch {}
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
    } catch (e) { console.error(e); alert('Erro de conexão.'); }
    finally { setBuying(false); }
  };

  if (readingLesson !== null && paid) {
    return (
      <LessonReader
        lessons={THEOLOGY_LESSONS}
        lessonContents={THEOLOGY_CONTENT}
        currentIndex={readingLesson}
        totalLessons={THEOLOGY_LESSONS.length}
        courseType="theology"
        accentColor="#8b9dc3"
        onClose={() => setReadingLesson(null)}
        onNavigate={(i) => setReadingLesson(i)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080c18' }}>
      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1b3e 0%, #1a2a5e 30%, #2a3a7e 60%, #d4af37 100%)',
        padding: '3rem 1.5rem', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 70% 30%, rgba(212,175,55,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{'🎓📚✠'}</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, margin: '0 0 0.5rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Teologia Cristã
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', opacity: 0.9, maxWidth: 600, margin: '0 auto 1.5rem' }}>
            Aprofunde seu conhecimento teológico e fortaleça sua fé com fundamento
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {['20 Liç\u00f5es', 'Certificado', 'Acesso Vitalício'].map((label, i) => (
              <span key={i} style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: 20, padding: '6px 16px', fontSize: '0.9rem' }}>
                {['📚', '🏆', '♾️'][i]} {label}
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
              <p style={{ marginTop: 10, fontSize: '0.85rem', opacity: 0.7 }}>Pagamento seguro via Stripe {'•'} Acesso imediato</p>
            </div>
          )}
          {paid && (
            <div style={{ background: 'rgba(0,255,0,0.1)', border: '1px solid rgba(0,255,0,0.3)', borderRadius: 12, padding: '1rem', maxWidth: 400, margin: '0 auto' }}>
              <CheckCircle size={32} color="#4ade80" />
              <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0.5rem 0 0' }}>{'✅'} Curso Desbloqueado!</p>
            </div>
          )}
        </div>
      </div>

      {/* LESSONS GRID */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          {'📋'} Conteúdo do Curso
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {THEOLOGY_LESSONS.map((lesson, i) => (
            <div key={lesson.id} onClick={() => paid && setReadingLesson(i)}
              style={{
                background: paid ? 'linear-gradient(135deg, #0d1b3e, #1a2a5e)' : 'rgba(255,255,255,0.05)',
                borderRadius: 12, padding: '1rem', cursor: paid ? 'pointer' : 'default',
                border: currentLesson === i && paid ? '2px solid #d4af37' : '1px solid rgba(100,130,200,0.15)',
                transition: 'all 0.3s', opacity: paid ? 1 : 0.7,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.5rem' }}>{lesson.icon}</span>
                <div>
                  <div style={{ color: '#8b9dc3', fontWeight: 700, fontSize: '0.95rem' }}>Lição {lesson.id}</div>
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
            {buying ? 'Abrindo pagamento...' : `{'🎓'} Comprar por ${price.display}`}
          </button>
        </div>
      )}

      {/* Footer links */}
      <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid rgba(100,130,200,0.1)' }}>
        <Link to="/curso-financas" style={{ color: '#d4af37', textDecoration: 'none', marginRight: 20 }}>{'←'} Finanças Bíblicas</Link>
        <Link to="/curso-biblico" style={{ color: '#8b5cf6', textDecoration: 'none' }}>Curso Bíblico {'→'}</Link>
      </div>
    </div>
  );
}
