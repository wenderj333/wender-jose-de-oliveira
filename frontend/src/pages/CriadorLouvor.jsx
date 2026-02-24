import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Music, Sparkles, Heart, Download, Share2, Trash2, ChevronDown } from 'lucide-react';

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
<<<<<<< HEAD
  const [showCustomLyricForm, setShowCustomLyricForm] = useState(false); // Novo estado para controlar a visibilidade do formulário de letra própria
  // Estados para o formulário de letra própria
  const [customTitle, setCustomTitle] = useState('');
  const [customLyrics, setCustomLyrics] = useState('');
  const [customTheme, setCustomTheme] = useState('');
  const [customStyle, setCustomStyle] = useState('worship');
  const [savingCustomLyric, setSavingCustomLyric] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null); // Novo estado para o URL do áudio
  const [generatingAudio, setGeneratingAudio] = useState(false); // Novo estado para o carregamento do áudio
  const [generatingAudioForSongId, setGeneratingAudioForSongId] = useState(null); // Novo estado para controlar qual música está gerando áudio na lista
=======
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
>>>>>>> ae3430498bffb3fe64c298d720b8491f5b3961ff

  useEffect(() => {
    if (token) { fetchCredits(); fetchMySongs(); }
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
    setGenerating(true); setError(''); setResult(null); setAudioUrl(null); setAudioError('');
    try {
      const res = await fetch(`${API}/ai-louvor/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ theme, style, emotion, bibleBook, verse, language: detectedLang }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'no_credits') setError('no_credits');
        else setError(data.error || data.message || `Erro ${res.status}`);
        return;
      }
      setResult(data); setCredits(data.creditsRemaining);
      setTotalGenerated(prev => prev + 1); fetchMySongs();
    } catch (err) {
      setError(`Erro de conexão: ${err.message}`);
    } finally { setGenerating(false); }
  }

  async function handleGenerateAudio(song) {
    const targetSong = song || result?.song;
    if (!targetSong) return;
    if (song) { setGeneratingAudioForSongId(song.id); }
    else { setGeneratingAudio(true); setAudioError(''); setAudioUrl(null); }
    try {
      const res = await fetch(`${API}/ai-louvor/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lyrics: targetSong.lyrics, songId: targetSong.id, title: targetSong.title, style: targetSong.style || style }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (song) setError(data.error || 'Erro ao gerar música.');
        else setAudioError(data.error || 'Erro ao gerar música.');
        return;
      }
      if (song) setMySongs(prev => prev.map(s => s.id === song.id ? { ...s, audio_url: data.audioUrl } : s));
      else setAudioUrl(data.audioUrl);
    } catch (err) {
      if (song) setError(`Erro: ${err.message}`);
      else setAudioError(`Erro: ${err.message}`);
    } finally {
      if (song) setGeneratingAudioForSongId(null);
      else setGeneratingAudio(false);
    }
  }

<<<<<<< HEAD
  async function handleGenerateAudio(song = result?.song) { // Aceitar 'song' como argumento, com fallback para 'result.song'
    if (!token) return navigate('/login');
    if (!song || !song.lyrics || !song.id) { // Usar 'song' em vez de 'result'
      setError('Primeiro gere uma letra de louvor ou selecione uma música.');
      return;
    }

    setGeneratingAudioForSongId(song.id); // Definir qual música está gerando
    setError('');
    // setAudioUrl(null); // Não limpar audioUrl globalmente para não afetar outras músicas na lista

    try {
      const res = await fetch(`${API}/ai-louvor/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lyrics: song.lyrics,
          songId: song.id,
          title: song.title,
          style: song.style, // Usar o estilo da música salva
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || `Erro ${res.status}: Falha ao gerar música.`);
        console.error('Replicate Audio error:', res.status, data);
        return;
      }
      // Atualizar o frontend para mostrar o novo audioUrl para a música específica
      setMySongs(prevSongs => prevSongs.map(s => s.id === song.id ? { ...s, audio_url: data.audioUrl } : s));
      // Se for a música que acabou de ser gerada na aba "Criar Louvor", atualiza o result.audioUrl
      if (result?.song?.id === song.id) {
        setResult(prevResult => ({ ...prevResult, audioUrl: data.audioUrl }));
      }
    } catch (err) {
      console.error('Network error (audio generation):', err);
      setError(`Erro de conexão ao gerar música: ${err.message || 'Verifique sua internet.'}`);
    } finally {
      setGeneratingAudioForSongId(null); // Limpar ao finalizar
    }
  }

  async function handleSaveCustomLyric() {
    if (!token) return navigate('/login');
    if (!customTitle || !customLyrics) {
      setError('Título e letra são obrigatórios para salvar sua letra.');
      return;
    }

    setSavingCustomLyric(true);
    setError('');

=======
  async function handleSaveCustomLyric() {
    if (!customTitle || !customLyrics) { setError('Título e letra são obrigatórios!'); return; }
    setSavingCustomLyric(true); setError('');
>>>>>>> ae3430498bffb3fe64c298d720b8491f5b3961ff
    try {
      const res = await fetch(`${API}/ai-louvor/save-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
<<<<<<< HEAD
        body: JSON.stringify({
          title: customTitle,
          lyrics: customLyrics,
          theme: customTheme || null,
          style: customStyle || null,
          language: detectedLang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || `Erro ${res.status}: Falha ao salvar sua letra.`);
        console.error('Save custom lyric error:', res.status, data);
        return;
      }
      // Resetar formulário e estados
      setCustomTitle('');
      setCustomLyrics('');
      setCustomTheme('');
      setCustomStyle('worship');
      setShowCustomLyricForm(false);
      fetchMySongs(); // Atualizar a lista de músicas para incluir a letra salva
    } catch (err) {
      console.error('Network error (save custom lyric):', err);
      setError(`Erro de conexão ao salvar sua letra: ${err.message || 'Verifique sua internet.'}`);
    } finally {
      setSavingCustomLyric(false);
    }
=======
        body: JSON.stringify({ title: customTitle, lyrics: customLyrics, theme: customTheme, style: customStyle, language: detectedLang }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao salvar.'); return; }
      setCustomTitle(''); setCustomLyrics(''); setCustomTheme(''); setCustomStyle('');
      setShowCustomLyricForm(false); fetchMySongs(); setTab('songs');
      alert('✅ Letra salva!');
    } catch (err) { setError(`Erro: ${err.message}`); }
    finally { setSavingCustomLyric(false); }
>>>>>>> ae3430498bffb3fe64c298d720b8491f5b3961ff
  }

  async function handleDelete(songId) {
    if (!confirm('Excluir esta música?')) return;
    try {
      await fetch(`${API}/ai-louvor/song/${songId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setMySongs(prev => prev.filter(s => s.id !== songId));
    } catch {}
  }

  function handleShare(song) {
    const text = `🎵 ${song.title}\n\n${song.lyrics?.slice(0, 300)}...\n\nhttps://sigo-com-fe.vercel.app/criador-louvor`;
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
        <button onClick={() => navigate('/cadastro')} style={{ padding: '0.8rem 2rem', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #daa520, #f4c542)', color: '#1a0a3e', fontWeight: 700, fontSize: '1rem' }}>Criar conta grátis — 4 músicas grátis!</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a0a3e, #4a1a8e, #9b59b6)', borderRadius: 20, padding: '1.5rem', marginBottom: '1rem', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
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
            <div style={{ fontWeight: 700 }}>🎵 Pacote 250 Músicas — €5</div>
            <button onClick={() => alert('💳 Em breve!')} style={{ marginTop: 8, padding: '0.5rem 1.5rem', borderRadius: 12, border: 'none', background: '#1a0a3e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Comprar agora</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', marginBottom: '1rem', borderRadius: 12, overflow: 'hidden', border: '2px solid #9b59b6' }}>
        {[{ key: 'create', label: '✨ Criar Louvor' }, { key: 'songs', label: `🎵 Minhas Músicas (${mySongs.length})` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: tab === t.key ? '#9b59b6' : '#fff', color: tab === t.key ? '#fff' : '#9b59b6' }}>{t.label}</button>
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
            {THEMES.map(th => (<button key={th.value} onClick={() => setTheme(th.value)} style={{ padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem', background: theme === th.value ? th.color + '25' : '#f5f5f5', color: theme === th.value ? th.color : '#666', fontWeight: theme === th.value ? 700 : 400 }}>{th.label}</button>))}
          </div>

          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>🎵 Estilo Musical</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
            {STYLES.map(s => (<button key={s.value} onClick={() => setStyle(s.value)} style={{ padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem', background: style === s.value ? '#9b59b622' : '#f5f5f5', color: style === s.value ? '#9b59b6' : '#666', fontWeight: style === s.value ? 700 : 400 }}>{s.label}</button>))}
          </div>

          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>💫 Emoção</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
            {EMOTIONS.map(em => (<button key={em.value} onClick={() => setEmotion(em.value)} style={{ padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem', background: emotion === em.value ? '#667eea22' : '#f5f5f5', color: emotion === em.value ? '#667eea' : '#666', fontWeight: emotion === em.value ? 700 : 400 }}>{em.label}</button>))}
          </div>

          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>📖 Livro da Bíblia (opcional)</label>
          <select value={bibleBook} onChange={e => setBibleBook(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd', fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box' }}>
            <option value="">Escolha um livro...</option>
            {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>📜 Versículo (opcional)</label>
          <input value={verse} onChange={e => setVerse(e.target.value)} placeholder='Ex: João 3:16' style={{ width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd', fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box' }} />

          {error && error !== 'no_credits' && <div style={{ background: '#fee', borderRadius: 10, padding: '0.6rem', marginBottom: '0.75rem', color: '#c0392b', fontSize: '0.85rem' }}>❌ {error}</div>}
          {error === 'no_credits' && (
            <div style={{ background: 'linear-gradient(135deg, #fff5e0, #fff0d0)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem', textAlign: 'center', border: '2px solid #daa520' }}>
              <div style={{ fontWeight: 700, color: '#1a0a3e' }}>Seus créditos acabaram!</div>
              <button onClick={() => alert('💳 Em breve!')} style={{ marginTop: 8, padding: '0.5rem 1.5rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #daa520, #f4c542)', color: '#1a0a3e', fontWeight: 700, cursor: 'pointer' }}>Comprar €5 — 250 músicas</button>
            </div>
          )}

<<<<<<< HEAD
          {/* Generate button */}
          <button onClick={handleGenerate} disabled={generating || (credits !== null && credits <= 0)}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: 14, border: 'none',
              background: generating ? '#ccc' : 'linear-gradient(135deg, #9b59b6, #667eea)',
              color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: generating ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: generating ? 'none' : '0 4px 15px rgba(155,89,182,0.3)',
            }}>
            {generating ? (
              <>
                <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Criando louvor... pode demorar até 30s
              </>
            ) : (
              <><Sparkles size={20} /> Gerar Louvor com IA</>
            )}
=======
          <button onClick={handleGenerate} disabled={generating || (credits !== null && credits <= 0)} style={{ width: '100%', padding: '0.85rem', borderRadius: 14, border: 'none', background: generating ? '#ccc' : 'linear-gradient(135deg, #9b59b6, #667eea)', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: generating ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {generating ? (<><div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Criando...</>) : (<><Sparkles size={20} /> Gerar Louvor com IA</>)}
>>>>>>> ae3430498bffb3fe64c298d720b8491f5b3961ff
          </button>

          <button onClick={() => setShowCustomLyricForm(prev => !prev)} style={{ width: '100%', padding: '0.75rem', borderRadius: 14, border: '2px solid #9b59b6', background: showCustomLyricForm ? '#f0e8ff' : '#fff', color: '#9b59b6', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Heart size={18} /> {showCustomLyricForm ? 'Fechar Formulário' : '✍️ Adicionar Minha Letra'}
          </button>

          {showCustomLyricForm && (
            <div style={{ marginTop: '1rem', background: '#f8f0ff', borderRadius: 16, padding: '1rem', border: '2px solid #9b59b6' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#4a1a8e' }}>✍️ Adicionar Minha Letra</h3>
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>🎵 Título</label>
              <input value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder='Ex: "A Graça que me Alcançou"' style={{ width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd', fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box' }} />
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>📝 Letra Completa</label>
              <textarea value={customLyrics} onChange={e => setCustomLyrics(e.target.value)} placeholder='Escreva sua letra aqui...' rows={8} style={{ width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd', fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box', resize: 'vertical' }} />
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>🎯 Tema (opcional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
                {THEMES.map(th => (<button key={th.value} onClick={() => setCustomTheme(th.value)} style={{ padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem', background: customTheme === th.value ? th.color + '25' : '#f5f5f5', color: customTheme === th.value ? th.color : '#666', fontWeight: customTheme === th.value ? 700 : 400 }}>{th.label}</button>))}
              </div>
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>🎵 Estilo (opcional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
                {STYLES.map(s => (<button key={s.value} onClick={() => setCustomStyle(s.value)} style={{ padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem', background: customStyle === s.value ? '#9b59b622' : '#f5f5f5', color: customStyle === s.value ? '#9b59b6' : '#666', fontWeight: customStyle === s.value ? 700 : 400 }}>{s.label}</button>))}
              </div>
              <button onClick={handleSaveCustomLyric} disabled={savingCustomLyric} style={{ width: '100%', padding: '0.85rem', borderRadius: 14, border: 'none', background: savingCustomLyric ? '#ccc' : 'linear-gradient(135deg, #27ae60, #2ecc71)', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: savingCustomLyric ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {savingCustomLyric ? <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Heart size={20} />}
                {savingCustomLyric ? 'Salvando...' : 'Salvar Minha Letra'}
              </button>
            </div>
          )}

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

<<<<<<< HEAD
          {/* Botão Adicionar Minha Letra */}
          <button onClick={() => setShowCustomLyricForm(prev => !prev)}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: 14, border: '1px solid #9b59b6',
              background: showCustomLyricForm ? '#e8f0ff' : '#fff', color: '#9b59b6',
              fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: '0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            <Music size={20} /> {showCustomLyricForm ? 'Esconder Formulário' : 'Adicionar Minha Letra'}
          </button>

          {/* Formulário Adicionar Minha Letra */}
          {showCustomLyricForm && (
            <div style={{
              marginTop: '1rem', background: '#f8f8f8', borderRadius: 16, padding: '1rem',
              border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1a0a3e' }}>✍️ Minha Letra</h3>
              
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>
                🎵 Título da Música
              </label>
              <input value={customTitle} onChange={e => setCustomTitle(e.target.value)}
                placeholder='Ex: "A Graça que me Alcançou"'
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd',
                  fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box',
                }} />

              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>
                📝 Letra Completa
              </label>
              <textarea value={customLyrics} onChange={e => setCustomLyrics(e.target.value)}
                placeholder='Escreva sua letra aqui (Verso, Coro, Ponte, etc.)'
                rows={10}
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd',
                  fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box',
                  resize: 'vertical',
                }} />
              
              {/* Theme (reusing THEMES constant) */}
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>
                🎯 Tema (opcional)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
                {THEMES.map(th => (
                  <button key={`custom-theme-${th.value}`} onClick={() => setCustomTheme(th.value)} style={{
                    padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                    background: customTheme === th.value ? th.color + '25' : '#f5f5f5',
                    color: customTheme === th.value ? th.color : '#666',
                    fontWeight: customTheme === th.value ? 700 : 400,
                    boxShadow: customTheme === th.value ? `0 2px 8px ${th.color}30` : 'none',
                  }}>{th.label}</button>
                ))}
              </div>

              {/* Style (reusing STYLES constant) */}
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>
                🎵 Estilo Musical (opcional)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
                {STYLES.map(s => (
                  <button key={`custom-style-${s.value}`} onClick={() => setCustomStyle(s.value)} style={{
                    padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                    background: customStyle === s.value ? '#9b59b622' : '#f5f5f5',
                    color: customStyle === s.value ? '#9b59b6' : '#666',
                    fontWeight: customStyle === s.value ? 700 : 400, // BUG FIX: customTitle to customStyle
                  }}>{s.label}</button>
                ))}
              </div>

              {/* Botão Salvar Letra */}
              <button onClick={handleSaveCustomLyric} disabled={savingCustomLyric}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: 14, border: 'none',
                  background: savingCustomLyric ? '#ccc' : 'linear-gradient(135deg, #28a745, #218838)',
                  color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: savingCustomLyric ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: savingCustomLyric ? 'none' : '0 4px 15px rgba(40,167,69,0.3)',
                  marginTop: '0.75rem',
                }}>
                {savingCustomLyric ? (
                  <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Heart size={20} />
                )}
                {savingCustomLyric ? 'Salvando...' : 'Salvar Minha Letra'}
              </button>
            </div>
          )}

          {/* Result */}
=======
>>>>>>> ae3430498bffb3fe64c298d720b8491f5b3961ff
          {result && (
            <div style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #f8f0ff, #f0e8ff)', borderRadius: 16, padding: '1rem', border: '2px solid #9b59b6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#4a1a8e' }}>🎵 {result.title}</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleShare(result.song || result)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b59b6' }}><Share2 size={18} /></button>
                  <button onClick={() => handleDownload(result.song || result)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b59b6' }}><Download size={18} /></button>
                </div>
              </div>
<<<<<<< HEAD
              <pre style={{
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit',
                fontSize: '0.88rem', lineHeight: 1.7, color: '#333', margin: 0,
                maxHeight: 500, overflowY: 'auto',
              }}>{result.lyrics}</pre>
              {result && !audioUrl && ( // Mostrar botão Gerar Música apenas se a letra existe e o áudio ainda não foi gerado
                <button onClick={handleGenerateAudio} disabled={generatingAudio}
                  style={{
                    width: '100%', padding: '0.85rem', borderRadius: 14, border: 'none',
                    background: generatingAudio ? '#ccc' : 'linear-gradient(135deg, #2ecc71, #27ae60)',
                    color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: generatingAudio ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: generatingAudio ? 'none' : '0 4px 15px rgba(46,204,113,0.3)',
                    marginTop: '1rem',
                  }}>
                  {generatingAudio ? (
                    <>
                      <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Gerando Música... pode demorar
                    </>
                  ) : (
                    <><Music size={20} /> Gerar Música</>
                  )}
                </button>
              )}

              {audioUrl && ( // Mostrar player de áudio se o URL existe
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <audio controls src={audioUrl} style={{ width: '100%', borderRadius: 10 }} />
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Música gerada pela Suno AI</p>
=======
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: '0.88rem', lineHeight: 1.7, color: '#333', margin: 0, maxHeight: 500, overflowY: 'auto' }}>{result.lyrics}</pre>
              {!audioUrl && (
                <button onClick={() => handleGenerateAudio(null)} disabled={generatingAudio} style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: 14, border: 'none', background: generatingAudio ? '#ccc' : 'linear-gradient(135deg, #27ae60, #2ecc71)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: generatingAudio ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {generatingAudio ? (<><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Gerando música... 1-2 minutos</>) : <>🎵 Gerar Música com IA</>}
                </button>
              )}
              {audioError && <div style={{ background: '#fee', borderRadius: 10, padding: '0.6rem', marginTop: '0.75rem', color: '#c0392b', fontSize: '0.85rem' }}>❌ {audioError}</div>}
              {audioUrl && (
                <div style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #e8f8f0, #d5f5e3)', borderRadius: 14, padding: '1rem', border: '2px solid #27ae60', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#1e8449', marginBottom: '0.5rem' }}>🎵 Música Gerada!</div>
                  <audio controls style={{ width: '100%', marginBottom: '0.5rem' }}>
                    <source src={audioUrl} type="audio/mp3" />
                    <source src={audioUrl} type="audio/wav" />
                  </audio>
                  <a href={audioUrl} download="louvor.mp3" style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: 10, background: '#27ae60', color: '#fff', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>⬇️ Baixar Música</a>
>>>>>>> ae3430498bffb3fe64c298d720b8491f5b3961ff
                </div>
              )}
              <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: '#999' }}>
                Créditos restantes: <strong style={{ color: '#9b59b6' }}>{result.creditsRemaining}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'songs' && (
        <div>
          {mySongs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎵</div>
              <p>Nenhuma música criada ainda.</p>
              <button onClick={() => setTab('create')} style={{ padding: '0.6rem 1.5rem', borderRadius: 12, border: 'none', background: '#9b59b6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Criar primeira música</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mySongs.map(song => (
                <div key={song.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div onClick={() => setExpandedSong(expandedSong === song.id ? null : song.id)} style={{ padding: '0.8rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: song.is_ai === false ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #9b59b6, #667eea)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Music size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a0a3e' }}>{song.title || 'Louvor sem título'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#999' }}>
                        {song.is_ai === false ? <span style={{ marginRight: 8, color: '#27ae60' }}>✍️ Minha letra</span> : <span style={{ marginRight: 8, color: '#9b59b6' }}>🤖 IA</span>}
                        {song.theme && <span style={{ marginRight: 8 }}>🎯 {song.theme}</span>}
                        {new Date(song.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronDown size={18} color="#999" style={{ transform: expandedSong === song.id ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </div>
                  {expandedSong === song.id && (
                    <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #f0f0f0' }}>
<<<<<<< HEAD
                      <pre style={{
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit',
                        fontSize: '0.85rem', lineHeight: 1.6, color: '#333', margin: '0.75rem 0',
                        maxHeight: 400, overflowY: 'auto',
                      }}>{song.lyrics}</pre>
                      {song.audio_url ? (
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                          <audio controls src={song.audio_url} style={{ width: '100%', borderRadius: 10 }} />
                          <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>Música gerada</p>
                        </div>
                      ) : (
                        <button onClick={() => handleGenerateAudio(song)} disabled={generatingAudioForSongId === song.id}
                          style={{
                            width: '100%', padding: '0.5rem', borderRadius: 10, border: 'none',
                            background: generatingAudioForSongId === song.id ? '#ccc' : 'linear-gradient(135deg, #2ecc71, #27ae60)',
                            color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: generatingAudioForSongId === song.id ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            marginTop: '0.75rem',
                          }}>
                          {generatingAudioForSongId === song.id ? (
                            <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Music size={14} />
                          )}
                          {generatingAudioForSongId === song.id ? 'Gerando...' : 'Gerar Música'}
=======
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: 1.6, color: '#333', margin: '0.75rem 0', maxHeight: 400, overflowY: 'auto' }}>{song.lyrics}</pre>
                      {song.audio_url ? (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <audio controls style={{ width: '100%' }}>
                            <source src={song.audio_url} type="audio/mp3" />
                            <source src={song.audio_url} type="audio/wav" />
                          </audio>
                        </div>
                      ) : (
                        <button onClick={() => handleGenerateAudio(song)} disabled={generatingAudioForSongId === song.id} style={{ width: '100%', padding: '0.5rem', borderRadius: 10, border: 'none', background: generatingAudioForSongId === song.id ? '#ccc' : 'linear-gradient(135deg, #27ae60, #2ecc71)', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: generatingAudioForSongId === song.id ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: '0.75rem' }}>
                          {generatingAudioForSongId === song.id ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Music size={14} />}
                          {generatingAudioForSongId === song.id ? 'Gerando...' : '🎵 Gerar Música'}
>>>>>>> ae3430498bffb3fe64c298d720b8491f5b3961ff
                        </button>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleShare(song)} style={{ flex: 1, padding: '0.5rem', borderRadius: 10, border: '1px solid #9b59b6', background: '#fff', color: '#9b59b6', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Share2 size={14} /> Compartilhar</button>
                        <button onClick={() => handleDownload(song)} style={{ flex: 1, padding: '0.5rem', borderRadius: 10, border: '1px solid #667eea', background: '#fff', color: '#667eea', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Download size={14} /> Download</button>
                        <button onClick={() => handleDelete(song.id)} style={{ padding: '0.5rem 0.8rem', borderRadius: 10, border: '1px solid #e74c3c', background: '#fff', color: '#e74c3c', cursor: 'pointer', fontSize: '0.8rem' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #f8f0ff, #f0e8ff)', borderRadius: 14, padding: '0.8rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
        🎵 Total: <strong style={{ color: '#9b59b6' }}>{totalGenerated}</strong>
        {credits !== null && credits > 0 && <span> · Créditos: <strong style={{ color: '#daa520' }}>{credits}</strong></span>}
      </div>
    </div>
  );
}
