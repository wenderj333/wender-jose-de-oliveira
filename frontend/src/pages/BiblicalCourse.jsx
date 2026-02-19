import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Gift, Users, CheckCircle, Share2, ArrowRight, Copy, Star } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';
const SITE_URL = 'https://sigo-com-fe.vercel.app';

const COURSE_DAYS = [
  {
    day: 1,
    title: 'O Amor de Deus',
    verse: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito. — João 3:16',
    content: 'Hoje refletimos sobre o amor incondicional de Deus. Ele nos amou primeiro, antes mesmo de existirmos. Esse amor não depende de mérito — é graça pura.',
    challenge: 'Escreva 3 formas como você sente o amor de Deus no seu dia a dia.',
  },
  {
    day: 2,
    title: 'Fé e Confiança',
    verse: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. — Provérbios 3:5',
    content: 'A fé é a base da nossa relação com Deus. Confiar Nele significa entregar o controle, mesmo quando não entendemos o caminho.',
    challenge: 'Identifique uma área da sua vida onde precisa confiar mais em Deus.',
  },
  {
    day: 3,
    title: 'O Poder da Oração',
    verse: 'Orai sem cessar. — 1 Tessalonicenses 5:17',
    content: 'A oração é nosso canal direto com Deus. Não precisa ser formal — fale com Ele como um amigo, com sinceridade e humildade.',
    challenge: 'Reserve 10 minutos hoje para orar em silêncio, sem pedir nada — apenas ouvindo.',
  },
  {
    day: 4,
    title: 'Perdão e Liberdade',
    verse: 'Perdoai, e sereis perdoados. — Lucas 6:37',
    content: 'O perdão é uma das armas mais poderosas do cristão. Perdoar não é aprovar o erro — é libertar o seu coração.',
    challenge: 'Pense em alguém que você precisa perdoar. Ore por essa pessoa hoje.',
  },
  {
    day: 5,
    title: 'Servir ao Próximo',
    verse: 'Cada um exerça o dom que recebeu para servir os outros. — 1 Pedro 4:10',
    content: 'Jesus ensinou que a grandeza está no serviço. Servir não é fraqueza — é a expressão máxima do amor.',
    challenge: 'Faça algo bondoso por alguém hoje sem esperar nada em troca.',
  },
  {
    day: 6,
    title: 'A Palavra de Deus',
    verse: 'Lâmpada para os meus pés é a Tua Palavra e luz para o meu caminho. — Salmos 119:105',
    content: 'A Bíblia não é apenas um livro — é a voz de Deus para as nossas vidas. Cada versículo tem poder de transformar.',
    challenge: 'Leia um capítulo de Provérbios hoje e anote o versículo que mais tocou seu coração.',
  },
  {
    day: 7,
    title: 'Gratidão',
    verse: 'Em tudo dai graças. — 1 Tessalonicenses 5:18',
    content: 'A gratidão muda nossa perspectiva. Quando agradecemos, reconhecemos que Deus está agindo mesmo nas dificuldades.',
    challenge: 'Escreva 10 coisas pelas quais você é grato. Compartilhe com alguém.',
  },
  {
    day: 8,
    title: 'Comunidade e União',
    verse: 'Onde estiverem dois ou três reunidos em meu nome, ali estou no meio deles. — Mateus 18:20',
    content: 'Deus nos criou para viver em comunidade. A fé cresce quando compartilhada. Não fomos feitos para caminhar sozinhos.',
    challenge: 'Convide um amigo para conhecer o Sigo com Fé e caminhar na fé junto com você.',
  },
  {
    day: 9,
    title: 'Propósito e Chamado',
    verse: 'Porque eu sei os planos que tenho para vós, diz o Senhor. — Jeremias 29:11',
    content: 'Você não está aqui por acaso. Deus tem um propósito específico para a sua vida. Busque-o com oração e obediência.',
    challenge: 'Ore pedindo a Deus que revele mais do Seu propósito para a sua vida.',
  },
  {
    day: 10,
    title: 'A Grande Missão',
    verse: 'Ide por todo o mundo e pregai o Evangelho a toda criatura. — Marcos 16:15',
    content: 'O último dia do curso é o começo da sua missão. Compartilhe o que aprendeu. Leve a Palavra adiante. O mundo precisa ouvir!',
    challenge: 'Compartilhe este curso com 5 amigos e ajude a espalhar a Palavra de Deus!',
  },
];

export default function BiblicalCourse() {
  const [searchParams] = useSearchParams();
  const referredBy = searchParams.get('ref') || '';

  const [enrolled, setEnrolled] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [currentDay, setCurrentDay] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);

  // Check stored email
  useEffect(() => {
    const stored = localStorage.getItem('course_email');
    if (stored) {
      fetch(`${API}/course/status?email=${encodeURIComponent(stored)}`)
        .then(r => r.json())
        .then(d => {
          if (d.enrolled) {
            setEnrolled(true);
            setReferralCode(d.referralCode);
            setCurrentDay(d.currentDay);
            setReferralCount(d.referralCount);
            setIsPremium(d.isPremium);
            setName(d.name);
            setEmail(stored);
          }
        }).catch(() => {});
    }
    fetch(`${API}/course/total`).then(r => r.json()).then(d => setTotalEnrolled(d.total || 0)).catch(() => {});
  }, []);

  const handleEnroll = async () => {
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/course/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), referredBy }),
      });
      const data = await res.json();
      if (data.success) {
        setEnrolled(true);
        setReferralCode(data.referralCode);
        setCurrentDay(data.currentDay);
        localStorage.setItem('course_email', email.trim().toLowerCase());
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCompleteDay = async (day) => {
    try {
      await fetch(`${API}/course/complete-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, day }),
      });
      setCurrentDay(Math.max(currentDay, day));
    } catch (e) { console.error(e); }
  };

  const referralLink = `${SITE_URL}/curso-biblico?ref=${referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  const shareLink = async () => {
    const text = `📖 Participe do Curso Bíblico de 10 Dias GRATIS no Sigo com Fé!\n\nAprenda sobre amor, fé, oração e propósito.\n\n${referralLink}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Curso Bíblico - Sigo com Fé', text }); } catch (e) {}
    } else {
      copyLink();
    }
  };

  // ===== NOT ENROLLED — LANDING PAGE =====
  if (!enrolled) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0a3e, #3b5998)', borderRadius: 20,
          padding: '2rem 1.5rem', textAlign: 'center', color: '#fff', marginBottom: '1.5rem',
        }}>
          <BookOpen size={48} style={{ color: '#f4d03f', marginBottom: '0.5rem' }} />
          <h1 style={{ fontSize: '1.6rem', margin: '0 0 0.5rem' }}>
            Curso Bíblico de 10 Dias
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: 1.6 }}>
            Explore a fé, o amor ao próximo e o propósito de Deus para sua vida.
            <strong> 100% gratuíto!</strong>
          </p>
          {totalEnrolled > 5 && (
            <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', opacity: 0.8 }}>
              🔥 {totalEnrolled} pessoas já estão participando!
            </div>
          )}
        </div>

        {/* What you'll learn */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.2rem', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#1a0a3e', margin: '0 0 0.8rem' }}>
            📚 O que você vai aprender:
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {COURSE_DAYS.map(d => (
              <div key={d.day} style={{
                padding: '0.5rem', borderRadius: 10, background: '#f8f6ff',
                border: '1px solid #eee', fontSize: '0.8rem',
              }}>
                <strong style={{ color: '#3b5998' }}>Dia {d.day}:</strong> {d.title}
              </div>
            ))}
          </div>
        </div>

        {/* Referral benefit */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(218,165,32,0.1), rgba(244,197,66,0.1))',
          border: '1px solid rgba(218,165,32,0.3)', borderRadius: 16, padding: '1rem', marginBottom: '1rem',
          textAlign: 'center',
        }}>
          <Gift size={28} style={{ color: '#daa520', marginBottom: '0.3rem' }} />
          <h3 style={{ fontSize: '1rem', color: '#b8860b', margin: '0 0 0.3rem' }}>
            Convide 5 amigos e ganhe!
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0, lineHeight: 1.5 }}>
            Ao convidar 5 amigos, você desbloqueia o <strong>Curso Avançado</strong> com conteúdo exclusivo!
          </p>
        </div>

        {/* Enrollment form */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#1a0a3e', margin: '0 0 1rem', textAlign: 'center' }}>
            ✍️ Inscreva-se Agora (Grátis!)
          </h2>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Seu nome" style={{
              width: '100%', padding: '0.8rem', borderRadius: 10, border: '1px solid #ddd',
              fontSize: '0.95rem', marginBottom: '0.6rem', boxSizing: 'border-box',
            }} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Seu email" style={{
              width: '100%', padding: '0.8rem', borderRadius: 10, border: '1px solid #ddd',
              fontSize: '0.95rem', marginBottom: '0.8rem', boxSizing: 'border-box',
            }} />
          <button onClick={handleEnroll} disabled={loading || !name.trim() || !email.trim()} style={{
            width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #3b5998, #5b8def)',
            color: '#fff', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
          }}>
            {loading ? 'Inscrevendo...' : '📖 Começar o Curso Gratis'}
          </button>
          {referredBy && (
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#27ae60', marginTop: '0.5rem' }}>
              ✅ Você foi convidado por um amigo!
            </p>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: '#3b5998', textDecoration: 'none', fontWeight: 600 }}>
            ← Voltar para a Home
          </Link>
        </div>
      </div>
    );
  }

  // ===== ENROLLED — COURSE VIEW =====
  const dayData = selectedDay ? COURSE_DAYS[selectedDay - 1] : null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a3e, #3b5998)', borderRadius: 16,
        padding: '1.2rem', color: '#fff', marginBottom: '1rem', textAlign: 'center',
      }}>
        <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.2rem' }}>
          📖 Curso Bíblico de 10 Dias
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
          Olá, {name}! Dia {currentDay}/10 concluído
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.2)', borderRadius: 10, height: 8, marginTop: 8,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${(currentDay / 10) * 100}%`, height: '100%',
            background: 'linear-gradient(90deg, #f4d03f, #daa520)',
            borderRadius: 10, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Referral card */}
      <div style={{
        background: referralCount >= 5 ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, rgba(218,165,32,0.1), rgba(244,197,66,0.15))',
        border: referralCount >= 5 ? 'none' : '1px solid rgba(218,165,32,0.3)',
        borderRadius: 14, padding: '1rem', marginBottom: '1rem',
        color: referralCount >= 5 ? '#fff' : '#333',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {referralCount >= 5 ? '🎉 Curso Avançado Desbloqueado!' : `🤝 Convites: ${referralCount}/5`}
          </span>
          <Users size={20} />
        </div>
        {referralCount < 5 && (
          <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 0.6rem', lineHeight: 1.4 }}>
            Convide mais {5 - referralCount} amigo{5 - referralCount > 1 ? 's' : ''} para desbloquear o Curso Avançado!
          </p>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={shareLink} style={{
            flex: 1, padding: '0.6rem', borderRadius: 10, border: 'none',
            background: referralCount >= 5 ? 'rgba(255,255,255,0.2)' : '#3b5998',
            color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>
            <Share2 size={14} /> Compartilhar
          </button>
          <button onClick={copyLink} style={{
            padding: '0.6rem 0.8rem', borderRadius: 10, border: 'none',
            background: referralCount >= 5 ? 'rgba(255,255,255,0.2)' : '#eee',
            color: referralCount >= 5 ? '#fff' : '#333', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Copy size={14} /> {copied ? '✅' : 'Copiar'}
          </button>
        </div>
        <div style={{ fontSize: '0.72rem', color: referralCount >= 5 ? 'rgba(255,255,255,0.7)' : '#999', marginTop: 6, wordBreak: 'break-all' }}>
          {referralLink}
        </div>
      </div>

      {/* Day view or day list */}
      {dayData ? (
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <button onClick={() => setSelectedDay(null)} style={{
            background: 'none', border: 'none', color: '#3b5998', fontWeight: 600,
            fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1rem', padding: 0,
          }}>
            ← Voltar aos dias
          </button>
          <h2 style={{ fontSize: '1.2rem', color: '#1a0a3e', margin: '0 0 0.3rem' }}>
            Dia {dayData.day}: {dayData.title}
          </h2>
          <div style={{
            background: '#f8f6ff', borderRadius: 10, padding: '0.8rem',
            marginBottom: '1rem', fontStyle: 'italic', fontSize: '0.9rem', color: '#555',
          }}>
            📖 "{dayData.verse}"
          </div>
          <p style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.7, marginBottom: '1rem' }}>
            {dayData.content}
          </p>
          <div style={{
            background: 'linear-gradient(135deg, rgba(218,165,32,0.1), rgba(244,197,66,0.1))',
            border: '1px solid rgba(218,165,32,0.3)', borderRadius: 12, padding: '0.8rem',
            marginBottom: '1rem',
          }}>
            <h3 style={{ fontSize: '0.95rem', color: '#daa520', margin: '0 0 0.3rem' }}>
              💡 Desafio do Dia:
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#444', margin: 0, lineHeight: 1.5 }}>
              {dayData.challenge}
            </p>
          </div>
          {currentDay < dayData.day ? (
            <button onClick={() => handleCompleteDay(dayData.day)} style={{
              width: '100%', padding: '0.8rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
              color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            }}>
              ✅ Concluir Dia {dayData.day}
            </button>
          ) : (
            <div style={{ textAlign: 'center', color: '#27ae60', fontWeight: 700, fontSize: '1rem' }}>
              ✅ Dia concluído!
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3 style={{ fontSize: '1rem', color: '#1a0a3e', margin: '0 0 0.8rem' }}>
            📅 Selecione um dia:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {COURSE_DAYS.map(d => {
              const completed = currentDay >= d.day;
              const isNext = d.day === currentDay + 1;
              return (
                <div key={d.day} onClick={() => (completed || isNext) && setSelectedDay(d.day)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '0.8rem 1rem', borderRadius: 12,
                    background: completed ? '#e8f5e9' : isNext ? '#fff' : '#f5f5f5',
                    border: isNext ? '2px solid #3b5998' : '1px solid #eee',
                    cursor: completed || isNext ? 'pointer' : 'default',
                    opacity: !completed && !isNext ? 0.5 : 1,
                  }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: completed ? '#27ae60' : isNext ? '#3b5998' : '#ddd',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem',
                  }}>
                    {completed ? <CheckCircle size={18} /> : d.day}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#333' }}>
                      Dia {d.day}: {d.title}
                    </div>
                    {isNext && <div style={{ fontSize: '0.75rem', color: '#3b5998', fontWeight: 600 }}>
                      👉 Próximo dia — toque para começar!
                    </div>}
                  </div>
                  {(completed || isNext) && <ArrowRight size={16} style={{ color: '#999' }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Register CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #3b5998, #5b8def)',
        borderRadius: 14, padding: '1rem', marginTop: '1.5rem', textAlign: 'center', color: '#fff',
      }}>
        <p style={{ fontSize: '0.9rem', margin: '0 0 0.5rem' }}>
          Quer mais? Crie sua conta no Sigo com Fé e acesse orações, música, chat pastoral e mais!
        </p>
        <Link to="/cadastro" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#fff', color: '#3b5998', padding: '0.6rem 1.5rem',
          borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem',
        }}>
          Criar conta grátis <ArrowRight size={14} />
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/" style={{ color: '#3b5998', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
          ← Voltar para a Home
        </Link>
      </div>
    </div>
  );
}
