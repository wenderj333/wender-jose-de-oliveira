import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Heart, Cloud, Sun, Moon, Share2 } from 'lucide-react';

const ALL_QUESTIONS = [
  "O que você fez hoje que alegrou o coração de Deus?",
  "Existe alguém que você precisa perdoar hoje?",
  "Você tem colocado Deus em primeiro lugar ou as preocupações do mundo?",
  "Se Jesus voltasse agora, como Ele encontraria seu coração?",
  "Qual foi a última vez que você ouviu a voz de Deus?",
  "Sua fala hoje edificou ou feriu alguém?",
  "O que você pode agradecer hoje, mesmo em meio às dificuldades?",
  "Você confiou em Deus ou tentou resolver tudo com sua própria força?",
  "Quem precisa da sua oração hoje?",
  "Você tem sido um reflexo do amor de Cristo para os outros?",
  "O que está impedindo você de se entregar totalmente a Deus?",
  "Você leu a Bíblia hoje buscando conhecer a Deus ou apenas por obrigação?",
  "Como você pode servir a alguém hoje sem esperar nada em troca?",
  "Onde você viu a mão de Deus no seu dia?",
  "Você tem guardado mágoa ou rancor no seu coração?",
  "Se Deus te pedisse algo difícil hoje, você obedeceria?",
  "Você tem sido grato pelo pão de cada dia?",
  "Sua vida tem inspirado outras pessoas a buscar a Deus?",
  "Você separou um tempo de qualidade para conversar com o Pai hoje?",
  "O que você precisa deixar para trás para avançar com Deus?",
  "Você tem amado o seu próximo como a si mesmo?",
  "Sua fé está baseada em sentimentos ou na Palavra de Deus?",
  "Você tem sido fiel no pouco que Deus te confiou?",
  "O que você faria diferente hoje se soubesse que é seu último dia?",
  "Você tem pedido sabedoria a Deus antes de tomar decisões?",
  "Seu coração está em paz ou ansioso? Entregue a Ele.",
  "Você tem cuidado do templo do Espírito Santo (seu corpo)?",
  "Você tem compartilhado as boas novas do Evangelho?",
  "O que Deus tem tentado te ensinar nesta temporada?",
  "Você está disposto a perdoar como Cristo te perdoou?"
];

export default function Reflection() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState([]);
  const [reflectionText, setReflectionText] = useState('');

  useEffect(() => {
    // Get day of year (0-365)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);

    // Pick 3 questions based on day
    // Simple hashing: (day * index) % length
    const q1 = ALL_QUESTIONS[day % ALL_QUESTIONS.length];
    const q2 = ALL_QUESTIONS[(day + 5) % ALL_QUESTIONS.length];
    const q3 = ALL_QUESTIONS[(day + 10) % ALL_QUESTIONS.length];

    setQuestions([q1, q2, q3]);
  }, []);

  return (
    <div className="page-container" style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
      <header style={{textAlign: 'center', marginBottom: '40px'}}>
        <div style={{
          width: 80, height: 80, background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          boxShadow: '0 10px 25px rgba(86, 171, 47, 0.3)'
        }}>
          <span style={{fontSize: '2.5rem'}}>🌿</span>
        </div>
        <h1 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', color: 'var(--text)', marginBottom: '10px'}}>
          {t('reflection.title', 'Reflexão com Deus')}
        </h1>
        <p style={{color: 'var(--muted)', fontSize: '1.1rem'}}>
          {t('reflection.subtitle', 'Pare um momento. Respire. Ouça a voz de Deus.')}
        </p>
      </header>

      <div className="reflection-cards" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {questions.map((q, i) => (
          <div key={i} className="glass-card" style={{
            padding: '30px', borderRadius: '20px', background: 'var(--card)', 
            borderLeft: '5px solid #56ab2f', display: 'flex', gap: '20px', alignItems: 'flex-start',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animation: `fadeIn 0.5s ease-out ${i * 0.2}s backwards`
          }}>
            <div style={{
              background: 'rgba(86, 171, 47, 0.1)', color: '#56ab2f', width: 40, height: 40, borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold'
            }}>
              {i + 1}
            </div>
            <div>
              <h3 style={{fontSize: '1.4rem', fontFamily: "'Cormorant Garamond', serif", marginBottom: '10px', color: 'var(--text)'}}>
                {q}
              </h3>
              <p style={{fontSize: '0.95rem', color: 'var(--muted)', fontStyle: 'italic'}}>
                Medite sobre isso. Seja sincero com Deus.
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop: '40px', background: 'var(--card)', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
        <h3 style={{fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <BookOpen size={20} color="var(--gold)" /> 
          {t('reflection.journal', 'Seu Diário Espiritual (Opcional)')}
        </h3>
        <textarea 
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder={t('reflection.placeholder', 'Escreva aqui o que Deus falou ao seu coração...')}
          style={{
            width: '100%', height: '150px', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)', 
            background: 'var(--bg)', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical'
          }}
        />
        <div style={{marginTop: '15px', display: 'flex', justifyContent: 'flex-end'}}>
          <button className="btn btn-primary" onClick={() => alert(t('reflection.saved', 'Reflexão salva no coração de Deus! (Em breve salvaremos no seu perfil)'))}>
            {t('common.save', 'Guardar Reflexão')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}