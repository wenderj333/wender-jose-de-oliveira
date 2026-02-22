import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Music, Sparkles, BookOpen, Heart, Download, Share2, Trash2, ChevronDown, ArrowLeft } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

const THEMES = [
  { value: 'fe', label: '✝️ Fé', color: '#daa520' },
  { value: 'esperanca', label: '🌅 Esperança', color: '#f39c12' },
  { value: 'gratidao', label: '🙏 Gratidão', color: '#27ae60' },
  { value: 'cura', label: '💚 Cura', color: '#2ecc71' },
  { value: 'familia', label: '👨‍👩‍👧‍👦 Família', color: '#e74c3c' },
  { value: 'amor', label: '❤️ Amor de Deus', color: '#c0392b' },
  { value: 'adoracao', label: '👑 Adoração', color: '#9b59b6' },
  { value: 'vitoria', label: '🏆 Vitória', color: '#f1c40f' },
  { value: 'paz', label: '🕊️ Paz', color: '#3498db' },
  { value: 'avivamento', label: '🔥 Avivamento', color: '#e67e22' },
  { value: 'perdao', label: '💝 Perdão', color: '#e91e63' },
  { value: 'salvacao', label: '✨ Salvação', color: '#8e44ad' },
];

const STYLES = [
  { value: 'worship', label: '🎹 Worship' },
  { value: 'pentecostal', label: '🔥 Pentecostal' },
  { value: 'coral', label: '🎶 Coral' },
  { value: 'acustico', label: '🎸 Acústico' },
  { value: 'pop_gospel', label: '🎤 Pop Gospel' },
  { value: 'sertanejo_gospel', label: '🤠 Sertanejo Gospel' },
  { value: 'reggae_gospel', label: '🎵 Reggae Gospel' },
  { value: 'hino', label: '📖 Hino Tradicional' },
];

const EMOTIONS = [
  { value: 'alegre', label: '😊 Alegre' },
  { value: 'profundo', label: '🌊 Profundo' },
  { value: 'oracao', label: '🙏 Oração' },
  { value: 'celebracao', label: '🎉 Celebração' },
  { value: 'intimidade', label: '💜 Intimidade com Deus' },
  { value: 'guerra', label: '⚔️ Guerra Espiritual' },
  { value: 'conforto', label: '🤗 Conforto' },
  { value: 'louvor_intenso', label: '🔥 Louvor Intenso' },
];

const BIBLE_BOOKS = [
  'Gênesis', 'Êxodo', 'Salmos', 'Provérbios', 'Isaías', 'Jeremias',
  'Mateus', 'Marcos', 'Lucas', 'João', 'Atos', 'Romanos',
  '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses',
  'Colossenses', 'Hebreus', 'Tiago', 'Apocalipse',
];

export default function CriadorLouvor() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [credits, setCredits] = useState(null);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [tab, setTab] = useState('create');
  const [mySongs, setMySongs] = useState([]);
  const [expandedSong, setExpandedSong] = useState(null);

  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('worship');
  const [emotion, setEmotion] = useState('alegre');
  const [bibleBook, setBibleBook] = useState('');
  const [verse, setVerse] = useState('');
  const detectedLang = (localStorage.getItem('i18nextLng') || 'pt').substring(0, 2);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [generatingAudioForSongId, setGeneratingAudioForSongId] = useState(null);

  const [showCustomLyricForm, setShowCustomLyricForm] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customLyrics, setCustomLyrics] = useState('');
  const [customTheme, setCustomTheme] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [savingCustomLyric, setSavingCustomLyric] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCredits();
      fetchMySongs();
    }
  }, [token]);

  async function fetchCredits() {
    try {
      const res = await fetch(`${API}/ai-louvor/credits`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCredits(data.credits);
      setTotalGenerated(data.totalGenerated);
    } catch {}
  }

  async function fetchMySongs() {
    try {
      const res = await fetch(`${API}/ai-louvor/my-songs`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMySongs(data.songs || []);
    } catch {}
  }

  async function handleGenerate() {
    if (!token) return navigate('/login');
    if (credits !== null && credits <= 0) { setError('no_credits'); return; }
    if (!theme && !verse) { setError('Escolha um tema ou escreva um versículo'); return; }

    setGenerating(true);
    setError('');
    setResult(null);
    setAudioUrl(null);
    setAudioError('');

    try {
      const res = await fetch(`${API}/ai-louvor/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ theme, style, emotion, bibleBook, verse, language: detectedLang }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'no_credits') setError('no_credits');
        else setError(data.error || data.message || `Erro ${res.status}: Tente novamente.`);
        return;
      }
      setResult(data);
      setCredits(data.creditsRemaining);
      setTotalGenerated(prev => prev + 1);
      fetchMySongs();
    } catch (err) {
      setError(`Erro de conexão: ${err.message || 'Verifique sua internet.'}`);
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateAudio(song) {
    const targetSong = song || result?.song;
    if (!targetSong) return;

    if (song) {
      setGeneratingAudioForSongId(song.id);
    } else {
      setGeneratingAudio(true);
      setAudioError('');
      setAudioUrl(null);
    }

    try {
      const res = await fetch(`${API}/ai-louvor/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lyrics: targetSong.lyrics,
          songId: targetSong.id,
          title: targetSong.title,
          style: targetSong.style || style,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (song) setError(data.error || 'Erro ao gerar música.');
        else setAudioError(data.error || 'Erro ao gerar música. Tente novamente.');
        return;
      }
      if (song) {
        setMySongs(prev => prev.map(s => s.id === song.id ? { ...s, audio_url: data.audioUrl } : s));
      } else {
        setAudioUrl(data.audioUrl);
      }
    } catch (err) {
      if (song) setError(`Erro: ${err.message}`);
      else setAudioError(`Erro: ${err.message}`);
    } finally {
      if (song) setGeneratingAudioForSongId(null);
      else setGeneratingAudio(false);
    }
  }

  async function handleSaveCustomLyric() {
    if (!customTitle || !customLyrics) { setError('Título e letra são obrigatórios!'); return; }
    setSavingCustomLyric(true);
    setError('');
    try {
      const res = await fetch(`${API}/ai-louvor/save-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: customTitle, lyrics: customLyrics, theme: customTheme, style: customStyle, language: detectedLang }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao salvar letra.'); return; }
      setCustomTitle(''); setCustomLyrics(''); setCustomTheme(''); setCustomStyle('');
      setShowCustomLyricForm(false);
      fetchMySongs();
      setTab('songs');
      alert('✅ Letra salva com sucesso!');
    } catch (err) {
      setError(`Erro: ${err.message}`);
    } finally {
      setSavingCustomLyric(false);
    }
  }

  async function handleDelete(songId) {
    if (!confirm('Excluir esta música?')) return;
    try {
      await fetch(`${API}/ai-louvor/song/${songId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setMySongs(prev => prev.filter(s => s.id !== songId));
    } catch {}
  }

  function handleShare(song) {
    const text = `🎵 ${song.title}\n\n${song.lyrics?.slice(0, 300)}...\n\n🙏 Sigo com Fé\nhttps://sigo-com-fe.vercel.app/criador-louvor`;
    if (navigator.share) navigator.share({ title: song.title, text }).catch(() => {});
    else { navigator.clipboard?.writeText(text); alert('Copiado! ✅'); }
  }

  function handleDownload(song) {
    const blob = new Blob([`${song.title}\n\n${song.lyrics}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${song.title || 'louvor'}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 500, margin: '2rem auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
        <h1 style={{ fontSize: '1.5rem', color: '#1a0a3e', marginBottom: '0.5rem' }}>Criador de Louvor com IA</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Crie letras de louvor inspiradas na Bíblia!</p>
        <button onClick={() => navigate('/cadastro')} style={{
          padding: '0.8rem 2rem', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #daa520, #f4c542)', color: '#1a0a3e', fontWeight: 700, fontSize: '1rem',
        }}>Criar conta grátis — 4 músicas grátis!</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a0a3e, #4a1a8e, #9b59b6)',
        borderRadius: 20, padding: '1.5rem', marginBottom: '1rem', color: '#fff',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '8rem', opacity: 0.1 }}>🎵</div>
        <h1 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Sparkles size={24} /> Criador de Louvor com IA
        </h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', opacity: 0.9 }}>Crie letras e músicas de louvor inspiradas na Bíblia</p>
        <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '0.4rem 1rem' }}>
          <Music size={16} />
          <span style={{ fontWeight: 700 }}>{credits !== null ? credits : '...'}</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>créditos restantes</span>
        </div>
        {credits !== null && credits <= 0 && (
          <div style={{ marginTop: '0.75rem', background: 'linear-gradient(135deg, #f4c542, #daa520)', borderRadius: 14, padding: '0.6rem 1rem', color: '#1a0a3e' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>🎵 Pacote 250 Músicas — €5</div>
            <button onClick={() => alert('💳 Em breve!')} style={{ marginTop: 8, padding: '0.5rem 1.5rem', borderRadius: 12, border: 'none', background: '#1a0a3e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Comprar agora</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', marginBottom: '1rem', borderRadius: 12, overflow: 'hidden', border: '2px solid #9b59b6' }}>
        {[{ key: 'create', label: '✨ Criar Louvor' }, { key: 'songs', label: `🎵 Minhas Músicas (${mySongs.length})` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            background: tab === t.key ? '#9b59b6' : '#fff', color: tab === t.key ? '#fff' : '#9b59b6',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'create' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '1rem', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ background: 'linear-gradient(135deg, #f0e8ff, #e8f0ff)', borderRadius: 14, padding: '0.8rem 1rem', marginBottom: '1rem', border: '1px solid #d0c0ff' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#4a1a8e', marginBottom: 6 }}>📋 Como criar teu louvor:</div>
            <div style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.7 }}>
              <div><strong>1️⃣</strong> Escolha um <strong>tema</strong></div>
              <div><strong>2️⃣</strong> Selecione o <strong>estilo</strong> e a <strong>emoção</strong></div>
              <div><strong>3️⃣</strong> Opcional: <strong>livro da Bíblia</strong> e/ou <strong>versículo</strong></div>
              <div><strong>4️⃣</strong> Clique <strong>"Gerar Louvor"</strong> depois <strong>"🎵 Gerar Música"</strong>!</div>
            </div>
          </div>

          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>🎯 Tema</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
            {THEMES.map(th => (
              <button key={th.value} onClick={() => setTheme(th.value)} style={{
                padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                background: theme === th.value ? th.color + '25' : '#f5f5f5',
                color: theme === th.value ? th.color : '#666', fontWeight: theme === th.value ? 700 : 400,
              }}>{th.label}</button>
            ))}
          </div>

          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>🎵 Estilo Musical</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
            {STYLES.map(s => (
              <button key={s.value} onClick={() => setStyle(s.value)} style={{
                padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                background: style === s.value ? '#9b59b622' : '#f5f5f5',
                color: style === s.value ? '#9b59b6' : '#666', fontWeight: style === s.value ? 700 : 400,
              }}>{s.label}</button>
            ))}
          </div>

          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>💫 Emoção</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
            {EMOTIONS.map(em => (
              <button key={em.value} onClick={() => setEmotion(em.value)} style={{
                padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                background: emotion === em.value ? '#667eea22' : '#f5f5f5',
                color: emotion === em.value ? '#667eea' : '#666', fontWeight: emotion === em.value ? 700 : 400,
              }}>{em.label}</button>
            ))}
          </div>

          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>📖 Livro da Bíblia (opcional)</label>
          <select value={bibleBook} onChange={e => setBibleBook(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd', fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box' }}>
            <option value="">Escolha um livro...</option>
            {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>📜 Versículo (opcional)</label>
          <input value={verse} onChange={e => setVerse(e.target.value)} placeholder='Ex: João 3:16'
            style={{ width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd', fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box' }} />

          {error && error !== 'no_credits' && (
            <div style={{ background: '#fee', borderRadius: 10, padding: '0.6rem', marginBottom: '0.75rem', color: '#c0392b', fontSize: '0.85rem' }}>❌ {error}</div>
          )}
          {error === 'no_credits' && (
            <div style={{ background: 'linear-gradient(135deg, #fff5e0, #fff0d0)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem', textAlign: 'center', border: '2px solid #daa520' }}>
              <div style={{ fontWeight: 700, color: '#1a0a3e' }}>Seus créditos acabaram!</div>
              <button onClick={() => alert('💳 Em breve!')} style={{ marginTop: 8, padding: '0.5rem 1.5rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #daa520, #f4c542)', color: '#1a0a3e', fontWeight: 700, cursor: 'pointer' }}>Comprar €5 — 250 músicas</button>
            </div>
          )}

          <button onClick={handleGenerate} disabled={generating || (credits !== null && credits <= 0)} style={{
            width: '100%', padding: '0.85rem', borderRadius: 14, border: 'none',
            background: generating ? '#ccc' : 'linear-gradient(135deg, #9b59b6, #667eea)',
            color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: generating ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {generating ? (<><div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Criando...</>) : (<><Sparkles size={20} /> Gerar Louvor com IA</>)}
          </button>

          <button onClick={() => setShowCustomLyricForm(prev => !prev)} style={{
            width: '100%', padding: '0.75rem', borderRadius: 14, border: '2px solid #9b59b6',
