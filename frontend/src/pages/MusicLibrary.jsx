import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Music, Play, Pause, Heart, ChevronRight, Mic2, Baby, BookOpen, Guitar, Upload, Plus, X } from 'lucide-react';

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
    { id: 'hMrJLbPsTjA', title: 'Eu Navegarei — Nívea Soares', artist: 'Nívea Soares' },
    { id: 'rgzRZQ1mOEo', title: 'Quão Grande É o Meu Deus', artist: 'Soraya Moraes' },
    { id: 'HcYTm8QBjHk', title: 'Deus é Deus — Delino Marçal', artist: 'Delino Marçal' },
    { id: 'tKr-mfTfgCQ', title: 'Ninguém Explica Deus', artist: 'Preto no Branco' },
    { id: 'oMKGHOoByMQ', title: 'Raridade — Anderson Freire', artist: 'Anderson Freire' },
    { id: 'DL7YkJFpkHo', title: 'Oceanos (Português)', artist: 'Hillsong' },
    { id: 'KVQnWr4YUZA', title: 'Sou Feliz — Fernandinho', artist: 'Fernandinho' },
    { id: 'OJfRVL3Rs_A', title: 'Lugar Secreto', artist: 'Gabriela Rocha' },
    { id: '3F1kR6PBEsg', title: 'Bondade de Deus', artist: 'Isaías Saad' },
  ],
  hymns: [
    { id: 'kkPGZfJjlyY', title: 'Amazing Grace', artist: 'Hino Clássico' },
    { id: 'H3x6x3GCDsE', title: 'Castelo Forte', artist: 'Martinho Lutero' },
    { id: 'sb3C9kZMqKE', title: 'Grandioso És Tu', artist: 'Hino Clássico' },
    { id: 'gHdB2TKQOZE', title: 'Rude Cruz', artist: 'Hino Clássico' },
    { id: 'ZqBdyAhRCEU', title: 'Quão Bondoso Amigo', artist: 'Hino Clássico' },
  ],
  instrumental: [
    { id: 'fnCGsPaGbzM', title: '3 Horas de Piano Instrumental', artist: 'Worship Piano' },
    { id: 'JjPF0h6t458', title: 'Música para Oração — Piano', artist: 'Instrumental' },
    { id: 'XQu8TTBmGhA', title: 'Louvor Instrumental Relaxante', artist: 'Instrumental' },
  ],
  kids: [
    { id: '9sX6P7kPJvQ', title: 'Deus é Bom pra Mim', artist: 'Kids' },
    { id: 'FNNl-EE_czk', title: '3 Palavrinhas', artist: 'DT Kids' },
    { id: 'zD81qe5MNMY', title: 'Meu Barquinho', artist: 'Aline Barros Kids' },
  ],
  prayer: [
    { id: 'Dp3jda7JKZY', title: 'Fundo Musical para Oração — 1h', artist: 'Prayer Music' },
    { id: 'PBz_JkwM880', title: 'Música Calma para Orar', artist: 'Prayer Music' },
    { id: 'B1pHcaMRBk0', title: 'Atmosfera de Adoração', artist: 'Worship' },
  ],
};

export default function MusicLibrary() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [activeCategory, setActiveCategory] = useState('worship');
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
  const [uploadedSongs, setUploadedSongs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('uploaded_songs') || '[]'); } catch { return []; }
  });
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRef = useRef(null);

  const categoryLabels = {
    worship: t('music.worship', 'Louvor & Adoração'),
    hymns: t('music.hymns', 'Hinos Clássicos'),
    instrumental: t('music.instrumental', 'Instrumental'),
    kids: t('music.kids', 'Kids Gospel'),
    prayer: t('music.prayer', 'Música para Oração'),
    uploaded: 'Minhas Músicas',
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
      audio.onended = () => setPlayingAudio(null);
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
      fd.append('resource_type', 'auto');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) {
        const newSong = { url: data.secure_url, title: uploadTitle.trim(), artist: uploadArtist.trim() || user?.full_name || 'Desconhecido', id: Date.now().toString() };
        const updated = [...uploadedSongs, newSong];
        setUploadedSongs(updated);
        localStorage.setItem('uploaded_songs', JSON.stringify(updated));
        setUploadFile(null);
        setUploadTitle('');
        setUploadArtist('');
        setShowUpload(false);
      }
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  }

  const allYoutube = Object.values(PLAYLISTS).flat();
  const displaySongs = showFavs
    ? allYoutube.filter(s => favorites.includes(s.id))
    : activeCategory === 'uploaded' ? [] : (PLAYLISTS[activeCategory] || []);

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
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                {t('music.title', 'Música Gospel')}
              </h1>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                Ouça e suba suas músicas 🎵
              </p>
            </div>
          </div>
        </div>
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
            {showUpload ? 'Fechar' : '🎵 Subir Música (MP3)'}
          </button>
        </div>
      )}

      {/* Upload form */}
      {showUpload && (
        <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '1rem', border: '1px solid rgba(102,126,234,0.2)' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              <div style={{
                padding: '1.5rem', borderRadius: 12, border: '2px dashed rgba(255,255,255,0.15)',
                background: uploadFile ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.03)',
                textAlign: 'center', cursor: 'pointer',
              }}>
                {uploadFile ? (
                  <p style={{ margin: 0, color: '#4caf50', fontWeight: 600, fontSize: '0.85rem' }}>✅ {uploadFile.name}</p>
                ) : (
                  <>
                    <Music size={32} color="#667eea" style={{ marginBottom: 6 }} />
                    <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>Toque para escolher MP3</p>
                  </>
                )}
              </div>
              <input type="file" accept="audio/*" onChange={e => setUploadFile(e.target.files?.[0])} style={{ display: 'none' }} />
            </label>
            <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Nome da música *" style={{
              width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.85rem', marginBottom: '0.5rem', outline: 'none', boxSizing: 'border-box',
            }} />
            <input value={uploadArtist} onChange={e => setUploadArtist(e.target.value)} placeholder="Artista (opcional)" style={{
              width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.85rem', marginBottom: '0.75rem', outline: 'none', boxSizing: 'border-box',
            }} />
            <button onClick={handleUpload} disabled={!uploadFile || !uploadTitle.trim() || uploading} style={{
              width: '100%', padding: '0.7rem', borderRadius: 12, border: 'none',
              background: uploadFile && uploadTitle.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            }}>
              {uploading ? '⏳ Subindo...' : '🚀 Subir Música'}
            </button>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 1rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', marginBottom: '1rem' }}>
        <button onClick={() => { setShowFavs(!showFavs); }} style={{
          flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: showFavs ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'rgba(255,255,255,0.08)',
          color: showFavs ? '#fff' : '#aaa', fontWeight: 600, fontSize: '0.8rem',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Heart size={14} fill={showFavs ? '#fff' : 'none'} /> Favoritos
        </button>

        {uploadedSongs.length > 0 && (
          <button onClick={() => { setActiveCategory('uploaded'); setShowFavs(false); }} style={{
            flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: !showFavs && activeCategory === 'uploaded' ? 'linear-gradient(135deg, #4caf50, #66bb6a)' : 'rgba(255,255,255,0.08)',
            color: !showFavs && activeCategory === 'uploaded' ? '#fff' : '#aaa', fontWeight: 600, fontSize: '0.8rem',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <Upload size={14} /> Minhas ({uploadedSongs.length})
          </button>
        )}

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

      {/* Uploaded songs */}
      {activeCategory === 'uploaded' && !showFavs && (
        <div style={{ padding: '0 1rem' }}>
          {uploadedSongs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <Upload size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>Nenhuma música subida ainda</p>
            </div>
          ) : uploadedSongs.map(song => (
            <div key={song.id} onClick={() => playUploadedSong(song)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
              background: playingAudio === song.url ? 'rgba(102,126,234,0.1)' : 'transparent', borderRadius: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {playingAudio === song.url ? <Pause size={20} color="#fff" /> : <Play size={20} color="#fff" fill="#fff" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: playingAudio === song.url ? '#667eea' : '#fff', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {song.title}
                </div>
                <div style={{ color: '#888', fontSize: '0.78rem' }}>{song.artist}</div>
              </div>
            </div>
          ))}
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
                <img src={`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={20} color="#fff" fill="#fff" />
                </div>
              </div>
              <div onClick={() => playYoutube(song)} style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: playingId === song.id ? '#667eea' : '#fff', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {song.title}
                </div>
                <div style={{ color: '#888', fontSize: '0.78rem', marginTop: 2 }}>{song.artist}</div>
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
