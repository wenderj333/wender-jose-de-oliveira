import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Music, Play, Pause, Heart, Mic2, Baby, BookOpen, Guitar, Upload, X, User } from 'lucide-react';

const CLOUD_NAME = 'degxiuf43';
const UPLOAD_PRESET = 'sigo_com_fe';
const API = (import.meta.env.VITE_API_URL || '') + '/api';

const CATEGORIES = [
  { id: 'worship', icon: <Mic2 size={18} />, gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'hymns', icon: <BookOpen size={18} />, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'instrumental', icon: <Guitar size={18} />, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 'kids', icon: <Baby size={18} />, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { id: 'prayer', icon: <Heart size={18} />, gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
];

const PLAYLISTS = {
  worship: [
    { id: 'hMrJLbPsTjA', title: 'Eu Navegarei', artist: 'Nivea Soares' },
    { id: 'rgzRZQ1mOEo', title: 'Quao Grande E o Meu Deus', artist: 'Soraya Moraes' },
    { id: 'HcYTm8QBjHk', title: 'Deus e Deus', artist: 'Delino Marcal' },
    { id: 'tKr-mfTfgCQ', title: 'Ninguem Explica Deus', artist: 'Preto no Branco' },
    { id: 'oMKGHOoByMQ', title: 'Raridade', artist: 'Anderson Freire' },
    { id: 'DL7YkJFpkHo', title: 'Oceanos (Portugues)', artist: 'Hillsong' },
    { id: 'KVQnWr4YUZA', title: 'Sou Feliz', artist: 'Fernandinho' },
    { id: 'OJfRVL3Rs_A', title: 'Lugar Secreto', artist: 'Gabriela Rocha' },
    { id: '3F1kR6PBEsg', title: 'Bondade de Deus', artist: 'Isaias Saad' },
  ],
  hymns: [
    { id: 'kkPGZfJjlyY', title: 'Amazing Grace', artist: 'Hino Classico' },
    { id: 'H3x6x3GCDsE', title: 'Castelo Forte', artist: 'Martinho Lutero' },
    { id: 'sb3C9kZMqKE', title: 'Grandioso Es Tu', artist: 'Hino Classico' },
    { id: 'gHdB2TKQOZE', title: 'Rude Cruz', artist: 'Hino Classico' },
    { id: 'ZqBdyAhRCEU', title: 'Quao Bondoso Amigo', artist: 'Hino Classico' },
  ],
  instrumental: [
    { id: 'fnCGsPaGbzM', title: '3 Horas de Piano Instrumental', artist: 'Worship Piano' },
    { id: 'JjPF0h6t458', title: 'Musica para Oracao - Piano', artist: 'Instrumental' },
    { id: 'XQu8TTBmGhA', title: 'Louvor Instrumental Relaxante', artist: 'Instrumental' },
  ],
  kids: [
    { id: '9sX6P7kPJvQ', title: 'Deus e Bom pra Mim', artist: 'Kids' },
    { id: 'FNNl-EE_czk', title: '3 Palavrinhas', artist: 'DT Kids' },
    { id: 'zD81qe5MNMY', title: 'Meu Barquinho', artist: 'Aline Barros Kids' },
  ],
  prayer: [
    { id: 'Dp3jda7JKZY', title: 'Fundo Musical para Oracao - 1h', artist: 'Prayer Music' },
    { id: 'PBz_JkwM880', title: 'Musica Calma para Orar', artist: 'Prayer Music' },
    { id: 'B1pHcaMRBk0', title: 'Atmosfera de Adoracao', artist: 'Worship' },
  ],
};

export default function MusicLibrary() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [activeCategory, setActiveCategory] = useState('uploaded');
  const [playingId, setPlayingId] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('music_favs') || '[]'); } catch { return []; }
  });
  const [showFavs, setShowFavs] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadArtist, setUploadArtist] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedSongs, setUploadedSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [autoplay, setAutoplay] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => { fetchUploadedSongs(); }, []);

  async function fetchUploadedSongs() {
    setLoadingSongs(true);
    try {
      const res = await fetch(`${API}/music`);
      const data = await res.json();
      const songs = data.songs;
      setUploadedSongs(Array.isArray(songs) ? songs : songs?.rows || Object.values(songs || {}) || []);
    } catch {}
    finally { setLoadingSongs(false); }
  }

  const categoryLabels = {
    worship: t('music.worship', 'Louvor e Adoracao'),
    hymns: t('music.hymns', 'Hinos Classicos'),
    instrumental: t('music.instrumental', 'Instrumental'),
    kids: t('music.kids', 'Kids Gospel'),
    prayer: t('music.prayer', 'Musica para Oracao'),
    uploaded: 'Comunidade',
  };

  function toggleFav(videoId) {
    const next = favorites.includes(videoId) ? favorites.filter(f => f !== videoId) : [...favorites, videoId];
    setFavorites(next);
    localStorage.setItem('music_favs', JSON.stringify(next));
  }

  function playYoutube(song) {
    if (audioRef.current) { audioRef.current.pause(); setPlayingAudio(null); }
    setPlayingId(playingId === song.id ? null : song.id);
  }

  function playUploadedSong(song) {
    setPlayingId(null);
    if (playingAudio === song.url) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(song.url);
      audio.play();
      audioRef.current = audio;
      setPlayingAudio(song.url);
      audio.onended = () => {
        if (autoplay) {
          // Find next song in uploadedSongs
          const idx = uploadedSongs.findIndex(s => s.url === song.url);
          if (idx >= 0 && idx < uploadedSongs.length - 1) {
            playUploadedSong(uploadedSongs[idx + 1]);
          } else {
            setPlayingAudio(null);
          }
        } else {
          setPlayingAudio(null);
        }
      };
    }
  }

  async function handleUpload() {
    if (!uploadFile || !uploadTitle.trim()) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('upload_preset', UPLOAD_PRESET);
      fd.append('folder', 'sigo-com-fe/music');
      fd.append('resource_type', 'video');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.secure_url) {
        alert('Erro ao subir arquivo. Tente novamente.');
        setUploading(false);
        return;
      }
      const saveRes = await fetch(`${API}/music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: uploadTitle.trim(), artist: uploadArtist.trim() || '', url: data.secure_url }),
      });
      const saveData = await saveRes.json();
      if (saveData.song) {
        setUploadedSongs(prev => [saveData.song, ...prev]);
        setUploadFile(null);
        setUploadTitle('');
        setUploadArtist('');
        setShowUpload(false);
        alert('Musica subida com sucesso!');
      } else {
        alert('Erro ao salvar musica no banco.');
      }
    } catch (err) { console.error(err); alert('Erro: ' + err.message); }
    finally { setUploading(false); }
  }

  const allYoutube = Object.values(PLAYLISTS).flat();
  const displaySongs = showFavs
    ? allYoutube.filter(s => favorites.includes(s.id))
    : activeCategory === 'uploaded' ? uploadedSongs : (PLAYLISTS[activeCategory] || []);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 2rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        padding: '2rem 1.25rem 1.5rem', borderRadius: '0 0 28px 28px',
        position: 'relative', overflow: 'hidden', marginBottom: '1rem',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music size={26} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Música Gospel</h1>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>Ouça e suba suas músicas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem explicativa */}
      <div style={{
        margin: '0 1rem 1rem', padding: '1.2rem', borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.97), rgba(245,240,255,0.95))',
        border: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, #667eea, #764ba2, #daa520) 1',
        boxShadow: '0 4px 12px rgba(102,126,234,0.1)',
      }}>
        <h3 style={{ fontSize: '1rem', color: '#4a1a8e', margin: '0 0 0.5rem', textAlign: 'center' }}>
          🎵 Projeto Música Gospel da Comunidade
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
          Aqui você encontra músicas gospel para adorar a Deus a qualquer momento! Na aba <strong>Comunidade</strong>, 
          ouça músicas enviadas por irmãos de todo o mundo — organizadas por quem enviou. 
          Você também pode subir suas próprias músicas em MP3 para abençoar outros. 
          Nas outras abas, ouça playlists de adoração, hinos clássicos, instrumentais e muito mais! 🙌
        </p>
        <p style={{ fontSize: '0.82rem', color: '#6a1b9a', fontStyle: 'italic', margin: 0, textAlign: 'center', fontWeight: 500 }}>
          "Cantai ao Senhor um cântico novo; cantai ao Senhor, todas as terras." — Salmos 96:1
        </p>
      </div>

      {/* Upload button */}
      {token && (
        <div style={{ padding: '0 1rem', marginBottom: '0.75rem' }}>
          <button onClick={() => setShowUpload(!showUpload)} style={{
            width: '100%', padding: '0.7rem', borderRadius: 14, border: '2px dashed rgba(102,126,234,0.4)',
            background: showUpload ? 'rgba(102,126,234,0.15)' : 'rgba(255,255,255,0.04)',
            color: '#667eea', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {showUpload ? <X size={18} /> : <Upload size={18} />}
            {showUpload ? 'Fechar' : 'Subir Musica (MP3)'}
          </button>
        </div>
      )}

      {/* Upload form - step by step */}
      {showUpload && (
        <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.2rem', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

            {/* Step 1 */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: uploadFile ? '#4caf50' : '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>1</span>
                <span style={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>{t('music.step1', 'Escolha o arquivo de musica')}</span>
              </div>
              <input id="mp3-input" type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac" onChange={e => setUploadFile(e.target.files?.[0])}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              <div onClick={() => document.getElementById('mp3-input')?.click()} style={{
                padding: '1.2rem', borderRadius: 12, border: '2px dashed #ccc',
                background: uploadFile ? '#e8f5e9' : '#f9f9f9',
                textAlign: 'center', cursor: 'pointer',
              }}>
                {uploadFile ? (
                  <p style={{ margin: 0, color: '#2e7d32', fontWeight: 600, fontSize: '0.9rem' }}>
                    {uploadFile.name}
                  </p>
                ) : (
                  <>
                    <Music size={36} color="#667eea" style={{ marginBottom: 6 }} />
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{t('music.tapToChoose', 'Toque aqui para escolher MP3')}</p>
                  </>
                )}
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.4rem' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: uploadTitle.trim() ? '#4caf50' : '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>2</span>
                <span style={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>{t('music.step2', 'Nome da musica')}</span>
              </div>
              <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder={t('music.titlePlaceholder', 'Ex: Grande e o Senhor')} style={{
                width: '100%', padding: '0.7rem 0.85rem', borderRadius: 10, border: '1px solid #ccc',
                background: '#fff', color: '#333', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
              }} />
            </div>

            {/* Step 3 */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.4rem' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>3</span>
                <span style={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>{t('music.step3', 'Artista (opcional)')}</span>
              </div>
              <input value={uploadArtist} onChange={e => setUploadArtist(e.target.value)} placeholder={t('music.artistPlaceholder', 'Ex: Aline Barros')} style={{
                width: '100%', padding: '0.7rem 0.85rem', borderRadius: 10, border: '1px solid #ccc',
                background: '#fff', color: '#333', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
              }} />
            </div>

            {/* Step 4 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: (uploadFile && uploadTitle.trim()) ? '#4caf50' : '#999', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>4</span>
                <span style={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>{t('music.step4', 'Publicar para a comunidade!')}</span>
              </div>
              <button onClick={handleUpload} disabled={!uploadFile || !uploadTitle.trim() || uploading} style={{
                width: '100%', padding: '0.8rem', borderRadius: 12, border: 'none',
                background: uploadFile && uploadTitle.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e0e0e0',
                color: uploadFile && uploadTitle.trim() ? '#fff' : '#999', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              }}>
                {uploading ? 'Subindo...' : t('music.uploadBtn', 'Subir Musica')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 1rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', marginBottom: '1rem' }}>
        <button onClick={() => { setActiveCategory('uploaded'); setShowFavs(false); fetchUploadedSongs(); }} style={{
          flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: !showFavs && activeCategory === 'uploaded' ? 'linear-gradient(135deg, #4caf50, #66bb6a)' : 'rgba(255,255,255,0.08)',
          color: !showFavs && activeCategory === 'uploaded' ? '#fff' : '#aaa', fontWeight: 600, fontSize: '0.8rem',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Upload size={14} /> Comunidade ({uploadedSongs.length})
        </button>

        <button onClick={() => setShowFavs(!showFavs)} style={{
          flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: showFavs ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'rgba(255,255,255,0.08)',
          color: showFavs ? '#fff' : '#aaa', fontWeight: 600, fontSize: '0.8rem',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Heart size={14} fill={showFavs ? '#fff' : 'none'} /> Favoritos
        </button>

        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setShowFavs(false); }} style={{
            flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: !showFavs && activeCategory === cat.id ? cat.gradient : 'rgba(255,255,255,0.08)',
            color: !showFavs && activeCategory === cat.id ? '#fff' : '#aaa',
            fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {cat.icon} {categoryLabels[cat.id]}
          </button>
        ))}
      </div>

      {/* Uploaded songs from community — grouped by user */}
      {activeCategory === 'uploaded' && !showFavs && (
        <div style={{ padding: '0 1rem' }}>
          {/* Autoplay toggle */}
          {uploadedSongs.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#888' }}>Tocar seguinte</span>
              <button onClick={() => setAutoplay(!autoplay)} style={{
                width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                background: autoplay ? '#4caf50' : '#555', position: 'relative', transition: 'background 0.3s',
              }}>
                <span style={{
                  position: 'absolute', top: 2, left: autoplay ? 20 : 2,
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>
          )}
          {loadingSongs ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Carregando...</div>
          ) : uploadedSongs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <Upload size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>Nenhuma musica subida ainda. Seja o primeiro!</p>
            </div>
          ) : (() => {
            // Group songs by user_name
            const grouped = {};
            uploadedSongs.forEach(song => {
              const name = song.user_name || 'Anônimo';
              if (!grouped[name]) grouped[name] = [];
              grouped[name].push(song);
            });
            return Object.entries(grouped).map(([userName, songs]) => (
              <div key={userName} style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#667eea', padding: '0.4rem 0', borderBottom: '1px solid rgba(102,126,234,0.2)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} /> {userName} ({songs.length})
                </div>
                {songs.map(song => (
                  <div key={song.id} onClick={() => playUploadedSong(song)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '0.6rem 0.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                    background: playingAudio === song.url ? 'rgba(102,126,234,0.1)' : 'transparent', borderRadius: 12,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {playingAudio === song.url ? <Pause size={18} color="#fff" /> : <Play size={18} color="#fff" fill="#fff" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: playingAudio === song.url ? '#667eea' : '#1a0a3e', fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {song.title}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.75rem' }}>{song.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            ));
          })()}
        </div>
      )}

      {/* YouTube playing */}
      {playingId && (
        <div style={{ margin: '0 1rem 1rem', borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9' }}>
          <iframe
            width="100%" height="100%"
            src={`https://www.youtube.com/embed/${playingId}?autoplay=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>
      )}

      {/* YouTube song list */}
      {activeCategory !== 'uploaded' && (
        <div style={{ padding: '0 1rem' }}>
          {showFavs && displaySongs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <Heart size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>Nenhum favorito ainda</p>
            </div>
          ) : displaySongs.map(song => (
            <div key={song.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, cursor: 'pointer',
              background: playingId === song.id ? 'rgba(102,126,234,0.1)' : 'transparent',
            }}>
              <div onClick={() => playYoutube(song)} style={{
                width: 52, height: 52, borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#1a1a2e',
              }}>
                <img src={`https://img.youtube.com/vi/${song.id}/hqdefault.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={20} color="#fff" fill="#fff" />
                </div>
              </div>
              <div onClick={() => playYoutube(song)} style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: playingId === song.id ? '#667eea' : '#1a0a3e', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {song.title}
                </div>
                <div style={{ color: '#666', fontSize: '0.78rem', marginTop: 2 }}>{song.artist}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); toggleFav(song.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, flexShrink: 0 }}>
                <Heart size={18} color={favorites.includes(song.id) ? '#ef4444' : '#555'} fill={favorites.includes(song.id) ? '#ef4444' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
