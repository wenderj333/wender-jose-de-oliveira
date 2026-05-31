import React, { useState, useEffect, useRef, useCallback } from 'react';

const LessonReader = ({ lessons, lessonContents, currentIndex, totalLessons, courseType, accentColor = '#d4af37', onClose, onNavigate }) => {
  const lesson = lessons[currentIndex];
  const content = lessonContents[currentIndex];
  const [notes, setNotes] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState(null);
  const [visible, setVisible] = useState(false);
  const saveTimer = useRef(null);

  const storageKey = `notes_${courseType}_${lesson.id}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setNotes(saved);
    else setNotes('');
    setTranslated(null);
    setTimeout(() => setVisible(true), 50);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [currentIndex, storageKey]);

  const handleNotesChange = useCallback((e) => {
    const val = e.target.value;
    setNotes(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(storageKey, val);
    }, 500);
  }, [storageKey]);

  const handleTranslate = async () => {
    const lang = localStorage.getItem('i18nextLng') || 'en';
    if (lang === 'pt' || lang === 'pt-BR') return;
    setTranslating(true);
    try {
      const textsToTranslate = [
        content.title,
        ...content.paragraphs,
        ...content.verses.map(v => v.text + ' — ' + v.ref),
        content.challenge,
      ];
      const results = await Promise.all(
        textsToTranslate.map(async (text) => {
          const encoded = encodeURIComponent(text.substring(0, 500));
          const res = await fetch(`https://api.mymemory.translated.net/get?q=${encoded}&langpair=pt|${lang}`);
          const data = await res.json();
          return data.responseData?.translatedText || text;
        })
      );
      let idx = 0;
      setTranslated({
        title: results[idx++],
        paragraphs: content.paragraphs.map(() => results[idx++]),
        verses: content.verses.map(() => results[idx++]),
        challenge: results[idx++],
      });
    } catch (e) {
      console.error('Translation error:', e);
    } finally {
      setTranslating(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const c = translated || {
    title: content.title,
    paragraphs: content.paragraphs,
    verses: content.verses.map(v => v.text + '\n— ' + v.ref),
    challenge: content.challenge,
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: 'linear-gradient(180deg, #0a0a0f 0%, #111118 30%, #0d0d14 100%)',
      overflowY: 'auto', transition: 'opacity 0.3s ease',
      opacity: visible ? 1 : 0,
    }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${accentColor}22`,
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={handleClose} style={{
          background: 'none', border: `1px solid ${accentColor}44`, color: accentColor,
          padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem',
          fontWeight: 600, transition: 'all 0.2s',
        }}>
          ← Voltar ao Curso
        </button>
        <div style={{ color: '#aaa', fontSize: '0.9rem', fontWeight: 600 }}>
          Lição {currentIndex + 1} de {totalLessons}
        </div>
        <button onClick={handleTranslate} disabled={translating} style={{
          background: translating ? 'rgba(255,255,255,0.1)' : `${accentColor}22`,
          border: `1px solid ${accentColor}44`, color: accentColor,
          padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem',
          fontWeight: 600, transition: 'all 0.2s',
        }}>
          {translating ? '⏳ Traduzindo...' : '🌐 Traduzir'}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{
          height: '100%', background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
          width: `${((currentIndex + 1) / totalLessons) * 100}%`, transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Content area */}
      <div style={{
        maxWidth: 700, margin: '0 auto', padding: '3rem 1.5rem 4rem',
        animation: visible ? 'fadeInUp 0.5s ease' : 'none',
      }}>
        {/* VIP Badge */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{
            background: 'linear-gradient(135deg, #d4af37, #f0d060)',
            color: '#1a1a00', padding: '4px 14px', borderRadius: 20,
            fontSize: '0.75rem', fontWeight: 800, letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            👑 Conteúdo VIP Premium
          </span>
        </div>

        {/* Lesson icon */}
        <div style={{ textAlign: 'center', fontSize: '4rem', marginBottom: '1rem' }}>
          {lesson.icon}
        </div>

        {/* Title */}
        <h1 style={{
          textAlign: 'center', color: accentColor,
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 700,
          lineHeight: 1.3, marginBottom: '0.5rem',
        }}>
          {c.title}
        </h1>

        <div style={{
          width: 60, height: 2, background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          margin: '1.5rem auto 2.5rem',
        }} />

        {/* Paragraphs */}
        {c.paragraphs.map((p, i) => (
          <p key={i} style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '1.1rem', lineHeight: 1.85, color: '#d4d4d8',
            marginBottom: '1.5rem', textAlign: 'justify',
          }}>
            {p}
          </p>
        ))}

        {/* Verses */}
        {content.verses.map((verse, i) => (
          <div key={i} style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03))',
            border: `1px solid ${accentColor}33`, borderLeft: `4px solid ${accentColor}`,
            borderRadius: 12, padding: '1.5rem', margin: '2rem 0',
          }}>
            <p style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '1.15rem', lineHeight: 1.8, color: '#e8e0c8',
              fontStyle: 'italic', margin: 0,
            }}>
              "{translated ? c.verses[i].split('\n')[0] : verse.text}"
            </p>
            <p style={{
              color: accentColor, fontWeight: 700, fontSize: '0.95rem',
              marginTop: '0.75rem', marginBottom: 0, textAlign: 'right',
            }}>
              📖 {translated ? c.verses[i].split('—')[1]?.trim() || verse.ref : verse.ref}
            </p>
          </div>
        ))}

        {/* Challenge */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))',
          border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12,
          padding: '1.5rem', margin: '2.5rem 0',
        }}>
          <div style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>🎯 Desafio Prático</div>
          <p style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '1.05rem', lineHeight: 1.75, color: '#c4b5fd', margin: 0,
          }}>
            {c.challenge}
          </p>
        </div>

        {/* Notes */}
        <div style={{ margin: '3rem 0 2rem' }}>
          <div style={{ color: '#aaa', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            📝 Suas Anotações
          </div>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Escreva suas anotações aqui..."
            style={{
              width: '100%', minHeight: 150, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
              padding: '1rem', color: '#d4d4d8', fontSize: '1rem',
              fontFamily: 'Georgia, "Times New Roman", serif',
              lineHeight: 1.7, resize: 'vertical', outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => e.target.style.borderColor = `${accentColor}66`}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <div style={{ color: '#555', fontSize: '0.8rem', marginTop: 4 }}>
            Salvo automaticamente
          </div>
        </div>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', gap: 16,
          marginTop: '3rem', paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <button
            onClick={() => currentIndex > 0 && onNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            style={{
              flex: 1, padding: '14px 20px', borderRadius: 12,
              background: currentIndex > 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: currentIndex > 0 ? '#d4d4d8' : '#444',
              fontSize: '0.95rem', fontWeight: 600, cursor: currentIndex > 0 ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            ← Lição Anterior
          </button>
          <button
            onClick={() => currentIndex < totalLessons - 1 && onNavigate(currentIndex + 1)}
            disabled={currentIndex === totalLessons - 1}
            style={{
              flex: 1, padding: '14px 20px', borderRadius: 12,
              background: currentIndex < totalLessons - 1 ? `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${currentIndex < totalLessons - 1 ? accentColor + '44' : 'rgba(255,255,255,0.1)'}`,
              color: currentIndex < totalLessons - 1 ? accentColor : '#444',
              fontSize: '0.95rem', fontWeight: 600,
              cursor: currentIndex < totalLessons - 1 ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            Próxima Lição →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LessonReader;
