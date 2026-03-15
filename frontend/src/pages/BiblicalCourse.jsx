import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Music, Sparkles, BookOpen, Heart, Download, Share2, Trash2, ChevronDown, ArrowLeft } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || '') + '/api`;

const THEME_COLORS = {
  fe: '#daa520',
  esperanca: '#f39c12',
  gratidao: '#27ae60',
  cura: '#2ecc71',
  familia: '#e74c3c',
  amor: '#c0392b',
  adoracao: '#9b59b6',
  vitoria: '#f1c40f',
  paz: '#3498db',
  avivamento: '#e67e22',
  perdao: '#e91e63',
  salvacao: '#8e44ad',
};

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
        else setError(data.error || data.message || `Erro ${res.status}: Tente novamente em alguns segundos.`);
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

  async function handleGenerateAudio() {
    if (!result) return;
    setGeneratingAudio(true);
    setAudioError('');
    setAudioUrl(null);

    try {
      const res = await fetch(`${API}/ai-louvor/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lyrics: result.lyrics,
          songId: result.song?.id,
          title: result.title,
          style: style,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAudioError(data.error || 'Erro ao gerar música. Tente novamente.');
        return;
      }
      setAudioUrl(data.audioUrl);
    } catch (err) {
      setAudioError(`Erro de conexão: ${err.message}`);
    } finally {
      setGeneratingAudio(false);
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
    const text = `🎵 ${song.title}\n\n${song.lyrics?.slice(0, 300)}...\n\n🙏 Criado com IA no Sigo com Fé\nhttps://sigo-com-fe.vercel.app/criador-louvor`;
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
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Crie letras de louvor inspiradas na Bíblia com inteligência artificial!</p>
        <button onClick={() => navigate('/cadastro')} style={{
          padding: '0.8rem 2rem', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #daa520, #f4c542)', color: '#1a0a3e',
          fontWeight: 700, fontSize: '1rem',
        }}>Criar conta grátis — 4 músicas grátis!</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a3e, #4a1a8e, #9b59b6)',
        borderRadius: 20, padding: '1.5rem', marginBottom: '1rem', color: '#fff',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '8rem', opacity: 0.1 }}>🎵</div>
        <h1 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Sparkles size={24} /> Criador de Louvor com IA
        </h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
          Crie letras e músicas de louvor inspiradas na Bíblia
        </p>
        <div style={{
          marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '0.4rem 1rem',
        }}>
          <Music size={16} />
          <span style={{ fontWeight: 700 }}>{credits !== null ? credits : '...'}</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>créditos restantes</span>
        </div>
        {credits !== null && credits <= 0 && (
          <div style={{
            marginTop: '0.75rem', background: 'linear-gradient(135deg, #f4c542, #daa520)',
            borderRadius: 14, padding: '0.6rem 1rem', color: '#1a0a3e',
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>🎵 Pacote 250 Músicas — €5</div>
            <div style={{ fontSize: '0.75rem', marginTop: 2 }}>Apenas €0,02 por música!</div>
            <button onClick={() => alert('💳 Integração de pagamento em breve!')} style={{
              marginTop: 8, padding: '0.5rem 1.5rem', borderRadius: 12, border: 'none',
              background: '#1a0a3e', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
            }}>Comprar agora</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1rem', borderRadius: 12, overflow: 'hidden', border: '2px solid #9b59b6' }}>
        {[
          { key: 'create', label: '✨ Criar Louvor' },
          { key: 'songs', label: `🎵 Minhas Músicas (${mySongs.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            background: tab === t.key ? '#9b59b6' : '#fff',
            color: tab === t.key ? '#fff' : '#9b59b6',
          }}>{t.label}</button>
        ))}
      </div>

      {/* CREATE TAB */}
      {tab === 'create' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '1rem', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f0e8ff, #e8f0ff)', borderRadius: 14,
            padding: '0.8rem 1rem', marginBottom: '1rem', border: '1px solid #d0c0ff',
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#4a1a8e', marginBottom: 6 }}>
              📋 Como criar teu louvor em 4 passos:
            </div>
            <div style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.7 }}>
              <div><strong>1️⃣</strong> Escolha um <strong>tema</strong></div>
              <div><strong>2️⃣</strong> Selecione o <strong>estilo musical</strong> e a <strong>emoção</strong></div>
              <div><strong>3️⃣</strong> Opcional: escolha um <strong>livro da Bíblia</strong> e/ou <strong>versículo</strong></div>
              <div><strong>4️⃣</strong> Toque em <strong>"Gerar Louvor"</strong> e depois em <strong>"🎵 Gerar Música"</strong>!</div>
            </div>
          </div>

          {/* Theme */}
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>🎯 Tema do Louvor</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
            {t('biblicalCourse.themes', { returnObjects: true }).map(th => (
              <button key={th.value} onClick={() => setTheme(th.value)} style={{
                padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                background: theme === th.value ? THEME_COLORS[th.value] + '25' : '#f5f5f5',
                color: theme === th.value ? THEME_COLORS[th.value] : '#666',
                fontWeight: theme === th.value ? 700 : 400,
              }}>{th.label}</button>
            ))}
          </div>

          {/* Style */}
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>🎵 Estilo Musical</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
            {t('biblicalCourse.styles', { returnObjects: true }).map(s => (
              <button key={s.value} onClick={() => setStyle(s.value)} style={{
                padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                background: style === s.value ? '#9b59b622' : '#f5f5f5',
                color: style === s.value ? '#9b59b6' : '#666',
                fontWeight: style === s.value ? 700 : 400,
              }}>{s.label}</button>
            ))}
          </div>

          {/* Emotion */}
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>💫 Emoção</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
            {t('biblicalCourse.emotions', { returnObjects: true }).map(em => (
              <button key={em.value} onClick={() => setEmotion(em.value)} style={{
                padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                background: emotion === em.value ? '#667eea22' : '#f5f5f5',
                color: emotion === em.value ? '#667eea' : '#666',
                fontWeight: emotion === em.value ? 700 : 400,
              }}>{em.label}</button>
            ))}
          </div>

          {/* Bible Book */}
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>📖 Livro da Bíblia (opcional)</label>
          <select value={bibleBook} onChange={e => setBibleBook(e.target.value)} style={{
            width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd',
            fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box',
          }}>
            <option value="">Escolha um livro...</option>
            {t('biblicalCourse.bibleBooks', { returnObjects: true }).map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          {/* Verse */}
          <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>📜 Versículo específico (opcional)</label>
          <input value={verse} onChange={e => setVerse(e.target.value)}
            placeholder='Ex: "Porque Deus tanto amou o mundo..." João 3:16'
            style={{
              width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd',
              fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box',
            }} />

          {/* Error */}
          {error && error !== 'no_credits' && (
            <div style={{ background: '#fee', borderRadius: 10, padding: '0.6rem', marginBottom: '0.75rem', color: '#c0392b', fontSize: '0.85rem' }}>
              ❌ {error}
            </div>
          )}
          {error === 'no_credits' && (
            <div style={{
              background: 'linear-gradient(135deg, #fff5e0, #fff0d0)', borderRadius: 12, padding: '1rem',
              marginBottom: '0.75rem', textAlign: 'center', border: '2px solid #daa520',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🎵</div>
              <div style={{ fontWeight: 700, color: '#1a0a3e', fontSize: '0.95rem' }}>Seus créditos acabaram!</div>
              <div style={{ fontSize: '0.82rem', color: '#666', margin: '4px 0 8px' }}>Adquira o pacote de 250 músicas por apenas €5</div>
              <button onClick={() => alert('💳 Integração de pagamento em breve!')} style={{
                padding: '0.5rem 1.5rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #daa520, #f4c542)', color: '#1a0a3e',
                fontWeight: 700, cursor: 'pointer',
              }}>Comprar €5 — 250 músicas</button>
            </div>
          )}

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
              <><Sparkles size={20} /> Gerar Louvor</>
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Result */}
          {result && (
            <div style={{
              marginTop: '1rem', background: 'linear-gradient(135deg, #f8f0ff, #f0e8ff)',
              borderRadius: 16, padding: '1rem', border: '2px solid #9b59b6',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#4a1a8e' }}>🎵 {result.title}</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleShare(result.song || result)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b59b6' }}><Share2 size={18} /></button>
                  <button onClick={() => handleDownload(result.song || result)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b59b6' }}><Download size={18} /></button>
                </div>
              </div>
              <pre style={{
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit',
                fontSize: '0.88rem', lineHeight: 1.7, color: '#333', margin: 0,
                maxHeight: 500, overflowY: 'auto',
              }}>{result.lyrics}</pre>

              {/* Generate Audio Button */}
              {!audioUrl && (
                <button onClick={handleGenerateAudio} disabled={generatingAudio}
                  style={{
                    width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: 14, border: 'none',
                    background: generatingAudio ? '#ccc' : 'linear-gradient(135deg, #27ae60, #2ecc71)',
                    color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: generatingAudio ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: generatingAudio ? 'none' : '0 4px 15px rgba(39,174,96,0.3)',
                  }}>
                  {generatingAudio ? (
                    <>
                      <div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Gerando música... pode demorar 1-2 minutos
                    </>
                  ) : (
                    <>🎵 Gerar Música com IA</>
                  )}
                </button>
              )}

              {/* Audio Error */}
              {audioError && (
                <div style={{ background: '#fee', borderRadius: 10, padding: '0.6rem', marginTop: '0.75rem', color: '#c0392b', fontSize: '0.85rem' }}>
                  ❌ {audioError}
                </div>
              )}

              {/* Audio Player */}
              {audioUrl && (
                <div style={{
                  marginTop: '1rem', background: 'linear-gradient(135deg, #e8f8f0, #d5f5e3)',
                  borderRadius: 14, padding: '1rem', border: '2px solid #27ae60', textAlign: 'center',
                }}>
                  <div style={{ fontWeight: 700, color: '#1e8449', marginBottom: '0.5rem' }}>🎵 Música Gerada!</div>
                  <audio controls style={{ width: '100%', marginBottom: '0.5rem' }}>
                    <source src={audioUrl} type="audio/wav" />
                    <source src={audioUrl} type="audio/mpeg" />
                    Seu navegador não suporta o player de áudio.
                  </audio>
                  <a href={audioUrl} download="louvor.wav" style={{
                    display: 'inline-block', padding: '0.4rem 1rem', borderRadius: 10,
                    background: '#27ae60', color: '#fff', fontWeight: 600, fontSize: '0.8rem',
                    textDecoration: 'none',
                  }}>⬇️ Baixar Música</a>
                </div>
              )}

              <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: '#999' }}>
                Créditos restantes: <strong style={{ color: '#9b59b6' }}>{result.creditsRemaining}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MY SONGS TAB */}
      {tab === 'songs' && (
        <div>
          {mySongs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎵</div>
              <p>Nenhuma música criada ainda.</p>
              <button onClick={() => setTab('create')} style={{
                padding: '0.6rem 1.5rem', borderRadius: 12, border: 'none',
                background: '#9b59b6', color: '#fff', fontWeight: 600, cursor: 'pointer',
              }}>Criar primeira música</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mySongs.map(song => (
                <div key={song.id} style={{
                  background: '#fff', borderRadius: 14, border: '1px solid #eee',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
                }}>
                  <div onClick={() => setExpandedSong(expandedSong === song.id ? null : song.id)}
                    style={{ padding: '0.8rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'linear-gradient(135deg, #9b59b6, #667eea)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Music size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a0a3e' }}>{song.title || 'Louvor sem título'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#999' }}>
                        {song.theme && <span style={{ marginRight: 8 }}>🎯 {song.theme}</span>}
                        {song.style && <span style={{ marginRight: 8 }}>🎵 {song.style}</span>}
                        {new Date(song.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronDown size={18} color="#999" style={{ transform: expandedSong === song.id ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </div>
                  {expandedSong === song.id && (
                    <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #f0f0f0' }}>
                      <pre style={{
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit',
                        fontSize: '0.85rem', lineHeight: 1.6, color: '#333', margin: '0.75rem 0',
                        maxHeight: 400, overflowY: 'auto',
                      }}>{song.lyrics}</pre>
                      {song.audio_url && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <audio controls style={{ width: '100%' }}>
                            <source src={song.audio_url} type="audio/wav" />
                            <source src={song.audio_url} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleShare(song)} style={{
                          flex: 1, padding: '0.5rem', borderRadius: 10, border: '1px solid #9b59b6',
                          background: '#fff', color: '#9b59b6', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}><Share2 size={14} /> Compartilhar</button>
                        <button onClick={() => handleDownload(song)} style={{
                          flex: 1, padding: '0.5rem', borderRadius: 10, border: '1px solid #667eea',
                          background: '#fff', color: '#667eea', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}><Download size={14} /> Download</button>
                        <button onClick={() => handleDelete(song.id)} style={{
                          padding: '0.5rem 0.8rem', borderRadius: 10, border: '1px solid #e74c3c',
                          background: '#fff', color: '#e74c3c', cursor: 'pointer', fontSize: '0.8rem',
                        }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={{
        marginTop: '1rem', background: 'linear-gradient(135deg, #f8f0ff, #f0e8ff)',
        borderRadius: 14, padding: '0.8rem 1rem', textAlign: 'center',
        fontSize: '0.8rem', color: '#666',
      }}>
        🎵 Total de músicas criadas: <strong style={{ color: '#9b59b6' }}>{totalGenerated}</strong>
        {credits !== null && credits > 0 && (
          <span> · Créditos: <strong style={{ color: '#daa520' }}>{credits}</strong></span>
        )}
      </div>
    </div>
  );
}
