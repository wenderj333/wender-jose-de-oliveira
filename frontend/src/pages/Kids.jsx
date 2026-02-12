import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Star, Trophy, Puzzle, Palette, Brain, Sparkles, CheckCircle, XCircle, Heart } from 'lucide-react';

const STORY_COLORS = ['#3b5998', '#2d8a4e', '#8b5cf6', '#daa520', '#e74c3c'];
const QUIZ_ANSWERS = [1, 2, 1, 2, 2];
const ACTIVITY_ICONS = [Palette, Brain, Puzzle, Sparkles];
const ACTIVITY_COLORS = ['#e74c3c', '#3b5998', '#2d8a4e', '#8b5cf6'];

export default function Kids() {
  const { t } = useTranslation();
  const [quizStep, setQuizStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [memorized, setMemorized] = useState(false);

  const stories = t('kids.stories', { returnObjects: true });
  const quiz = t('kids.quiz', { returnObjects: true });
  const activityList = t('kids.activityList', { returnObjects: true });

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === QUIZ_ANSWERS[quizStep]) setScore(s => s + 1);
    setTimeout(() => {
      if (quizStep < quiz.length - 1) { setQuizStep(s => s + 1); setSelected(null); }
      else { setQuizDone(true); }
    }, 1200);
  };

  const resetQuiz = () => { setQuizStep(0); setScore(0); setSelected(null); setQuizDone(false); };

  return (
    <div className="kids-page">
      <div className="kids-header">
        <Sparkles size={32} />
        <h1>{t('kids.title')}</h1>
        <p>{t('kids.subtitle')}</p>
      </div>

      <section className="kids-section">
        <h2><BookOpen size={24} /> {t('kids.bibleStories')}</h2>
        <div className="kids-stories-grid">
          {stories.map((s, i) => (
            <div key={i} className="kids-story-card" style={{ borderTop: `4px solid ${STORY_COLORS[i]}` }}>
              <div className="kids-story-icon" style={{ background: STORY_COLORS[i] }}>
                <BookOpen size={28} color="#fff" />
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="kids-age-badge" style={{ background: STORY_COLORS[i] }}>{s.age} {t('kids.years')}</span>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', width: '100%' }}>{t('kids.readStory')}</button>
            </div>
          ))}
        </div>
      </section>

      <section className="kids-section">
        <h2><Trophy size={24} /> {t('kids.bibleQuiz')}</h2>
        <div className="kids-quiz-card">
          {!quizDone ? (
            <>
              <div className="kids-quiz-progress">
                {t('kids.question', { current: quizStep + 1, total: quiz.length })}
                <div className="kids-quiz-bar"><div style={{ width: `${((quizStep + 1) / quiz.length) * 100}%` }} /></div>
              </div>
              <h3 className="kids-quiz-question">{quiz[quizStep].q}</h3>
              <div className="kids-quiz-options">
                {quiz[quizStep].opts.map((opt, idx) => {
                  let cls = 'kids-quiz-opt';
                  if (selected !== null) {
                    if (idx === QUIZ_ANSWERS[quizStep]) cls += ' correct';
                    else if (idx === selected) cls += ' wrong';
                  }
                  return (
                    <button key={idx} className={cls} onClick={() => handleAnswer(idx)}>
                      {selected !== null && idx === QUIZ_ANSWERS[quizStep] && <CheckCircle size={18} />}
                      {selected !== null && idx === selected && idx !== QUIZ_ANSWERS[quizStep] && <XCircle size={18} />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="kids-quiz-result">
              <Trophy size={64} style={{ color: 'var(--gold)' }} />
              <h3>{t('kids.congrats')}</h3>
              <p dangerouslySetInnerHTML={{ __html: t('kids.scoreResult', { score, total: quiz.length }) }} />
              <div className="kids-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={32} fill={i < score ? '#daa520' : 'none'} color={i < score ? '#daa520' : '#ddd'} />
                ))}
              </div>
              <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>
                {score === 5 ? t('kids.perfect') : score >= 3 ? t('kids.good') : t('kids.tryAgain')}
              </p>
              <button className="btn btn-primary" onClick={resetQuiz} style={{ marginTop: '1rem' }}>{t('kids.playAgain')}</button>
            </div>
          )}
        </div>
      </section>

      <section className="kids-section">
        <h2><Heart size={24} /> {t('kids.weekVerse')}</h2>
        <div className="kids-verse-card">
          <div className="kids-verse-marks">"</div>
          <p className="kids-verse-text">{t('kids.weekVerseText')}</p>
          <p className="kids-verse-ref">{t('kids.weekVerseRef')}</p>
          <button className={`btn ${memorized ? 'btn-primary' : 'btn-green'}`} onClick={() => setMemorized(!memorized)} style={{ marginTop: '1rem' }}>
            <Star size={16} /> {memorized ? t('kids.memorized') : t('kids.memorize')}
          </button>
        </div>
      </section>

      <section className="kids-section">
        <h2><Puzzle size={24} /> {t('kids.activities')}</h2>
        <div className="kids-activities-grid">
          {activityList.map((a, i) => {
            const Icon = ACTIVITY_ICONS[i];
            return (
              <div key={i} className="kids-activity-card" style={{ borderTop: `4px solid ${ACTIVITY_COLORS[i]}` }}>
                <Icon size={40} style={{ color: ACTIVITY_COLORS[i] }} />
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
                <span className="kids-coming-badge">{t('kids.comingSoon')}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
