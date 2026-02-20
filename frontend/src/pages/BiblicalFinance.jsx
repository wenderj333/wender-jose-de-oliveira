import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DollarSign, BookOpen, CheckCircle, TrendingUp, Shield, Heart, ArrowRight, Star, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPrice, getPriceForBackend } from '../utils/regionPricing';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

const FINANCE_LESSONS = [
  { id: 1, title: 'O Prop\u00f3sito do Dinheiro segundo Deus', desc: 'Descubra o que a B\u00edblia realmente ensina sobre riqueza e pobreza.', icon: '\ud83d\udcb0' },
  { id: 2, title: 'D\u00edzimo: Mandamento ou Princ\u00edpio?', desc: 'Uma an\u00e1lise profunda do d\u00edzimo no Antigo e Novo Testamento.', icon: '\u26ea' },
  { id: 3, title: 'Ofertas e Generosidade', desc: 'Como dar com alegria e o princ\u00edpio da semeadura e colheita.', icon: '\ud83c\udf31' },
  { id: 4, title: 'Liberdade das D\u00edvidas', desc: 'Estrat\u00e9gias b\u00edblicas para sair das d\u00edvidas e viver livre.', icon: '\ud83d\udd13' },
  { id: 5, title: 'Poupan\u00e7a: A Sabedoria da Formiga', desc: 'Prov\u00e9rbios ensina sobre poupar. Aprenda a construir reservas.', icon: '\ud83d\udc1c' },
  { id: 6, title: 'Or\u00e7amento Familiar B\u00edblico', desc: 'Como organizar suas finan\u00e7as com princ\u00edpios de mordomia.', icon: '\ud83d\udcca' },
  { id: 7, title: 'Investimentos com Sabedoria', desc: 'Par\u00e1bola dos Talentos: multiplicar o que Deus te deu.', icon: '\ud83d\udcc8' },
  { id: 8, title: 'Contentamento vs. Cobica', desc: 'A paz financeira come\u00e7a no cora\u00e7\u00e3o, n\u00e3o na conta banc\u00e1ria.', icon: '\ud83d\ude4f' },
  { id: 9, title: 'Trabalho como Adora\u00e7\u00e3o', desc: 'Colossenses 3:23 \u2014 trabalhar para o Senhor, n\u00e3o para homens.', icon: '\ud83d\udee0\ufe0f' },
  { id: 10, title: 'Prosperidade com Prop\u00f3sito', desc: 'Deus prospera para que voc\u00ea seja b\u00ean\u00e7\u00e3o, n\u00e3o para acumular.', icon: '\u2b50' },
  { id: 11, title: 'Casamento e Finan\u00e7as', desc: 'Como alinhar finan\u00e7as no casamento com princ\u00edpios b\u00edblicos.', icon: '\ud83d\udc91' },
  { id: 12, title: 'Ensinar Filhos sobre Dinheiro', desc: 'Crie filhos financeiramente s\u00e1bios com base b\u00edblica.', icon: '\ud83d\udc76' },
  { id: 13, title: 'Empreendedorismo Crist\u00e3o', desc: 'Neg\u00f3cios que honram a Deus e servem ao pr\u00f3ximo.', icon: '\ud83d\ude80' },
  { id: 14, title: 'Planejamento para o Futuro', desc: 'Aposentadoria, heran\u00e7a e legado financeiro b\u00edblico.', icon: '\ud83c\udfaf' },
  { id: 15, title: 'Mordomia Total', desc: 'Tudo pertence a Deus \u2014 voc\u00ea \u00e9 administrador, n\u00e3o dono.', icon: '\ud83d\udc51' },
];

export default function BiblicalFinance() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [buying, setBuying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);
  const price = getPrice('finance');

  useEffect(() => {
    if (searchParams.get('paid') === 'success') {
      setPaid(true);
      localStorage.setItem('finance_paid', 'true');
    }
    if (localStorage.getItem('finance_paid') === 'true') setPaid(true);
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
    } catch (e) { console.error(e); alert('Erro de conex\u00e3o.'); }
    finally { setBuying(false); }
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #1a472a 0%, #2d5016 30%, #4a7c28 60%, #d4af37 100%)',
    padding: '3rem 1.5rem', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f0a' }}>
      {/* HERO */}
      <div style={heroStyle}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 30% 50%, rgba(212,175,55,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{'\ud83d\udcb0\ud83d\udcd6\u2720\ufe0f'}</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, margin: '0 0 0.5rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Finan\u00e7as B\u00edblicas
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', opacity: 0.9, maxWidth: 600, margin: '0 auto 1.5rem' }}>
            Aprenda a administrar suas finan\u00e7as segundo os princ\u00edpios de Deus
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {['15 Li\u00e7\u00f5es', 'Certificado', 'Acesso Vitalício'].map((t, i) => (
              <span key={i} style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: 20, padding: '6px 16px', fontSize: '0.9rem' }}>
                {['\ud83d\udcda', '\ud83c\udfc6', '\u267e\ufe0f'][i]} {t}
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

      {/* TOPICS GRID */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          {'\ud83d\udccb'} O que voc\u00ea vai aprender
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {FINANCE_LESSONS.map((lesson, i) => (
            <div key={lesson.id} onClick={() => paid && setCurrentLesson(i)}
              style={{
                background: paid ? 'linear-gradient(135deg, #1a2f1a, #2d4a1a)' : 'rgba(255,255,255,0.05)',
                borderRadius: 12, padding: '1rem', cursor: paid ? 'pointer' : 'default',
                border: currentLesson === i && paid ? '2px solid #d4af37' : '1px solid rgba(212,175,55,0.15)',
                transition: 'all 0.3s', opacity: paid ? 1 : 0.7,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.5rem' }}>{lesson.icon}</span>
                <div>
                  <div style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.95rem' }}>Li\u00e7\u00e3o {lesson.id}</div>
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
            background: 'linear-gradient(135deg, #d4af37, #b8941f)', color: '#1a472a', border: 'none',
            padding: '16px 48px', borderRadius: 12, fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer',
          }}>
            {buying ? 'Abrindo pagamento...' : `{'\ud83d\udcb0'} Comprar por ${price.display}`}
          </button>
        </div>
      )}

      {/* Footer links */}
      <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
        <Link to="/curso-biblico" style={{ color: '#d4af37', textDecoration: 'none', marginRight: 20 }}>{'\u2190'} Curso B\u00edblico</Link>
        <Link to="/curso-teologia" style={{ color: '#8b9dc3', textDecoration: 'none' }}>Curso de Teologia {'\u2192'}</Link>
      </div>
    </div>
  );
}
