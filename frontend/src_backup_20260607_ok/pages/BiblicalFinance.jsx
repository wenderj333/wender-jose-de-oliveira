import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DollarSign, BookOpen, CheckCircle, TrendingUp, Shield, Heart, ArrowRight, Star, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getPrice, getPriceForBackend } from '../utils/regionPricing';
import LessonReader from '../components/LessonReader';
import FINANCE_CONTENT from '../data/financeContent';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

const FINANCE_LESSONS = [
  { id: 1, title: 'O Propósito do Dinheiro segundo Deus', desc: 'Descubra o que a Bíblia realmente ensina sobre riqueza e pobreza.', icon: '💰' },
  { id: 2, title: 'Dízimo: Mandamento ou Princípio?', desc: 'Uma análise profunda do dízimo no Antigo e Novo Testamento.', icon: '⛪' },
  { id: 3, title: 'Ofertas e Generosidade', desc: 'Como dar com alegria e o princípio da semeadura e colheita.', icon: '🌱' },
  { id: 4, title: 'Liberdade das Dívidas', desc: 'Estratégias bíblicas para sair das dívidas e viver livre.', icon: '🔓' },
  { id: 5, title: 'Poupança: A Sabedoria da Formiga', desc: 'Provérbios ensina sobre poupar. Aprenda a construir reservas.', icon: '🐜' },
  { id: 6, title: 'Orçamento Familiar Bíblico', desc: 'Como organizar suas finanças com princípios de mordomia.', icon: '📊' },
  { id: 7, title: 'Investimentos com Sabedoria', desc: 'Parábola dos Talentos: multiplicar o que Deus te deu.', icon: '📈' },
  { id: 8, title: 'Contentamento vs. Cobica', desc: 'A paz financeira começa no coração, não na conta bancária.', icon: '🙏' },
  { id: 9, title: 'Trabalho como Adoração', desc: 'Colossenses 3:23 \u2014 trabalhar para o Senhor, não para homens.', icon: '🛠️' },
  { id: 10, title: 'Prosperidade com Propósito', desc: 'Deus prospera para que você seja bênção, não para acumular.', icon: '⭐' },
  { id: 11, title: 'Casamento e Finanças', desc: 'Como alinhar finanças no casamento com princípios bíblicos.', icon: '💑' },
  { id: 12, title: 'Ensinar Filhos sobre Dinheiro', desc: 'Crie filhos financeiramente sábios com base bíblica.', icon: '👶' },
  { id: 13, title: 'Empreendedorismo Cristão', desc: 'Negócios que honram a Deus e servem ao próximo.', icon: '🚀' },
  { id: 14, title: 'Planejamento para o Futuro', desc: 'Aposentadoria, herança e legado financeiro bíblico.', icon: '🎯' },
  { id: 15, title: 'Mordomia Total', desc: 'Tudo pertence a Deus \u2014 você é administrador, não dono.', icon: '👑' },
];

export default function BiblicalFinance() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isPastor = user?.role === 'pastor' || user?.role === 'admin';
  const [searchParams] = useSearchParams();
  const [buying, setBuying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [readingLesson, setReadingLesson] = useState(null);
  const price = getPrice('finance');

  useEffect(() => {
    if (searchParams.get('paid') === 'success') {
      setPaid(true);
      localStorage.setItem('finance_paid', 'true');
    }
    if (localStorage.getItem('finance_paid') === 'true') setPaid(true);
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
      const { amount, currency } = getPriceForBackend('finance');
      const res = await fetch(`${API}/course/create-checkout-finance`, {
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

  const heroStyle = {
    background: 'linear-gradient(135deg, #1a472a 0%, #2d5016 30%, #4a7c28 60%, #d4af37 100%)',
    padding: '3rem 1.5rem', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden',
  };

  if (readingLesson !== null) {
    return (
      <LessonReader
        lessons={FINANCE_LESSONS}
        lessonContents={FINANCE_CONTENT}
        currentIndex={readingLesson}
        totalLessons={FINANCE_LESSONS.length}
        courseType="finance"
        accentColor="#d4af37"
        onClose={() => setReadingLesson(null)}
        onNavigate={(i) => setReadingLesson(i)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f0a' }}>
      {/* HERO */}
      <div style={heroStyle}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 30% 50%, rgba(212,175,55,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{'💰📖✠'}</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, margin: '0 0 0.5rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Finanças Bíblicas
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', opacity: 0.9, maxWidth: 600, margin: '0 auto 1.5rem' }}>
            Aprenda a administrar suas finanças segundo os princípios de Deus
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {['15 Liç\u00f5es', 'Certificado', 'Acesso Vitalício'].map((t, i) => (
              <span key={i} style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: 20, padding: '6px 16px', fontSize: '0.9rem' }}>
                {['📚', '🏆', '♾️'][i]} {t}
              </span>
            ))}
          </div>
          {!paid && (
            <div>
              <div style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 900, color: '#d4af37', marginBottom: '0.5rem' }}>
                {price.display}
              </div>
              <button onClick={handleBuy} disabled={buying} style={{
                background: 'linear-gradient(135deg, #d4af37, #b8941f)', color: '#1a472a', border: 'none',
                padding: '16px 48px', borderRadius: 12, fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(212,175,55,0.4)', transform: buying ? 'none' : 'scale(1)',
                transition: 'all 0.3s',
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

      {/* TOPICS GRID */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
        {!isPastor && (
          <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', color: '#d4af37', fontSize: '0.9rem' }}>
            🔒 Algumas lições são restritas apenas para pastores.
          </div>
        )}
        <h2 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          {'📋'} O que você vai aprender
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {FINANCE_LESSONS.filter(lesson => {
            // Hide "Dízimo" lesson from non-pastors
            if (!isPastor && lesson.title.toLowerCase().includes('dízimo')) return false;
            return true;
          }).map((lesson, i) => (
            <div key={lesson.id} onClick={() => setReadingLesson(i)}
              style={{
                background: 'linear-gradient(135deg, #1a2f1a, #2d4a1a)',
                borderRadius: 12, padding: '1rem', cursor: 'pointer',
                border: currentLesson === i ? '2px solid #d4af37' : '1px solid rgba(212,175,55,0.15)',
                transition: 'all 0.3s', opacity: 1,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.5rem' }}>{lesson.icon}</span>
                <div>
                  <div style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.95rem' }}>Lição {lesson.id}</div>
                  <div style={{ color: '#e0e0e0', fontWeight: 600 }}>{lesson.title}</div>
                </div>
{/* lock removed */}
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
            background: 'linear-gradient(135deg, #d4af37, #b8941f)', color: '#1a472a', border: 'none',
            padding: '16px 48px', borderRadius: 12, fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer',
          }}>
            {buying ? 'Abrindo pagamento...' : `{'💰'} Comprar por ${price.display}`}
          </button>
        </div>
      )}

      {/* Footer links */}
      <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
        <Link to="/curso-biblico" style={{ color: '#d4af37', textDecoration: 'none', marginRight: 20 }}>{'←'} Curso Bíblico</Link>
        <Link to="/curso-teologia" style={{ color: '#8b9dc3', textDecoration: 'none' }}>Curso de Teologia {'→'}</Link>
      </div>
    </div>
  );
}
