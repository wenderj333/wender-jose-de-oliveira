import React, { useState } from 'react';
import { BookOpen, Star, Trophy, Puzzle, Palette, Brain, Sparkles, CheckCircle, XCircle, Heart } from 'lucide-react';

const STORIES = [
  { id: 1, title: 'Davi e Golias', desc: 'Um menino corajoso que venceu um gigante com uma pedra e muita fé em Deus', age: '6-8', color: '#3b5998' },
  { id: 2, title: 'A Arca de Noé', desc: 'Noé construiu um barco enorme e salvou todos os animais do grande dilúvio', age: '3-5', color: '#2d8a4e' },
  { id: 3, title: 'Jonas e a Baleia', desc: 'Jonas fugiu de Deus mas aprendeu que Ele está em todo lugar', age: '6-8', color: '#8b5cf6' },
  { id: 4, title: 'Daniel na Cova dos Leões', desc: 'Daniel orou com fé e Deus fechou a boca dos leões', age: '9-12', color: '#daa520' },
  { id: 5, title: 'Moisés e o Mar Vermelho', desc: 'Deus abriu o mar para Seu povo passar em segurança', age: '6-8', color: '#e74c3c' },
];

const QUIZ = [
  { q: 'Quem derrotou o gigante Golias?', opts: ['Saul', 'Davi', 'Moisés', 'Josué'], answer: 1 },
  { q: 'Quantos dias durou o dilúvio?', opts: ['10 dias', '20 dias', '40 dias', '100 dias'], answer: 2 },
  { q: 'Quem foi jogado na cova dos leões?', opts: ['Jonas', 'Daniel', 'Paulo', 'Pedro'], answer: 1 },
  { q: 'Qual o primeiro livro da Bíblia?', opts: ['Êxodo', 'Salmos', 'Gênesis', 'Mateus'], answer: 2 },
  { q: 'Jesus nasceu em qual cidade?', opts: ['Jerusalém', 'Nazaré', 'Belém', 'Cafarnaum'], answer: 2 },
];

const ACTIVITIES = [
  { title: 'Colorir', desc: 'Pinte personagens bíblicos com cores lindas', icon: Palette, color: '#e74c3c' },
  { title: 'Caça-Palavras', desc: 'Encontre palavras da Bíblia escondidas', icon: Brain, color: '#3b5998' },
  { title: 'Jogo da Memória', desc: 'Encontre os pares dos 12 apóstolos', icon: Puzzle, color: '#2d8a4e' },
  { title: 'Quebra-Cabeça', desc: 'Monte cenas bíblicas incríveis', icon: Sparkles, color: '#8b5cf6' },
];

export default function Kids() {
  const [quizStep, setQuizStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [memorized, setMemorized] = useState(false);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === QUIZ[quizStep].answer) setScore(s => s + 1);
    setTimeout(() => {
      if (quizStep < QUIZ.length - 1) {
        setQuizStep(s => s + 1);
        setSelected(null);
      } else {
        setQuizDone(true);
      }
    }, 1200);
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setScore(0);
    setSelected(null);
    setQuizDone(false);
  };

  return (
    <div className="kids-page">
      <div className="kids-header">
        <Sparkles size={32} />
        <h1>Escola Dominical Digital</h1>
        <p>Aprenda sobre a Bíblia de um jeito divertido!</p>
      </div>

      {/* Histórias Bíblicas */}
      <section className="kids-section">
        <h2><BookOpen size={24} /> Histórias Bíblicas</h2>
        <div className="kids-stories-grid">
          {STORIES.map(s => (
            <div key={s.id} className="kids-story-card" style={{ borderTop: `4px solid ${s.color}` }}>
              <div className="kids-story-icon" style={{ background: s.color }}>
                <BookOpen size={28} color="#fff" />
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="kids-age-badge" style={{ background: s.color }}>{s.age} anos</span>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', width: '100%' }}>
                Ler História
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz Bíblico */}
      <section className="kids-section">
        <h2><Trophy size={24} /> Quiz Bíblico</h2>
        <div className="kids-quiz-card">
          {!quizDone ? (
            <>
              <div className="kids-quiz-progress">
                Pergunta {quizStep + 1} de {QUIZ.length}
                <div className="kids-quiz-bar">
                  <div style={{ width: `${((quizStep + 1) / QUIZ.length) * 100}%` }} />
                </div>
              </div>
              <h3 className="kids-quiz-question">{QUIZ[quizStep].q}</h3>
              <div className="kids-quiz-options">
                {QUIZ[quizStep].opts.map((opt, idx) => {
                  let cls = 'kids-quiz-opt';
                  if (selected !== null) {
                    if (idx === QUIZ[quizStep].answer) cls += ' correct';
                    else if (idx === selected) cls += ' wrong';
                  }
                  return (
                    <button key={idx} className={cls} onClick={() => handleAnswer(idx)}>
                      {selected !== null && idx === QUIZ[quizStep].answer && <CheckCircle size={18} />}
                      {selected !== null && idx === selected && idx !== QUIZ[quizStep].answer && <XCircle size={18} />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="kids-quiz-result">
              <Trophy size={64} style={{ color: 'var(--gold)' }} />
              <h3>Parabéns!</h3>
              <p>Você acertou <strong>{score}</strong> de <strong>{QUIZ.length}</strong>!</p>
              <div className="kids-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={32} fill={i < score ? '#daa520' : 'none'} color={i < score ? '#daa520' : '#ddd'} />
                ))}
              </div>
              <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>
                {score === 5 ? 'Perfeito! Você é um campeão da Bíblia!' :
                 score >= 3 ? 'Muito bem! Continue estudando!' :
                 'Não desista! Tente de novo!'}
              </p>
              <button className="btn btn-primary" onClick={resetQuiz} style={{ marginTop: '1rem' }}>
                Jogar de Novo
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Versículo da Semana */}
      <section className="kids-section">
        <h2><Heart size={24} /> Versículo da Semana</h2>
        <div className="kids-verse-card">
          <div className="kids-verse-marks">"</div>
          <p className="kids-verse-text">
            Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.
          </p>
          <p className="kids-verse-ref">— João 3:16</p>
          <button
            className={`btn ${memorized ? 'btn-primary' : 'btn-green'}`}
            onClick={() => setMemorized(!memorized)}
            style={{ marginTop: '1rem' }}
          >
            <Star size={16} />
            {memorized ? 'Memorizado!' : 'Já memorizei!'}
          </button>
        </div>
      </section>

      {/* Atividades */}
      <section className="kids-section">
        <h2><Puzzle size={24} /> Atividades</h2>
        <div className="kids-activities-grid">
          {ACTIVITIES.map((a, i) => (
            <div key={i} className="kids-activity-card" style={{ borderTop: `4px solid ${a.color}` }}>
              <a.icon size={40} style={{ color: a.color }} />
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
              <span className="kids-coming-badge">Em breve!</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
