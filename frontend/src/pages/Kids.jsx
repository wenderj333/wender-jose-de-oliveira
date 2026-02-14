import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Star, Trophy, Puzzle, Palette, Brain, Sparkles, CheckCircle, XCircle, Heart, RotateCcw } from 'lucide-react';

const STORY_COLORS = ['#3b5998', '#2d8a4e', '#8b5cf6', '#daa520', '#e74c3c'];
const QUIZ_ANSWERS = [1, 2, 1, 2, 2];

// ─── Coloring Game ───
const COLORING_PALETTE = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#e91e63'];
const COLORING_SHAPES = [
  { id: 'cross', paths: [
    { id: 'c1', d: 'M60,10 L90,10 L90,60 L140,60 L140,90 L90,90 L90,140 L60,140 L60,90 L10,90 L10,60 L60,60 Z', default: '#ddd' },
    { id: 'c2', d: 'M65,15 L85,15 L85,65 L135,65 L135,85 L85,85 L85,135 L65,135 L65,85 L15,85 L15,65 L65,65 Z', default: '#eee' },
  ]},
  { id: 'heart', paths: [
    { id: 'h1', d: 'M75,130 Q10,80 10,45 Q10,10 40,10 Q60,10 75,35 Q90,10 110,10 Q140,10 140,45 Q140,80 75,130 Z', default: '#ddd' },
    { id: 'h2', d: 'M75,115 Q25,75 25,48 Q25,22 45,22 Q60,22 75,42 Q90,22 105,22 Q125,22 125,48 Q125,75 75,115 Z', default: '#eee' },
  ]},
  { id: 'fish', paths: [
    { id: 'f1', d: 'M30,75 Q75,20 130,50 Q140,75 130,100 Q75,130 30,75 Z', default: '#ddd' },
    { id: 'f2', d: 'M10,75 L30,55 L30,95 Z', default: '#ccc' },
    { id: 'f3', d: 'M105,65 A5,5 0 1,1 105,64.99 Z', default: '#333' },
  ]},
  { id: 'star', paths: [
    { id: 's1', d: 'M75,10 L90,55 L140,55 L100,85 L115,130 L75,105 L35,130 L50,85 L10,55 L60,55 Z', default: '#ddd' },
    { id: 's2', d: 'M75,25 L86,55 L120,55 L92,75 L102,110 L75,90 L48,110 L58,75 L30,55 L64,55 Z', default: '#eee' },
  ]},
  { id: 'dove', paths: [
    { id: 'd1', d: 'M40,80 Q60,30 100,50 Q130,60 130,80 Q130,100 100,110 Q60,120 40,80 Z', default: '#ddd' },
    { id: 'd2', d: 'M100,50 Q120,20 140,30 Q130,45 120,50 Z', default: '#eee' },
    { id: 'd3', d: 'M45,85 Q20,100 10,120 Q30,110 50,100 Z', default: '#ccc' },
  ]},
];

function ColoringGame() {
  const [selectedColor, setSelectedColor] = useState(COLORING_PALETTE[0]);
  const [fills, setFills] = useState({});
  const [shapeIdx, setShapeIdx] = useState(0);
  const shape = COLORING_SHAPES[shapeIdx];

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {COLORING_SHAPES.map((s, i) => (
          <button key={s.id} onClick={() => { setShapeIdx(i); setFills({}); }}
            style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: i === shapeIdx ? '2px solid var(--gold)' : '2px solid #555', background: i === shapeIdx ? 'var(--gold)' : '#2d1b69', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            {s.id === 'cross' ? '✝️' : s.id === 'heart' ? '❤️' : s.id === 'fish' ? '🐟' : s.id === 'star' ? '⭐' : '🕊️'} {s.id}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 150 150" style={{ width: '100%', maxWidth: 280, background: '#fff', borderRadius: 12, cursor: 'pointer' }}>
        {shape.paths.map(p => (
          <path key={p.id} d={p.d} fill={fills[p.id] || p.default} stroke="#333" strokeWidth="1.5"
            onClick={() => setFills(prev => ({ ...prev, [p.id]: selectedColor }))} style={{ cursor: 'pointer' }} />
        ))}
      </svg>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
        {COLORING_PALETTE.map(c => (
          <div key={c} onClick={() => setSelectedColor(c)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: c, border: selectedColor === c ? '3px solid #fff' : '3px solid transparent', boxShadow: selectedColor === c ? '0 0 0 2px var(--gold)' : 'none', cursor: 'pointer' }} />
        ))}
      </div>
      <button onClick={() => setFills({})} style={{ marginTop: '0.75rem', padding: '0.4rem 1rem', borderRadius: 8, border: 'none', background: '#555', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
        <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Limpar
      </button>
    </div>
  );
}

// ─── Word Search Game ───
const WS_WORDS = ['JESUS','DEUS','AMOR','CRUZ','PAZ','FE','LUZ','REI'];
const WS_SIZE = 10;

function buildWordSearchGrid() {
  const grid = Array.from({ length: WS_SIZE }, () => Array(WS_SIZE).fill(''));
  const positions = {};
  const placed = [];

  const tryPlace = (word) => {
    const dirs = [[0,1],[1,0]]; // horizontal, vertical
    for (let attempt = 0; attempt < 100; attempt++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * WS_SIZE);
      const c = Math.floor(Math.random() * WS_SIZE);
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const nr = r + dr * i, nc = c + dc * i;
        if (nr >= WS_SIZE || nc >= WS_SIZE) { fits = false; break; }
        if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) { fits = false; break; }
      }
      if (fits) {
        const cells = [];
        for (let i = 0; i < word.length; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          grid[nr][nc] = word[i];
          cells.push(`${nr},${nc}`);
        }
        positions[word] = cells;
        placed.push(word);
        return true;
      }
    }
    return false;
  };

  // Sort by length desc for better placement
  [...WS_WORDS].sort((a, b) => b.length - a.length).forEach(w => tryPlace(w));

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < WS_SIZE; r++)
    for (let c = 0; c < WS_SIZE; c++)
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * 26)];

  return { grid, positions };
}

const INITIAL_WS = buildWordSearchGrid();

function WordSearchGame() {
  const [{ grid, positions }] = useState(INITIAL_WS);
  const [selected, setSelected] = useState([]);
  const [found, setFound] = useState([]);

  const toggleCell = (r, c) => {
    const key = `${r},${c}`;
    let next;
    if (selected.includes(key)) {
      next = selected.filter(k => k !== key);
    } else {
      next = [...selected, key];
    }
    setSelected(next);

    // Check if any word is fully selected
    for (const word of WS_WORDS) {
      if (found.includes(word)) continue;
      const cells = positions[word];
      if (!cells) continue;
      if (cells.every(ck => next.includes(ck))) {
        setFound(prev => [...prev, word]);
      }
    }
  };

  const foundCells = new Set(found.flatMap(w => positions[w] || []));
  const allFound = found.length === Object.keys(positions).length;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${WS_SIZE}, 1fr)`, gap: 2, marginBottom: '1rem' }}>
        {grid.map((row, r) => row.map((letter, c) => {
          const key = `${r},${c}`;
          const isFound = foundCells.has(key);
          const isSel = selected.includes(key);
          return (
            <div key={key} onClick={() => !isFound && toggleCell(r, c)}
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, borderRadius: 4, cursor: isFound ? 'default' : 'pointer',
                background: isFound ? '#daa520' : isSel ? 'rgba(218,165,32,0.4)' : 'rgba(255,255,255,0.1)',
                color: isFound ? '#1a0a3e' : '#fff' }}>
              {letter}
            </div>
          );
        }))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
        {WS_WORDS.map(w => (
          <span key={w} style={{ padding: '0.3rem 0.6rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600,
            background: found.includes(w) ? '#daa520' : 'rgba(255,255,255,0.1)',
            color: found.includes(w) ? '#1a0a3e' : '#aaa',
            textDecoration: found.includes(w) ? 'line-through' : 'none' }}>
            {found.includes(w) ? '✓ ' : ''}{w}
          </span>
        ))}
      </div>
      {allFound && <p style={{ color: '#daa520', fontWeight: 700, marginTop: '1rem', fontSize: '1.1rem' }}>🎉 Parabéns! Encontraste todas as palavras!</p>}
    </div>
  );
}

// ─── Memory Game ───
const MEMORY_EMOJIS = ['🕊️', '✝️', '❤️', '🙏', '⭐', '📖', '🐟', '🌈'];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function MemoryGame() {
  const [cards, setCards] = useState(() => shuffleArray([...MEMORY_EMOJIS, ...MEMORY_EMOJIS]));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  const handleFlip = (idx) => {
    if (busy || flipped.includes(idx) || matched.includes(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      setBusy(true);
      if (cards[next[0]] === cards[next[1]]) {
        setMatched(prev => [...prev, next[0], next[1]]);
        setFlipped([]);
        setBusy(false);
      } else {
        setTimeout(() => { setFlipped([]); setBusy(false); }, 800);
      }
    }
  };

  const reset = () => {
    setCards(shuffleArray([...MEMORY_EMOJIS, ...MEMORY_EMOJIS]));
    setFlipped([]); setMatched([]); setMoves(0); setBusy(false);
  };

  const done = matched.length === 16;

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#ccc', marginBottom: '0.75rem' }}>Jogadas: <strong style={{ color: '#daa520' }}>{moves}</strong></p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 300, margin: '0 auto' }}>
        {cards.map((emoji, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i);
          return (
            <div key={i} onClick={() => handleFlip(i)}
              style={{ width: '100%', aspectRatio: '1', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
                background: isFlipped ? 'rgba(255,255,255,0.15)' : '#2d1b69',
                border: matched.includes(i) ? '2px solid #daa520' : '2px solid #4a2d8a',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                transition: 'transform 0.4s, background 0.3s' }}>
              {isFlipped ? emoji : '?'}
            </div>
          );
        })}
      </div>
      {done && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: '#daa520', fontWeight: 700, fontSize: '1.1rem' }}>🎉 Parabéns! Completaste em {moves} jogadas!</p>
          <button onClick={reset} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            <RotateCcw size={14} /> Jogar novamente
          </button>
        </div>
      )}
      {!done && <button onClick={reset} style={{ marginTop: '0.75rem', padding: '0.4rem 1rem', borderRadius: 8, border: 'none', background: '#555', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}><RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Reiniciar</button>}
    </div>
  );
}

// ─── Sliding Puzzle ───
const PUZZLE_VERSE = ['Porque', 'Deus', 'amou', 'o mundo', 'de tal', 'maneira', 'que deu', 'seu Filho', ''];

function createSolvedPuzzle() {
  return [1, 2, 3, 4, 5, 6, 7, 8, 0];
}

function shufflePuzzle() {
  let tiles = createSolvedPuzzle();
  // Do random valid moves to ensure solvability
  for (let i = 0; i < 200; i++) {
    const emptyIdx = tiles.indexOf(0);
    const r = Math.floor(emptyIdx / 3), c = emptyIdx % 3;
    const neighbors = [];
    if (r > 0) neighbors.push(emptyIdx - 3);
    if (r < 2) neighbors.push(emptyIdx + 3);
    if (c > 0) neighbors.push(emptyIdx - 1);
    if (c < 2) neighbors.push(emptyIdx + 1);
    const swap = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[emptyIdx], tiles[swap]] = [tiles[swap], tiles[emptyIdx]];
  }
  return tiles;
}

function PuzzleGame() {
  const [tiles, setTiles] = useState(() => shufflePuzzle());
  const [moves, setMoves] = useState(0);

  const isSolved = tiles.every((t, i) => t === (i + 1) % 9);

  const handleClick = (idx) => {
    if (isSolved) return;
    const emptyIdx = tiles.indexOf(0);
    const r1 = Math.floor(idx / 3), c1 = idx % 3;
    const r2 = Math.floor(emptyIdx / 3), c2 = emptyIdx % 3;
    if ((Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1) {
      const next = [...tiles];
      [next[idx], next[emptyIdx]] = [next[emptyIdx], next[idx]];
      setTiles(next);
      setMoves(m => m + 1);
    }
  };

  const reset = () => { setTiles(shufflePuzzle()); setMoves(0); };

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#ccc', marginBottom: '0.5rem', fontSize: '0.85rem' }}>João 3:16 — Organiza o versículo!</p>
      <p style={{ color: '#ccc', marginBottom: '0.75rem' }}>Jogadas: <strong style={{ color: '#daa520' }}>{moves}</strong></p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, maxWidth: 260, margin: '0 auto' }}>
        {tiles.map((t, i) => (
          <div key={i} onClick={() => handleClick(i)}
            style={{ aspectRatio: '1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: t === 0 ? 'default' : 'pointer',
              background: t === 0 ? 'transparent' : isSolved ? '#daa520' : '#2d1b69',
              border: t === 0 ? 'none' : '2px solid #4a2d8a',
              color: isSolved ? '#1a0a3e' : '#fff', fontWeight: 700, fontSize: '0.75rem', padding: 4, textAlign: 'center',
              transition: 'all 0.15s' }}>
            {t !== 0 && (
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t}</div>
                <div style={{ fontSize: '0.65rem', marginTop: 2 }}>{PUZZLE_VERSE[t - 1]}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      {isSolved && (
        <p style={{ color: '#daa520', fontWeight: 700, marginTop: '1rem', fontSize: '1.1rem' }}>🎉 Parabéns! Resolveste em {moves} jogadas!</p>
      )}
      <button onClick={reset} style={{ marginTop: '0.75rem', padding: '0.4rem 1rem', borderRadius: 8, border: 'none', background: '#555', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
        <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {isSolved ? 'Jogar novamente' : 'Reiniciar'}
      </button>
    </div>
  );
}

// ─── Game Tabs ───
const GAMES = [
  { key: 'coloring', icon: '🎨', label: 'Colorir', component: ColoringGame },
  { key: 'wordsearch', icon: '🔤', label: 'Sopa de Letras', component: WordSearchGame },
  { key: 'memory', icon: '🧠', label: 'Memória', component: MemoryGame },
  { key: 'puzzle', icon: '🧩', label: 'Quebra-Cabeça', component: PuzzleGame },
];

// ─── Main Page ───
export default function Kids() {
  const { t } = useTranslation();
  const [quizStep, setQuizStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAns, setSelectedAns] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [memorized, setMemorized] = useState(false);
  const [activeGame, setActiveGame] = useState('coloring');

  const stories = t('kids.stories', { returnObjects: true });
  const quiz = t('kids.quiz', { returnObjects: true });

  const handleAnswer = (idx) => {
    if (selectedAns !== null) return;
    setSelectedAns(idx);
    if (idx === QUIZ_ANSWERS[quizStep]) setScore(s => s + 1);
    setTimeout(() => {
      if (quizStep < quiz.length - 1) { setQuizStep(s => s + 1); setSelectedAns(null); }
      else { setQuizDone(true); }
    }, 1200);
  };

  const resetQuiz = () => { setQuizStep(0); setScore(0); setSelectedAns(null); setQuizDone(false); };

  const ActiveGameComponent = GAMES.find(g => g.key === activeGame)?.component;

  return (
    <div className="kids-page">
      <div className="kids-header">
        <Sparkles size={32} />
        <h1>{t('kids.title')}</h1>
        <p>{t('kids.subtitle')}</p>
      </div>

      {/* Stories */}
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

      {/* Quiz */}
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
                  if (selectedAns !== null) {
                    if (idx === QUIZ_ANSWERS[quizStep]) cls += ' correct';
                    else if (idx === selectedAns) cls += ' wrong';
                  }
                  return (
                    <button key={idx} className={cls} onClick={() => handleAnswer(idx)}>
                      {selectedAns !== null && idx === QUIZ_ANSWERS[quizStep] && <CheckCircle size={18} />}
                      {selectedAns !== null && idx === selectedAns && idx !== QUIZ_ANSWERS[quizStep] && <XCircle size={18} />}
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

      {/* Verse */}
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

      {/* Interactive Games */}
      <section className="kids-section">
        <h2><Puzzle size={24} /> {t('kids.activities')}</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {GAMES.map(g => (
            <button key={g.key} onClick={() => setActiveGame(g.key)}
              style={{ padding: '0.6rem 1rem', borderRadius: 12, border: activeGame === g.key ? '2px solid #daa520' : '2px solid rgba(255,255,255,0.15)', background: activeGame === g.key ? 'rgba(218,165,32,0.2)' : 'rgba(255,255,255,0.05)', color: activeGame === g.key ? '#daa520' : '#ccc', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}>
              {g.icon} {g.label}
            </button>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          {ActiveGameComponent && <ActiveGameComponent />}
        </div>
      </section>
    </div>
  );
}
