import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Music, Play, Pause, Heart, Mic2, Baby, BookOpen, Guitar,
  Upload, X, ChevronLeft, ChevronRight, Volume2, Search,
  LayoutGrid, List, Image,
} from 'lucide-react';

const CLOUD_NAME = 'degxiuf43';
const UPLOAD_PRESET = 'sigo_com_fe';
const API = (import.meta.env.VITE_API_URL || '') + '/api';

const GENRE_KEYS = ['louvor', 'adoracao', 'hinos', 'instrumental', 'kids', 'oracao'];

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

const ALL_YOUTUBE = Object.values(PLAYLISTS).flat();

// ─── Mini Audio Player (fixed bottom bar) ───────────────────────────────────
function MiniPlayer({ songs, currentIdx, setCurrentIdx, audioRef, playing, setPlaying }) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const song = songs[currentIdx];

  useEffect(() => {
    if (!audioRef.current || !song) return;
    audioRef.current.src = song.url;
    audioRef.current.volume = volume;
    if (playing) audioRef.current.play().catch(() => {});
  }, [currentIdx]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnded = () => {
      if (currentIdx < songs.length - 1) setCurrentIdx(currentIdx + 1);
      else setPlaying(false);
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('ended', onEnded); };
  }, [currentIdx, songs, setCurrentIdx, setPlaying]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setPlaying(true); }
  };

  const seek = (e) => {
    if (!audioRef.current?.duration) return;
    audioRef.current.currentTime = (e.target.value / 100) * audioRef.current.duration;
  };

  const changeVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  if (!song) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--card, #fff)',
      borderTop: '2px solid var(--fb, #4a80d4)',
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      zIndex: 1000,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
    }}>
      <div style={{ fontSize: 28 }}>🎵</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text, #1a1a2e)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
        <div style={{ fontSize: 11, color: '#888' }}>{song.artist}</div>
        <input type="range" min={0} max={100} value={progress} onChange={seek}
          style={{ width: '100%', accentColor: 'var(--fb, #4a80d4)', height: 3, marginTop: 4 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} style={iconBtn}>
          <ChevronLeft size={18} />
        </button>
        <button onClick={toggle} style={{ ...iconBtn, background: 'var(--fb, #4a80d4)', color: '#fff', width: 36, height: 36, borderRadius: '50%' }}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button onClick={() => setCurrentIdx(Math.min(songs.length - 1, currentIdx + 1))} style={iconBtn}>
          <ChevronRight size={18} />
        </button>
        <Volume2 size={14} color="#888" />
        <input type="range" min={0} max={1} step={0.05} value={volume} onChange={changeVolume}
          style={{ width: 60, accentColor: 'var(--fb, #4a80d4)' }} />
      </div>
    </div>
  );
}

const iconBtn = {
  background: 'none', border: '1px solid var(--border, #e2e8f0)',
  borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', color: 'var(--text, #333)',
};

// ─── Upload Modal ────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUploaded, token }) {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('louvor');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const coverRef = useRef();

  const handleCoverChange = (f) => {
    if (!f || !f.type.startsWith('image')) return;
    setCoverFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('audio')) setFile(f);
  };

  const handleSubmit = async () => {
    if (!file || !title.trim()) return;
    setUploading(true); setProgress(10);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      fd.append('folder', 'sigo-com-fe/music');
      fd.append('resource_type', 'video');
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, { method: 'POST', body: fd });
      setProgress(70);
      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url) throw new Error(t('music.uploadError'));

      // Upload cover if provided
      let coverUrl = null;
      if (coverFile) {
        const coverFd = new FormData();
        coverFd.append('file', coverFile);
        coverFd.append('upload_preset', UPLOAD_PRESET);
        coverFd.append('folder', 'sigo-com-fe/music-covers');
        const coverRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: coverFd });
        const coverData = await coverRes.json();
        coverUrl = coverData.secure_url || null;
      }
      setProgress(80);

      const saveRes = await fetch(`${API}/music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim() || undefined,
          genre,
          url: cloudData.secure_url,
          cover_url: coverUrl,
          duration: cloudData.duration ? Math.round(cloudData.duration) : undefined,
        }),
      });
      setProgress(90);
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || t('music.uploadError'));
      setProgress(100);
      onUploaded(saveData.song);
      onClose();
    } catch (err) {
      console.error(err);
      alert(t('music.uploadError'));
    } finally { setUploading(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--card, #fff)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: 'var(--text, #1a1a2e)', fontWeight: 700 }}>{t('music.upload')}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
        </div>

        {/* Drag & drop area */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--fb, #4a80d4)' : 'var(--border, #e2e8f0)'}`,
            borderRadius: 12, padding: '28px 16px', textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'rgba(74,128,212,0.06)' : 'var(--bg, #f8f9fa)',
            marginBottom: 16, transition: 'all 0.2s',
          }}>
          <input ref={fileRef} type="file" accept=".mp3,.wav,.ogg,.m4a,audio/*" style={{ display: 'none' }}
            onChange={e => setFile(e.target.files?.[0] || null)} />
          {file ? (
            <p style={{ margin: 0, fontWeight: 600, color: '#2e7d32' }}>🎵 {file.name}</p>
          ) : (
            <>
              <Upload size={32} color="var(--fb, #4a80d4)" style={{ marginBottom: 8 }} />
              <p style={{ margin: 0, color: '#666', fontSize: 14 }}>Drag & drop ou clique • MP3/WAV/OGG/M4A</p>
            </>
          )}
        </div>

        {/* Fields */}
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder={t('music.uploadTitle')}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border, #e2e8f0)', marginBottom: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--bg, #fff)', color: 'var(--text, #333)' }} />
        <input value={artist} onChange={e => setArtist(e.target.value)}
          placeholder={t('music.uploadArtist')}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border, #e2e8f0)', marginBottom: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--bg, #fff)', color: 'var(--text, #333)' }} />

        {/* Cover image upload */}
        <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => handleCoverChange(e.target.files?.[0])} />
        <div onClick={() => coverRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: '1px dashed var(--border, #e2e8f0)', marginBottom: 10, cursor: 'pointer', background: 'var(--bg, #f8f9fa)' }}>
          {coverPreview ? (
            <img src={coverPreview} alt="cover" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: 8, background: 'linear-gradient(135deg,#4a80d4,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Image size={20} color="white" />
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text, #333)' }}>{t('music.uploadCover') || 'Capa da música'}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#888' }}>{coverFile ? coverFile.name : t('music.uploadCoverHint') || 'Clica para adicionar uma imagem de capa'}</p>
          </div>
        </div>

        <select value={genre} onChange={e => setGenre(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border, #e2e8f0)', marginBottom: 16, fontSize: 14, outline: 'none', background: 'var(--bg, #fff)', color: 'var(--text, #333)' }}>
          {GENRE_KEYS.map(g => (
            <option key={g} value={g}>{t(`music.genre.${g}`)}</option>
          ))}
        </select>

        {uploading && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 6, background: 'var(--border, #e2e8f0)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--fb, #4a80d4)', transition: 'width 0.3s' }} />
            </div>
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{t('music.uploading')}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={uploading || !file || !title.trim()} style={{
          width: '100%', padding: 12, borderRadius: 12, border: 'none',
          background: (file && title.trim() && !uploading) ? 'var(--fb, #4a80d4)' : '#ccc',
          color: '#fff', fontWeight: 700, fontSize: 15, cursor: (file && title.trim() && !uploading) ? 'pointer' : 'not-allowed',
        }}>
          {uploading ? t('music.uploading') : t('music.upload')}
        </button>
      </div>
    </div>
  );
}

// ─── Song Card ───────────────────────────────────────────────────────────────
function SongCard({ song, isPlaying, onPlay, onLike, token, user, t }) {
  const [likeCount, setLikeCount] = useState(song.like_count || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) { alert(t('music.loginToLike')); return; }
    try {
      const res = await fetch(`${API}/music/${song.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLikeCount(data.like_count);
      setLiked(data.liked);
    } catch (err) { console.error(err); }
  };

  return (
    <div onClick={() => onPlay(song)} style={{
      background: 'var(--card, #fff)',
      border: isPlaying ? '2px solid var(--fb, #4a80d4)' : '1px solid var(--border, #e2e8f0)',
      borderRadius: 16,
      padding: 14,
      cursor: 'pointer',
      boxShadow: isPlaying ? '0 0 0 4px rgba(74,128,212,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
      animation: isPlaying ? 'pulse-border 2s infinite' : 'none',
      transition: 'all 0.2s',
    }}>
      {/* Cover */}
      <div style={{
        width: '100%', aspectRatio: '1/1', borderRadius: 12,
        background: song.cover_url ? undefined : 'linear-gradient(135deg, var(--fb, #4a80d4), #764ba2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 10, overflow: 'hidden', fontSize: 40,
      }}>
        {song.cover_url ? (
          <img src={song.cover_url} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : '🎵'}
      </div>

      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text, #1a1a2e)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
        {song.title}
      </div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{song.artist || song.user_name}</div>

      {/* Genre badge — safe fallback if genre is undefined */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: 'rgba(74,128,212,0.12)', color: 'var(--fb, #4a80d4)', border: '1px solid rgba(74,128,212,0.2)' }}>
          {song.genre ? t(`music.genre.${song.genre}`, song.genre) : t('music.genre.louvor')}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#e11d48' : '#888', fontSize: 12, padding: 0 }}>
          <Heart size={14} fill={liked ? '#e11d48' : 'none'} color={liked ? '#e11d48' : '#888'} />
          {likeCount} {t('music.likes')}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onPlay(song); }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--fb, #4a80d4)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 600 }}>
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          {isPlaying ? t('music.pause') : t('music.play')}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function MusicLibrary() {
  const { t } = useTranslation();
  const { user, token } = useAuth();

  // Community songs
  const [songs, setSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [activeGenre, setActiveGenre] = useState('all');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Audio player
  const audioRef = useRef(new Audio());
  const [currentIdx, setCurrentIdx] = useState(null);
  const [playing, setPlaying] = useState(false);

  // YouTube — open in new tab (no embed, no blocked videos)
  const openYoutube = (videoId) => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = useCallback(async () => {
    setLoadingSongs(true);
    try {
      const res = await fetch(`${API}/music`);
      const data = await res.json();
      setSongs(Array.isArray(data.songs) ? data.songs : []);
    } catch (err) { console.error(err); }
    finally { setLoadingSongs(false); }
  }, []);

  // Filtered songs
  const filteredSongs = songs.filter(s => {
    const matchGenre = activeGenre === 'all' || s.genre === activeGenre;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.artist || '').toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  const handlePlay = (song) => {
    // Stop YouTube if playing
    setYtPlaying(null);
    const idx = filteredSongs.findIndex(s => s.id === song.id);
    if (idx === currentIdx) {
      if (playing) { audioRef.current.pause(); setPlaying(false); }
      else { audioRef.current.play().catch(() => {}); setPlaying(true); }
    } else {
      audioRef.current.pause();
      audioRef.current.src = song.url;
      audioRef.current.play().catch(() => {});
      setCurrentIdx(idx);
      setPlaying(true);
    }
  };

  const handleUploaded = (newSong) => {
    setSongs(prev => [newSong, ...prev]);
  };

  // Auto-advance
  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => {
      if (currentIdx !== null && currentIdx < filteredSongs.length - 1) {
        const next = currentIdx + 1;
        setCurrentIdx(next);
        audio.src = filteredSongs[next].url;
        audio.play().catch(() => {});
      } else {
        setPlaying(false);
      }
    };
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [currentIdx, filteredSongs]);

  const genre_chips = [
    { key: 'all', label: t('music.allGenres') },
    ...GENRE_KEYS.map(g => ({ key: g, label: t(`music.genre.${g}`) })),
  ];

  const playerSongs = filteredSongs;
  const playerSong = currentIdx !== null ? playerSongs[currentIdx] : null;

  return (
    <>
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 4px rgba(74,128,212,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(74,128,212,0.08); }
        }
      `}</style>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 5rem' }}>

        {/* ── Section A: Hero ── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--fb, #4a80d4) 0%, #764ba2 60%, var(--gold, #a07820) 100%)',
          padding: '2rem 1.5rem 1.5rem',
          borderRadius: '0 0 28px 28px',
          marginBottom: '1.25rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music size={28} color="#fff" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{t('music.title')}</h1>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>{t('music.subtitle')}</p>
              </div>
            </div>
            {user && (
              <button onClick={() => setShowUpload(true)} style={{
                background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 12, padding: '10px 16px', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13,
              }}>
                <Upload size={16} /> {t('music.upload')}
              </button>
            )}
          </div>
        </div>

        {/* ── Section B: Filter bar ── */}
        <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
          {/* Search input */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('music.searchPlaceholder')}
              style={{
                width: '100%', padding: '10px 12px 10px 36px', borderRadius: 12,
                border: '1px solid var(--border, #e2e8f0)', outline: 'none', fontSize: 14,
                background: 'var(--card, #fff)', color: 'var(--text, #333)', boxSizing: 'border-box',
              }}
            />
          </div>
          {/* Genre chips + view toggle */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: 4, alignItems: 'center' }}>
            {genre_chips.map(chip => (
              <button key={chip.key} onClick={() => setActiveGenre(chip.key)} style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: activeGenre === chip.key ? 'var(--fb, #4a80d4)' : 'var(--card, #fff)',
                color: activeGenre === chip.key ? '#fff' : 'var(--text, #555)',
                border: activeGenre === chip.key ? '2px solid var(--fb, #4a80d4)' : '1px solid var(--border, #e2e8f0)',
                transition: 'all 0.2s',
              }}>
                {chip.label}
              </button>
            ))}
            {/* View toggle */}
            <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', gap: 4, background: 'var(--card,#fff)', border: '1px solid var(--border)', borderRadius: 10, padding: 3 }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '5px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? 'var(--fb,#4a80d4)' : 'transparent', color: viewMode === 'grid' ? 'white' : '#888' }}>
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setViewMode('list')} style={{ padding: '5px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: viewMode === 'list' ? 'var(--fb,#4a80d4)' : 'transparent', color: viewMode === 'list' ? 'white' : '#888' }}>
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Section C: Community songs grid ── */}
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          {loadingSongs ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>🎵</div>
          ) : filteredSongs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              <Music size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p style={{ margin: 0 }}>{t('music.noSongs')}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {filteredSongs.map((song, idx) => (
                <SongCard key={song.id} song={song} isPlaying={currentIdx === idx && playing} onPlay={handlePlay} onLike={() => {}} token={token} user={user} t={t} />
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredSongs.map((song, idx) => {
                const isActive = currentIdx === idx && playing;
                return (
                  <div key={song.id} onClick={() => handlePlay(song)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, cursor: 'pointer', background: isActive ? 'rgba(74,128,212,0.08)' : 'var(--card,#fff)', border: isActive ? '1.5px solid var(--fb,#4a80d4)' : '1px solid var(--border,#e2e8f0)', transition: 'all 0.15s' }}>
                    {/* Cover */}
                    <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg,#4a80d4,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {song.cover_url ? <img src={song.cover_url} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎵'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#888' }}>{song.artist || song.user_name} · {song.genre ? t(`music.genre.${song.genre}`, song.genre) : ''}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', color: '#888', flexShrink: 0 }}>
                      <Heart size={12} /> {song.like_count || 0}
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: isActive ? 'var(--fb,#4a80d4)' : 'var(--bg,#f0f4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isActive ? <Pause size={14} color="white" /> : <Play size={14} color="var(--fb,#4a80d4)" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Section D: YouTube Playlists ── */}
        <div style={{ padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text, #1a1a2e)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            ▶️ {t('music.youtubeSection')}
          </h2>

          {/* Info: opens YouTube in new tab */}
          <div style={{ marginBottom: 14, padding: '9px 14px', background: '#f0f5ff', borderRadius: 10, border: '1px solid #dde8fa', fontSize: '0.8rem', color: '#4a80d4', display: 'flex', alignItems: 'center', gap: 7 }}>
            ▶️ {t('music.youtubeNote') || 'Clica numa música para abrir no YouTube'}
          </div>

          {/* YouTube cards — click opens YouTube in new tab (no broken embeds) */}
          {Object.entries(PLAYLISTS).map(([catKey, ytSongs]) => (
            <div key={catKey} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--fb, #4a80d4)', marginBottom: 8 }}>{t(`music.${catKey}`)}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {ytSongs.map(song => (
                  <div
                    key={song.id}
                    onClick={() => openYoutube(song.id)}
                    style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: 'var(--card)', border: '1px solid var(--border)', transition: 'transform 0.15s,box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(74,128,212,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    {/* Thumbnail with play overlay */}
                    <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111' }}>
                      <img
                        src={`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`}
                        alt={song.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      {/* Red YouTube play button overlay */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                          <Play size={16} color="white" fill="white" style={{ marginLeft: 2 }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.78rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--muted,#888)' }}>{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} token={token} />
      )}

      {/* Mini Audio Player */}
      {playerSong && (
        <MiniPlayer
          songs={playerSongs}
          currentIdx={currentIdx}
          setCurrentIdx={(idx) => {
            setCurrentIdx(idx);
            if (playing && playerSongs[idx]) {
              audioRef.current.src = playerSongs[idx].url;
              audioRef.current.play().catch(() => {});
            }
          }}
          audioRef={audioRef}
          playing={playing}
          setPlaying={setPlaying}
        />
      )}
    </>
  );
}
