import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle, Award, Compass, Star, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPrice, getPriceForBackend } from '../utils/regionPricing';
import LessonReader from '../components/LessonReader';
import THEOLOGY_CONTENT from '../data/theologyContent';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

const THEOLOGY_LESSONS = [
  { id: 1, titleKey: 'courseTheology.lessons.l1.title', descKey: 'courseTheology.lessons.l1.desc', icon: '📚' },
  { id: 2, titleKey: 'courseTheology.lessons.l2.title', descKey: 'courseTheology.lessons.l2.desc', icon: '🌟' },
  { id: 3, titleKey: 'courseTheology.lessons.l3.title', descKey: 'courseTheology.lessons.l3.desc', icon: '📖' },
  { id: 4, titleKey: 'courseTheology.lessons.l4.title', descKey: 'courseTheology.lessons.l4.desc', icon: '👑' },
  { id: 5, titleKey: 'courseTheology.lessons.l5.title', descKey: 'courseTheology.lessons.l5.desc', icon: '✡️' },
  { id: 6, titleKey: 'courseTheology.lessons.l6.title', descKey: 'courseTheology.lessons.l6.desc', icon: '✠' },
  { id: 7, titleKey: 'courseTheology.lessons.l7.title', descKey: 'courseTheology.lessons.l7.desc', icon: '✝️' },
  { id: 8, titleKey: 'courseTheology.lessons.l8.title', descKey: 'courseTheology.lessons.l8.desc', icon: '🕊️' },
  { id: 9, titleKey: 'courseTheology.lessons.l9.title', descKey: 'courseTheology.lessons.l9.desc', icon: '🧑' },
  { id: 10, titleKey: 'courseTheology.lessons.l10.title', descKey: 'courseTheology.lessons.l10.desc', icon: '⚠️' },
  { id: 11, titleKey: 'courseTheology.lessons.l11.title', descKey: 'courseTheology.lessons.l11.desc', icon: '💡' },
  { id: 12, titleKey: 'courseTheology.lessons.l12.title', descKey: 'courseTheology.lessons.l12.desc', icon: '⛪' },
  { id: 13, titleKey: 'courseTheology.lessons.l13.title', descKey: 'courseTheology.lessons.l13.desc', icon: '🍷' },
  { id: 14, titleKey: 'courseTheology.lessons.l14.title', descKey: 'courseTheology.lessons.l14.desc', icon: '😇' },
  { id: 15, titleKey: 'courseTheology.lessons.l15.title', descKey: 'courseTheology.lessons.l15.desc', icon: '🌅' },
  { id: 16, titleKey: 'courseTheology.lessons.l16.title', descKey: 'courseTheology.lessons.l16.desc', icon: '🌍' },
  { id: 17, titleKey: 'courseTheology.lessons.l17.title', descKey: 'courseTheology.lessons.l17.desc', icon: '🔍' },
  { id: 18, titleKey: 'courseTheology.lessons.l18.title', descKey: 'courseTheology.lessons.l18.desc', icon: '🏛️' },
  { id: 19, titleKey: 'courseTheology.lessons.l19.title', descKey: 'courseTheology.lessons.l19.desc', icon: '🛡️' },
  { id: 20, titleKey: 'courseTheology.lessons.l20.title', descKey: 'courseTheology.lessons.l20.desc', icon: '🌍' },
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
      const email = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : prompt(t('courseTheology.emailPrompt', 'Seu email para receber o curso:'));
      if (!email) { setBuying(false); return; }
      const { amount, currency } = getPriceForBackend('theology');
      const res = await fetch(`${API}/course/create-checkout-theology`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amount, currency }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(t('courseTheology.paymentError', 'Erro ao iniciar pagamento. Tente novamente.'));
    } catch (e) { console.error(e); alert(t('courseTheology.connectionError', 'Erro de conexão.')); }
    finally { setBuying(false); }
  };

  if (readingLesson !== null) {
    return (
      <LessonReader
        lessons={THEOLOGY_LESSONS.map(l => ({ ...l, title: t(l.titleKey), desc: t(l.descKey) }))}
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
            {t('courseTheology.title')}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', opacity: 0.9, maxWidth: 600, margin: '0 auto 1.5rem' }}>
            {t('courseTheology.subtitle', 'Aprofunde seu conhecimento teológico e fortaleça sua fé com fundamento')}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[t('courseTheology.20lessons', '20 Lições'), t('courseTheology.certificate', 'Certificado'), t('courseTheology.lifetime', 'Acesso Vitalício')].map((label, i) => (
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
                {buying ? t('courseTheology.processing', 'Processando...') : `${t('courseTheology.buyFor', 'Comprar por')} ${price.display}`}
              </button>
              <p style={{ marginTop: 10, fontSize: '0.85rem', opacity: 0.7 }}>{t('courseTheology.securePayment', 'Pagamento seguro via Stripe • Acesso imediato')}</p>
            </div>
          )}
          {paid && (
            <div style={{ background: 'rgba(0,255,0,0.1)', border: '1px solid rgba(0,255,0,0.3)', borderRadius: 12, padding: '1rem', maxWidth: 400, margin: '0 auto' }}>
              <CheckCircle size={32} color="#4ade80" />
              <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0.5rem 0 0' }}>✅ {t('courseTheology.unlocked', 'Curso Desbloqueado!')}</p>
            </div>
          )}
        </div>
      </div>

      {/* LESSONS GRID */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          📋 {t('courseTheology.content', 'Conteúdo do Curso')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {THEOLOGY_LESSONS.map((lesson, i) => (
            <div key={lesson.id} onClick={() => setReadingLesson(i)}
              style={{
                background: 'linear-gradient(135deg, #0d1b3e, #1a2a5e)',
                borderRadius: 12, padding: '1rem', cursor: 'pointer',
                border: currentLesson === i ? '2px solid #d4af37' : '1px solid rgba(100,130,200,0.15)',
                transition: 'all 0.3s', opacity: 1,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.5rem' }}>{lesson.icon}</span>
                <div>
                  <div style={{ color: '#8b9dc3', fontWeight: 700, fontSize: '0.95rem' }}>{t('courseTheology.lesson', 'Lição')} {lesson.id}</div>
                  <div style={{ color: '#e0e0e0', fontWeight: 600 }}>{t(lesson.titleKey)}</div>
                </div>
              </div>
              <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>{t(lesson.descKey)}</p>
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
            {buying ? t('courseTheology.processing', 'Processando...') : `🎓 ${t('courseTheology.buyFor', 'Comprar por')} ${price.display}`}
          </button>
        </div>
      )}

      {/* Footer links */}
      <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid rgba(100,130,200,0.1)' }}>
        <Link to="/curso-financas" style={{ color: '#d4af37', textDecoration: 'none', marginRight: 20 }}>← {t('nav.courseFinance')}</Link>
        <Link to="/curso-biblico" style={{ color: '#8b5cf6', textDecoration: 'none' }}>{t('nav.courseFree')} →</Link>
      </div>
    </div>
  );
}
